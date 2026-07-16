import db from "../config/db-config.js";
import { ReE, ReS } from "../utils/Res.utils.js";

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    const [[usersCount]] = await db.execute(
      `SELECT COUNT(*) AS total FROM users`
    );

    const [[leadsCount]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM contacts
       WHERE status = 'Lead'`
    );

    const [[prospectsCount]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM contacts
       WHERE status = 'Prospect'`
    );

    const [[customersCount]] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM contacts
       WHERE status = 'Customer'`
    );

    const [recentContacts] = await db.execute(
      `SELECT
         c.id,
         c.first_name AS firstName,
         c.last_name AS lastName,
         c.email,
         c.company_name AS companyName,
         c.status,
         c.created_at AS createdAt,
         ui.mime_type AS imageMimeType,
         ui.image_blob AS imageBlob
       FROM contacts c
       LEFT JOIN userimages ui ON ui.contact_id = c.id
       ORDER BY c.created_at DESC, c.id DESC
       LIMIT 5`
    );

    const mappedRecentContacts = recentContacts.map((row) => {
      const { imageBlob, imageMimeType, ...contact } = row;
      let image = null;
      if (imageBlob && imageMimeType) {
        const buffer = Buffer.isBuffer(imageBlob)
          ? imageBlob
          : Buffer.from(imageBlob);
        image = `data:${imageMimeType};base64,${buffer.toString("base64")}`;
      }
      return { ...contact, image };
    });

    return ReS(res, {
      message: "Dashboard data fetched successfully",
      data: {
        stats: {
          totalUsers: Number(usersCount?.total || 0),
          totalLeads: Number(leadsCount?.total || 0),
          totalProspects: Number(prospectsCount?.total || 0),
          totalCustomers: Number(customersCount?.total || 0),
        },
        recentContacts: mappedRecentContacts,
      },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    return ReE(res, {
      message: "Unable to fetch dashboard data. Please try again later.",
      statusCode: 500,
    });
  }
};
