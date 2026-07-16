import bcrypt from "bcryptjs";
import db from "../config/db-config.js";
import { ReE, ReS } from "../utils/Res.utils.js";
import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  clearAuthCookies,
  decodeToken,
  hashToken,
  setAuthCookies,
  signAccessToken,
  signRefreshToken,
  userFromToken,
  verifyRefreshToken,
} from "../services/jwt/index.js";
import { createActivityLog } from "../services/activity-log.service.js";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SALT_ROUNDS = 12;
const ALLOWED_ROLES = new Set(["ADMIN", "USER"]);

const USER_PUBLIC_SELECT = `
  id,
  first_name AS firstName,
  last_name AS lastName,
  email,
  role,
  company_name AS companyName,
  created_at AS createdAt,
  updated_at AS updatedAt
`;

const issueTokens = async (user, res) => {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const refreshTokenHash = hashToken(refreshToken);

  await db.execute(`UPDATE users SET refresh_token = ? WHERE id = ?`, [
    refreshTokenHash,
    user.id,
  ]);

  setAuthCookies(res, accessToken, refreshToken);

  return { accessToken, refreshToken };
};

export const registerUser = async (req, res) => {
  try {
    const firstName = req.body?.firstName?.trim();
    const lastName = req.body?.lastName?.trim();
    const email = req.body?.email?.trim()?.toLowerCase();
    const password = req.body?.password;
    const companyName = req.body?.companyName?.trim() || null;
    const role = String(req.body?.role || "USER").trim().toUpperCase();

    if (!firstName || !lastName || !email || !password) {
      return ReE(res, {
        message: "First name, last name, email, and password are required",
      });
    }

    if (!ALLOWED_ROLES.has(role)) {
      return ReE(res, {
        message: "Role must be ADMIN or USER",
      });
    }

    if (!EMAIL_REGEX.test(email)) {
      return ReE(res, { message: "Please provide a valid email address" });
    }

    if (password.length < 8) {
      return ReE(res, {
        message: "Password must be at least 8 characters long",
      });
    }

    const [existingUsers] = await db.execute(
      `SELECT id FROM users WHERE email = ? LIMIT 1`,
      [email]
    );

    if (existingUsers.length > 0) {
      return ReE(res, {
        message: "An account with this email already exists",
        statusCode: 409,
      });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [result] = await db.execute(
      `INSERT INTO users (first_name, last_name, email, password, role, company_name)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, hashedPassword, role, companyName]
    );

    const [rows] = await db.execute(
      `SELECT ${USER_PUBLIC_SELECT} FROM users WHERE id = ? LIMIT 1`,
      [result.insertId]
    );

    await createActivityLog({
      userId: result.insertId,
      action: "REGISTER",
      entityType: "AUTH",
      entityId: result.insertId,
      description: `Registered account for ${email}`,
      metadata: { email, companyName, role },
    });

    return ReS(res, {
      message: "User registered successfully",
      statusCode: 201,
      data: rows[0],
    });
  } catch (error) {
    if (error?.code === "ER_DUP_ENTRY") {
      return ReE(res, {
        message: "An account with this email already exists",
        statusCode: 409,
      });
    }

    console.error("registerUser error:", error);
    return ReE(res, {
      message: "Unable to register user. Please try again later.",
      statusCode: 500,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const email = req.body?.email?.trim()?.toLowerCase();
    const password = req.body?.password;

    if (!email || !password) {
      return ReE(res, { message: "Email and password are required" });
    }

    const [rows] = await db.execute(
      `SELECT
         id,
         first_name AS firstName,
         last_name AS lastName,
         email,
         password,
         role,
         company_name AS companyName,
         created_at AS createdAt,
         updated_at AS updatedAt
       FROM users
       WHERE email = ?
       LIMIT 1`,
      [email]
    );

    const user = rows[0];

    if (!user) {
      return ReE(res, {
        message: "Invalid email or password",
        statusCode: 401,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return ReE(res, {
        message: "Invalid email or password",
        statusCode: 401,
      });
    }

    const { password: _password, ...safeUser } = user;
    await issueTokens(safeUser, res);

    await createActivityLog({
      userId: safeUser.id,
      action: "LOGIN",
      entityType: "AUTH",
      entityId: safeUser.id,
      description: `Logged in as ${safeUser.email}`,
      metadata: { email: safeUser.email },
    });

    return ReS(res, {
      message: "Login successful",
      data: safeUser,
    });
  } catch (error) {
    console.error("loginUser error:", error);
    return ReE(res, {
      message: "Unable to login. Please try again later.",
      statusCode: 500,
    });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];

    if (!refreshToken) {
      return ReE(res, {
        message: "Refresh token missing",
        statusCode: 401,
      });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      clearAuthCookies(res);
      return ReE(res, {
        message: "Invalid or expired refresh token",
        statusCode: 401,
      });
    }

    const refreshTokenHash = hashToken(refreshToken);
    const userFromJwt = userFromToken(decoded);

    const [rows] = await db.execute(
      `SELECT id, refresh_token AS refreshToken
       FROM users
       WHERE id = ?
       LIMIT 1`,
      [userFromJwt.id]
    );

    const dbUser = rows[0];

    if (
      !dbUser ||
      !dbUser.refreshToken ||
      dbUser.refreshToken !== refreshTokenHash
    ) {
      clearAuthCookies(res);
      return ReE(res, {
        message: "Refresh token revoked or invalid",
        statusCode: 401,
      });
    }

    // Prefer fresh profile from DB so JWT stays accurate after profile updates
    const [profileRows] = await db.execute(
      `SELECT ${USER_PUBLIC_SELECT} FROM users WHERE id = ? LIMIT 1`,
      [userFromJwt.id]
    );

    const safeUser = profileRows[0] || userFromJwt;
    await issueTokens(safeUser, res);

    return ReS(res, {
      message: "Token refreshed successfully",
      data: safeUser,
    });
  } catch (error) {
    console.error("refreshAccessToken error:", error);
    return ReE(res, {
      message: "Unable to refresh token. Please try again later.",
      statusCode: 500,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    const accessToken = req.cookies?.[ACCESS_COOKIE];

    let userId = null;

    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        userId = userFromToken(decoded)?.id ?? null;
      } catch {
        // ignore — still clear cookies
      }
    }

    if (!userId && accessToken) {
      userId = userFromToken(decodeToken(accessToken))?.id ?? null;
    }

    if (userId) {
      await db.execute(`UPDATE users SET refresh_token = NULL WHERE id = ?`, [
        userId,
      ]);

      await createActivityLog({
        userId,
        action: "LOGOUT",
        entityType: "AUTH",
        entityId: userId,
        description: "Logged out",
      });
    }

    clearAuthCookies(res);

    return ReS(res, { message: "Logout successful" });
  } catch (error) {
    console.error("logoutUser error:", error);
    clearAuthCookies(res);
    return ReE(res, {
      message: "Unable to logout cleanly",
      statusCode: 500,
    });
  }
};

export const getCurrentUser = async (req, res) => {
  // User profile already embedded in access JWT
  return ReS(res, {
    message: "User fetched successfully",
    data: req.user,
  });
};
