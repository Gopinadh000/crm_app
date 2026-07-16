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

const allowedOrigins = [
  process.env.APP_CORS_ORIGIN_LOCAL,
  process.env.APP_CORS_ORIGIN_PRODUCTION,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser clients (Postman, curl) with no Origin header
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/api/v1", v1Router);

const port = process.env.APP_PORT || 3001;

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
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
};

startServer();
