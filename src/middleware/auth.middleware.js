import { ReE } from "../utils/Res.utils.js";
import {
  ACCESS_COOKIE,
  userFromToken,
  verifyAccessToken,
} from "../services/jwt/index.js";

export const requireAuth = (req, res, next) => {
  try {
    const token =
      req.cookies?.[ACCESS_COOKIE] ||
      req.headers.authorization?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return ReE(res, {
        message: "Authentication required",
        statusCode: 401,
      });
    }

    const decoded = verifyAccessToken(token);
    req.user = userFromToken(decoded);

    return next();
  } catch {
    return ReE(res, {
      message: "Invalid or expired access token",
      statusCode: 401,
    });
  }
};
