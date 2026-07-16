import db from "../config/db-config.js";
import { ReE, ReS } from "../utils/Res.utils.js";
import { createActivityLog } from "../services/activity-log.service.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_STATUSES = new Set(["Lead", "Prospect", "Customer"]);
const PAGE_SIZE = 10;

const CONTACT_SELECT = `
  c.id,
  c.user_id AS userId,
  c.first_name AS firstName,
  c.last_name AS lastName,
  c.email,
  c.phone,
  c.company_name AS companyName,
  c.job_title AS jobTitle,
  c.status,
  c.notes,
  c.created_at AS createdAt,
  c.updated_at AS updatedAt,
  ui.id AS imageId,
  ui.mime_type AS imageMimeType,
  ui.image_blob AS imageBlob
`;

const normalizeContactPayload = (body = {}) => {
  const firstName = body.firstName?.trim();
  const lastName = body.lastName?.trim();
  const email = body.email?.trim()?.toLowerCase() || null;
  const phone = body.phone?.trim() || null;
  const companyName = body.companyName?.trim() || null;
  const jobTitle = body.jobTitle?.trim() || null;
  const status = body.status?.trim() || "Lead";
  const notes = body.notes?.trim() || null;
  const removeImage =
    body.removeImage === true ||
    body.removeImage === "true" ||
    body.removeImage === "1";

  return {
    firstName,
    lastName,
    email,
    phone,
    companyName,
    jobTitle,
    status,
    notes,
    removeImage,
  };
};

const validateContactPayload = ({ firstName, lastName, email, status }) => {
  if (!firstName || !lastName) {
    return "First name and last name are required";
  }

  if (email && !EMAIL_REGEX.test(email)) {
    return "Please provide a valid email address";
  }

  if (!CONTACT_STATUSES.has(status)) {
    return "Status must be Lead, Prospect, or Customer";
  }

  return null;
};

const toImageDataUrl = (mimeType, imageBlob) => {
  if (!imageBlob || !mimeType) return null;
  const buffer = Buffer.isBuffer(imageBlob)
    ? imageBlob
    : Buffer.from(imageBlob);
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
};

const mapContactRow = (row) => {
  if (!row) return null;

  const { imageBlob, imageMimeType, imageId, ...contact } = row;
  return {
    ...contact,
    hasImage: Boolean(imageId),
    image: toImageDataUrl(imageMimeType, imageBlob),
  };
};

const fetchContactById = async (contactId) => {
  const [rows] = await db.execute(
    `SELECT ${CONTACT_SELECT}
     FROM contacts c
     LEFT JOIN userimages ui ON ui.contact_id = c.id
     WHERE c.id = ?
     LIMIT 1`,
    [contactId]
  );

  return mapContactRow(rows[0]);
};

const upsertContactImage = async (userId, contactId, file) => {
  if (!file?.buffer) return;

  const [existing] = await db.execute(
    `SELECT id FROM userimages WHERE contact_id = ? LIMIT 1`,
    [contactId]
  );

  if (existing[0]) {
    await db.execute(
      `UPDATE userimages
       SET user_id = ?, file_name = ?, mime_type = ?, image_blob = ?
       WHERE id = ?`,
      [
        userId,
        file.originalname || "contact-image",
        file.mimetype,
        file.buffer,
        existing[0].id,
      ]
    );
    return;
  }

  await db.execute(
    `INSERT INTO userimages (user_id, contact_id, file_name, mime_type, image_blob)
     VALUES (?, ?, ?, ?, ?)`,
    [
      userId,
      contactId,
      file.originalname || "contact-image",
      file.mimetype,
      file.buffer,
    ]
  );
};

const removeContactImage = async (contactId) => {
  await db.execute(`DELETE FROM userimages WHERE contact_id = ?`, [contactId]);
};

