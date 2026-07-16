import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import db from "./config/db-config.js";
import { config } from "./config/db-config.js";
import v1Router from "./routes/v1.js";
import { runMigrations } from "./db-scripts/migrate.js";

dotenv.config();

const app = express();

const normalizeOrigin = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\/$/, "");

// Hardcoded production / local frontend origins (CORS = browser Origin, not API URL)
const HARDCODED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://app-mini-crm.netlify.app",
];

const NETLIFY_SITE_HOST = "app-mini-crm.netlify.app";

const allowedOrigins = [
  ...HARDCODED_ORIGINS,
  process.env.APP_CORS_ORIGIN_LOCAL,
  process.env.APP_CORS_ORIGIN_PRODUCTION,
  ...(String(process.env.APP_CORS_ORIGINS || "").split(",")),
]
  .map(normalizeOrigin)
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  const normalized = normalizeOrigin(origin);
  if (allowedOrigins.includes(normalized)) return true;

  try {
    const host = new URL(normalized).hostname;
    // Netlify deploy previews: <id>--app-mini-crm.netlify.app
    return host === NETLIFY_SITE_HOST || host.endsWith(`--${NETLIFY_SITE_HOST}`);
  } catch {
    return false;
  }
};

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked origin: ${origin}`);
      console.warn(`[CORS] Allowed: ${allowedOrigins.join(", ")}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", v1Router);

const port = Number(process.env.PORT || process.env.APP_PORT || 3001);

const startServer = async () => {
  try {
    const conn = await db.getConnection();
    console.log("Connected to the database", config?.DATABASE);
    conn.release();

    if (String(process.env.AUTO_DB_MIGRATION || "").toUpperCase() === "TRUE") {
      console.log("AUTO_DB_MIGRATION=TRUE — running SQL migration scripts...");
      await runMigrations();
    } else {
      console.log("AUTO_DB_MIGRATION is not TRUE — skipping SQL migrations.");
    }

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log(`[CORS] Allowed origins: ${allowedOrigins.join(", ")}`);
      console.log(
        `[CORS] Also allowing Netlify previews: *--${NETLIFY_SITE_HOST}`
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
