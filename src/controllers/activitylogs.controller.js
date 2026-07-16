import db from "../config/db-config.js";
import { ReE, ReS } from "../utils/Res.utils.js";

const LOG_SELECT = `
  al.id,
  al.user_id AS userId,
  al.action,
  al.entity_type AS entityType,
  al.entity_id AS entityId,
  al.description,
  al.metadata,
  al.created_at AS createdAt,
  u.first_name AS userFirstName,
  u.last_name AS userLastName,
  u.email AS userEmail
`;

const parseMetadata = (value) => {
  if (value == null) return null;
  if (typeof value === "object") return value;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const mapLogRow = (row) => {
  if (!row) return null;
  return {
    ...row,
    metadata: parseMetadata(row.metadata),
    userName: `${row.userFirstName || ""} ${row.userLastName || ""}`.trim(),
  };
};

export const getActivityLogs = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return ReE(res, { message: "Authentication required", statusCode: 401 });
    }

    const page = Math.max(
      1,
      Number.parseInt(String(req.query.page ?? "1"), 10) || 1
    );
    const limit = Math.min(
      50,
      Math.max(1, Number.parseInt(String(req.query.limit ?? "10"), 10) || 10)
    );
    const search = String(req.query.search ?? "").trim();

    const whereClauses = [];
    const params = [];

    if (search) {
      const like = `%${search}%`;
      whereClauses.push(`(
        al.action LIKE ?
        OR al.entity_type LIKE ?
        OR al.description LIKE ?
        OR CONCAT(u.first_name, ' ', u.last_name) LIKE ?
      )`);
      params.push(like, like, like, like);
    }

    const whereSql = whereClauses.length
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    const [countRows] = await db.execute(
      `SELECT COUNT(*) AS total
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}`,
      params
    );

    const total = Number(countRows[0]?.total || 0);
    const totalPages = Math.max(1, Math.ceil(total / limit) || 1);
    const safePage = Math.min(page, totalPages);
    const safeOffset = (safePage - 1) * limit;

    const [rows] = await db.execute(
      `SELECT ${LOG_SELECT}
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${whereSql}
       ORDER BY al.created_at DESC, al.id DESC
       LIMIT ${safeOffset}, ${limit}`,
      params
    );

    return ReS(res, {
      message: "Activity logs fetched successfully",
      data: {
        logs: rows.map(mapLogRow),
        pagination: {
          page: safePage,
          limit,
          total,
          totalPages,
        },
      },
    });
  } catch (error) {
    console.error("getActivityLogs error:", error);
    return ReE(res, {
      message: "Unable to fetch activity logs. Please try again later.",
      statusCode: 500,
    });
  }
};
