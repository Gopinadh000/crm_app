import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import db from "./config/db-config.js";
import { config } from "./config/db-config.js";
import v1Router from "./routes/v1.js";
import { runMigrations } from "./db-scripts/migrate.js";

dotenv.config();

const app = express();

/**
 * Normalize an origin for comparison:
 * - trim whitespace
 * - strip wrapping quotes (common when set in Render/hosting dashboards)
 * - remove trailing slash
 *
 * CORS Origin must be the FRONTEND URL (e.g. https://app-mini-crm.netlify.app),
 * NOT the API URL.
 */
const normalizeOrigin = (value) =>
  String(value ?? "")
    .trim()
    .replace(/^['"]+|['"]+$/g, "")
    .replace(/\/$/, "");

const parseOrigins = (...values) => {
  const origins = new Set();

  values.forEach((value) => {
    String(value ?? "")
      .split(",")
      .map((part) => normalizeOrigin(part))
      .filter(Boolean)
      .forEach((origin) => origins.add(origin));
  });

  return origins;
};

const allowedOrigins = parseOrigins(
  process.env.APP_CORS_ORIGIN_LOCAL,
  process.env.APP_CORS_ORIGIN_PRODUCTION,
  process.env.APP_CORS_ORIGINS
);

console.log(
  "[CORS] Allowed origins:",
  allowedOrigins.size ? [...allowedOrigins].join(", ") : "(none — set APP_CORS_ORIGIN_PRODUCTION)"
);

/**
 * Manual CORS (credentials-safe).
 * Echoes the browser Origin when it is allowlisted.
 */
app.use((req, res, next) => {
  const requestOrigin = req.headers.origin;

  if (requestOrigin) {
    const normalized = normalizeOrigin(requestOrigin);

    if (allowedOrigins.has(normalized)) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET,POST,PUT,PATCH,DELETE,OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.setHeader("Access-Control-Max-Age", "86400");
      res.setHeader("Vary", "Origin");
    } else {
      console.warn(`[CORS] Blocked Origin: ${requestOrigin}`);
      console.warn(
        `[CORS] Allowed list: ${[...allowedOrigins].join(" | ") || "(empty)"}`
      );
      console.warn(
        "[CORS] Tip: APP_CORS_ORIGIN_PRODUCTION must be your Netlify URL, not the API URL."
      );
    }
  }

  // Preflight
  if (req.method === "OPTIONS") {
    if (
      requestOrigin &&
      !allowedOrigins.has(normalizeOrigin(requestOrigin))
    ) {
      return res.status(403).json({
        status: false,
        message:
          "CORS origin not allowed. Set APP_CORS_ORIGIN_PRODUCTION to your frontend Origin (Netlify URL).",
        receivedOrigin: requestOrigin,
        allowedOrigins: [...allowedOrigins],
      });
    }
    return res.sendStatus(204);
  }

  next();
});

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
      console.log(
        `[CORS] Ready. Production frontend should be listed above (e.g. https://app-mini-crm.netlify.app).`
      );
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