export const createContact = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    const payload = normalizeContactPayload(req.body);
    const validationError = validateContactPayload(payload);
    if (validationError) {
      return ReE(res, { message: validationError });
    }

    const [result] = await db.execute(
      `INSERT INTO contacts
        (user_id, first_name, last_name, email, phone, company_name, job_title, status, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.phone,
        payload.companyName,
        payload.jobTitle,
        payload.status,
        payload.notes,
      ]
    );

    if (req.file) {
      await upsertContactImage(userId, result.insertId, req.file);
    }

    const contact = await fetchContactById(result.insertId);

    await createActivityLog({
      userId,
      action: "CREATE",
      entityType: "CONTACT",
      entityId: result.insertId,
      description: `Created contact "${payload.firstName} ${payload.lastName}"`,
      metadata: {
        email: payload.email,
        companyName: payload.companyName,
        status: payload.status,
        hasImage: Boolean(req.file),
      },
    });

    return ReS(res, {
      message: "Contact created successfully",
      statusCode: 201,
      data: contact,
    });
  } catch (error) {
    console.error("createContact error:", error);
    return ReE(res, {
      message: "Unable to create contact. Please try again later.",
      statusCode: 500,
    });
  }
};

export const getContacts = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    const page = Math.max(
      1,
      Number.parseInt(String(req.query.page ?? "1"), 10) || 1
    );
    // Requirement: exactly 10 items per page
    const limit = PAGE_SIZE;
    const search = String(req.query.search ?? "").trim();
    const status = String(req.query.status ?? "").trim();

    const whereClauses = [];
    const params = [];

    if (search) {
      const like = `%${search}%`;
      whereClauses.push(`(
        c.first_name LIKE ?
        OR c.last_name LIKE ?
        OR CONCAT(c.first_name, ' ', c.last_name) LIKE ?
        OR c.email LIKE ?
      )`);
      params.push(like, like, like, like);
    }

    if (status) {
      if (!CONTACT_STATUSES.has(status)) {
        return ReE(res, {
          message: "Status filter must be Lead, Prospect, or Customer",
        });
      }
      whereClauses.push("c.status = ?");
      params.push(status);
    }

    const whereSql = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM contacts c
       ${whereSql}`,
      params
    );

    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    const safePage = Math.min(page, totalPages);
    const safeOffset = (safePage - 1) * limit;

    const [rows] = await db.execute(
      `SELECT ${CONTACT_SELECT}
       FROM contacts c
       LEFT JOIN userimages ui ON ui.contact_id = c.id
       ${whereSql}
       ORDER BY c.updated_at DESC, c.id DESC
       LIMIT ${safeOffset}, ${limit}`,
      params
    );

    return ReS(res, {
      message: "Contacts fetched successfully",
      data: {
        contacts: rows.map(mapContactRow),
        pagination: {
          page: safePage,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("getContacts error:", error);
    return ReE(res, {
      message: "Unable to fetch contacts. Please try again later.",
      statusCode: 500,
    });
  }
};

export const getContact = async (req, res) => {
  try {
    const userId = req.user?.id;
    const contactId = Number(req.params.id);

    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    if (!Number.isInteger(contactId) || contactId <= 0) {
      return ReE(res, { message: "Invalid contact id" });
    }

    const contact = await fetchContactById(contactId);

    if (!contact) {
      return ReE(res, { message: "Contact not found", statusCode: 404 });
    }

    return ReS(res, {
      message: "Contact fetched successfully",
      data: contact,
    });
  } catch (error) {
    console.error("getContact error:", error);
    return ReE(res, {
      message: "Unable to fetch contact. Please try again later.",
      statusCode: 500,
    });
  }
};

export const getContactImage = async (req, res) => {
  try {
    const userId = req.user?.id;
    const contactId = Number(req.params.id);

    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    if (!Number.isInteger(contactId) || contactId <= 0) {
      return ReE(res, { message: "Invalid contact id" });
    }

    const [rows] = await db.execute(
      `SELECT ui.mime_type AS mimeType, ui.image_blob AS imageBlob
       FROM userimages ui
       INNER JOIN contacts c ON c.id = ui.contact_id
       WHERE ui.contact_id = ?
       LIMIT 1`,
      [contactId]
    );

    const image = rows[0];
    if (!image?.imageBlob) {
      return ReE(res, { message: "Image not found", statusCode: 404 });
    }

    const buffer = Buffer.isBuffer(image.imageBlob)
      ? image.imageBlob
      : Buffer.from(image.imageBlob);

    res.setHeader("Content-Type", image.mimeType || "application/octet-stream");
    res.setHeader("Cache-Control", "private, max-age=300");
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("getContactImage error:", error);
    return ReE(res, {
      message: "Unable to fetch contact image. Please try again later.",
      statusCode: 500,
    });
  }
};

export const updateContact = async (req, res) => {
  try {
    const userId = req.user?.id;
    const contactId = Number(req.params.id);

    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    if (!Number.isInteger(contactId) || contactId <= 0) {
      return ReE(res, { message: "Invalid contact id" });
    }

    const payload = normalizeContactPayload(req.body);
    const validationError = validateContactPayload(payload);
    if (validationError) {
      return ReE(res, { message: validationError });
    }

    const [result] = await db.execute(
      `UPDATE contacts
       SET first_name = ?,
           last_name = ?,
           email = ?,
           phone = ?,
           company_name = ?,
           job_title = ?,
           status = ?,
           notes = ?
       WHERE id = ?`,
      [
        payload.firstName,
        payload.lastName,
        payload.email,
        payload.phone,
        payload.companyName,
        payload.jobTitle,
        payload.status,
        payload.notes,
        contactId,
      ]
    );

    if (result.affectedRows === 0) {
      return ReE(res, { message: "Contact not found", statusCode: 404 });
    }

    if (req.file) {
      await upsertContactImage(userId, contactId, req.file);
    } else if (payload.removeImage) {
      await removeContactImage(contactId);
    }

    const contact = await fetchContactById(contactId);

    await createActivityLog({
      userId,
      action: "UPDATE",
      entityType: "CONTACT",
      entityId: contactId,
      description: `Updated contact "${payload.firstName} ${payload.lastName}"`,
      metadata: {
        email: payload.email,
        companyName: payload.companyName,
        status: payload.status,
        imageUpdated: Boolean(req.file),
        imageRemoved: Boolean(payload.removeImage && !req.file),
      },
    });

    return ReS(res, {
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    console.error("updateContact error:", error);
    return ReE(res, {
      message: "Unable to update contact. Please try again later.",
      statusCode: 500,
    });
  }
};

export const deleteContact = async (req, res) => {
  try {
    const userId = req.user?.id;
    const contactId = Number(req.params.id);

    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    if (!Number.isInteger(contactId) || contactId <= 0) {
      return ReE(res, { message: "Invalid contact id" });
    }

    const [existingRows] = await db.execute(
      `SELECT id, first_name AS firstName, last_name AS lastName, email
       FROM contacts
       WHERE id = ?
       LIMIT 1`,
      [contactId]
    );

    const existing = existingRows[0];
    if (!existing) {
      return ReE(res, { message: "Contact not found", statusCode: 404 });
    }

    const [result] = await db.execute(`DELETE FROM contacts WHERE id = ?`, [
      contactId,
    ]);

    if (result.affectedRows === 0) {
      return ReE(res, { message: "Contact not found", statusCode: 404 });
    }

    await createActivityLog({
      userId,
      action: "DELETE",
      entityType: "CONTACT",
      entityId: contactId,
      description: `Deleted contact "${existing.firstName} ${existing.lastName}"`,
      metadata: {
        email: existing.email,
      },
    });

    return ReS(res, {
      message: "Contact deleted successfully",
      data: { id: contactId },
    });
  } catch (error) {
    console.error("deleteContact error:", error);
    return ReE(res, {
      message: "Unable to delete contact. Please try again later.",
      statusCode: 500,
    });
  }
};
