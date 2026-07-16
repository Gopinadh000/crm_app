import rateLimit from "express-rate-limit";
import { ReE } from "../utils/Res.utils.js";

/** Login: max 3 requests per 10 minutes (per IP) */
export const loginRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) =>
    ReE(res, {
      message:
        "Too many login attempts. Please try again after 10 minutes.",
      statusCode: 429,
    }),
});
