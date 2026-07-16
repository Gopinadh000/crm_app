import crypto from "crypto";
import jwt from "jsonwebtoken";

/** Build JWT payload from user row — never include password */
export const buildUserPayload = (user) => ({
  sub: user.id,
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  role: user.role || "USER",
  companyName: user.companyName ?? null,
});

export const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * jsonwebtoken only accepts seconds (number) or timespan strings like "15m" / "7d".
 * Env values are trimmed and quote-stripped to avoid dotenv formatting issues.
 */
const resolveExpiresIn = (envValue, fallback) => {
  const cleaned = String(envValue ?? "")
    .trim()
    .replace(/^['"]|['"]$/g, "");

  if (!cleaned) return fallback;

  if (/^\d+$/.test(cleaned)) {
    return Number(cleaned);
  }

  if (/^\d+(\.\d+)?\s*[smhdw]$/i.test(cleaned.replace(/\s+/g, ""))) {
    return cleaned.replace(/\s+/g, "");
  }

  console.warn(
    `Invalid JWT expiresIn "${cleaned}". Falling back to "${fallback}".`
  );
  return fallback;
};

export const signAccessToken = (user) =>
  jwt.sign(buildUserPayload(user), process.env.JWT_ACCESS_SECRET, {
    expiresIn: resolveExpiresIn(process.env.JWT_ACCESS_EXPIRES, "15m"),
  });

export const signRefreshToken = (user) =>
  jwt.sign(buildUserPayload(user), process.env.JWT_REFRESH_SECRET, {
    expiresIn: resolveExpiresIn(process.env.JWT_REFRESH_EXPIRES, "7d"),
  });
