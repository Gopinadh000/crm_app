import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import db from "../config/db-config.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isAutoMigrationEnabled = () =>
  String(process.env.AUTO_DB_MIGRATION || "").toUpperCase() === "TRUE";

const columnExists = async (tableName, columnName) => {
  const [rows] = await db.query(
    `SHOW COLUMNS FROM \`${tableName}\` LIKE ?`,
    [columnName]
  );
  return rows.length > 0;
};

const executeMigration = async (migrationId, statement) => {
  if (migrationId === "005_users_add_role_if_missing") {
    if (await columnExists("users", "role")) {
      console.log("Column users.role already exists — skipping ALTER.");
      return;
    }
  }

  if (!statement) return;

  try {
    await db.query(statement);
  } catch (err) {
    // Idempotent for older DBs that already have the column
    if (
      migrationId === "005_users_add_role_if_missing" &&
      err.code === "ER_DUP_FIELDNAME"
    ) {
      console.log("Column users.role already exists — treating as applied.");
      return;
    }
    throw err;
  }
};

const markMigrationApplied = async (migrationId) => {
  await db.query(`INSERT INTO migration_history (migration_id) VALUES (?)`, [
    migrationId,
  ]);
};

const isMigrationApplied = async (migrationId) => {
  const [rows] = await db.query(
    `SELECT 1 FROM migration_history WHERE migration_id = ? LIMIT 1`,
    [migrationId]
  );
  return rows.length > 0;
};

export const runMigrations = async () => {
  if (!isAutoMigrationEnabled()) {
    console.log("AUTO_DB_MIGRATION is not TRUE — skipping migration scripts.");
    return;
  }

  try {
    const filePath = path.join(__dirname, "migrations.sql");
    const sql = fs.readFileSync(filePath, "utf-8");
    const lines = sql.split("\n");

    let inMigration = false;
    let currentMigrationId = null;
    let statementBuffer = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const startMatch = trimmed.match(/^<migration-script id="(.+)">$/);

      if (startMatch) {
        if (inMigration) {
          throw new Error("Nested migration-script blocks are not allowed.");
        }
        inMigration = true;
        currentMigrationId = startMatch[1];
        statementBuffer = [];
        continue;
      }

      if (trimmed === "</migration-script>") {
        if (!inMigration) {
          throw new Error("End tag found without a matching start tag.");
        }

        inMigration = false;
        const statement = statementBuffer.join("\n").trim();

        if (currentMigrationId) {
          if (currentMigrationId === "000_create_migration_history") {
            console.log(`MIGRATION SCRIPT EXECUTED: ${currentMigrationId}`);
            await executeMigration(currentMigrationId, statement);

            const alreadyLogged = await isMigrationApplied(currentMigrationId);
            if (!alreadyLogged) {
              await markMigrationApplied(currentMigrationId);
            }
          } else {
            try {
              const alreadyApplied = await isMigrationApplied(currentMigrationId);
              if (alreadyApplied) {
                console.log(`SKIPPED (already applied): ${currentMigrationId}`);
              } else {
                console.log(`MIGRATION SCRIPT EXECUTED: ${currentMigrationId}`);
                await executeMigration(currentMigrationId, statement);
                await markMigrationApplied(currentMigrationId);
              }
            } catch (err) {
              if (err.code === "ER_NO_SUCH_TABLE") {
                throw new Error(
                  "migration_history table does not exist. Make sure 000_create_migration_history runs first."
                );
              }
              throw err;
            }
          }
        }

        currentMigrationId = null;
        statementBuffer = [];
        continue;
      }

      if (inMigration && trimmed) {
        statementBuffer.push(line);
      }
    }

    if (inMigration) {
      throw new Error(
        `File ended but migration-script "${currentMigrationId}" was not closed.`
      );
    }

    console.log("✅ Migrations executed successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err);
    throw err;
  }
};
