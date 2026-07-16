import { runMigrations } from "./migrate.js";

async function runMigrateScript() {
  try {
    await runMigrations();
    process.exit(0);
  } catch {
    process.exit(1);
  }
}

runMigrateScript();
