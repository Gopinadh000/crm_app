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

// CORS — allow credentials for cookie-based auth
// Origins come from .env (frontend URLs only — not the API URL)
const normalizeOrigin = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\/$/, "");

const allowedOrigins = [
  process.env.APP_CORS_ORIGIN_LOCAL,
  process.env.APP_CORS_ORIGIN_PRODUCTION,
  ...(String(process.env.APP_CORS_ORIGINS || "").split(",")),
]
  .map(normalizeOrigin)
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser clients (Postman, curl) with no Origin header
      if (!origin || allowedOrigins.includes(normalizeOrigin(origin))) {
        return callback(null, true);
      }
      console.warn(`[CORS] Blocked origin: ${origin}`);
      console.warn(`[CORS] Allowed: ${allowedOrigins.join(", ") || "(none)"}`);
      return callback(new Error("Not allowed by CORS"));
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

// Render/hosting platforms inject PORT; fall back to APP_PORT locally
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
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
