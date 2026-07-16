import db from "../config/db-config.js";

/**
 * Persist an activity log entry. Failures are logged but never thrown,
 * so they cannot break the primary business action.
 */
export const createActivityLog = async ({
  userId,
  action,
  entityType,
  entityId = null,
  description,
  metadata = null,
}) => {
  if (!userId || !action || !entityType || !description) return;

  try {
    const metadataValue =
      metadata == null ? null : JSON.stringify(metadata);

    await db.execute(
      `INSERT INTO activity_logs
        (user_id, action, entity_type, entity_id, description, metadata)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        userId,
        String(action).toUpperCase(),
        String(entityType).toUpperCase(),
        entityId,
        description.slice(0, 500),
        metadataValue,
      ]
    );
  } catch (error) {
    console.error("createActivityLog error:", error);
  }
};
