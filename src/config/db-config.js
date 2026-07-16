import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import { DB_CREDIENTAILS_CONFIG } from "./db-data.js";

dotenv.config();

/**
 * Resolve app environment.
 * Prefer APP_ENV=PROD on deploy. Also treat NODE_ENV=production / Render as PROD
 * so production doesn't accidentally fall back to DEV credentials.
 */
const resolveAppEnv = () => {
  const explicit = (process.env.APP_ENV || "").trim().toUpperCase();

  if (explicit === "PROD" || explicit === "PRODUCTION") return "PROD";
  if (explicit === "DEV" || explicit === "DEVELOPMENT") return "DEV";

  const nodeEnv = String(process.env.NODE_ENV || "").toLowerCase();
  const onRender =
    String(process.env.RENDER || "").toLowerCase() === "true" ||
    Boolean(process.env.RENDER_SERVICE_ID);

  if (nodeEnv === "production" || onRender) return "PROD";

  return "DEV";
};

const getDbConfig = () => {
  const appEnv = resolveAppEnv();
  const config = DB_CREDIENTAILS_CONFIG[appEnv];

  if (!config) {
    throw new Error(
      `Database configuration not found for environment: ${appEnv}. Use DEV or PROD.`
    );
  }

  const required = ["HOST", "USERNAME", "PASSWORD", "DATABASE"];
  const missing = required.filter((key) => !config[key]);

  if (missing.length) {
    const prefix = appEnv === "PROD" ? "APP_DB_PROD_" : "APP_DB_DEV_";
    const envKeyByField = {
      HOST: "HOST",
      USERNAME: "USER",
      PASSWORD: "PASSWORD",
      DATABASE: "NAME",
    };
    throw new Error(
      `Missing DB env vars for ${appEnv}: ${missing
        .map((key) => `${prefix}${envKeyByField[key]}`)
        .join(", ")}. Set APP_ENV=${appEnv} and configure those variables in the host.`
    );
  }

  console.log(`Using ${appEnv} database config (${config.DATABASE}@${config.HOST})`);
  return config;
};

export const config = getDbConfig();

const db = mysql2.createPool({
  host: config.HOST,
  port: config.PORT,
  user: config.USERNAME,
  password: config.PASSWORD,
  database: config.DATABASE,
  ssl: config.ssl || undefined,
});

export default db;
