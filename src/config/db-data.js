import dotenv from "dotenv";

dotenv.config();

const env = (key, fallback) => {
  const value = process.env[key];
  if (value === undefined || value === "") {
    return fallback;
  }
  return value;
};

/**
 * Pick DB credentials by APP_ENV.
 * - DEV  -> APP_DB_DEV_*
 * - PROD -> APP_DB_PROD_*
 * On deploy: set APP_ENV=PROD and configure only APP_DB_PROD_* vars.
 */
export const DB_CREDIENTAILS_CONFIG = {
  DEV: {
    HOST: env("APP_DB_DEV_HOST"),
    PORT: Number(env("APP_DB_DEV_PORT", "3306")),
    USERNAME: env("APP_DB_DEV_USER"),
    PASSWORD: env("APP_DB_DEV_PASSWORD"),
    DATABASE: env("APP_DB_DEV_NAME"),
    ssl: false,
  },
  PROD: {
    HOST: env("APP_DB_PROD_HOST"),
    PORT: Number(env("APP_DB_PROD_PORT", "3306")),
    USERNAME: env("APP_DB_PROD_USER"),
    PASSWORD: env("APP_DB_PROD_PASSWORD"),
    DATABASE: env("APP_DB_PROD_NAME"),
    ssl: env("APP_DB_PROD_SSL", "false") === "true",
  },
};
