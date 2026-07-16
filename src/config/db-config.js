import mysql2 from "mysql2/promise";
import dotenv from "dotenv";
import { DB_CREDIENTAILS_CONFIG } from "./db-data.js";

dotenv.config();

const getDbConfig = () => {
  const appEnv = (process.env.APP_ENV || "DEV").trim().toUpperCase();
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
        .join(", ")}`
    );
  }

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
