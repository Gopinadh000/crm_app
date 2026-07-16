import jwt from "jsonwebtoken";
import { buildUserPayload } from "./sign.jwt.js";

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

export const decodeToken = (token) => jwt.decode(token);

/** Map verified JWT claims into a safe user object for req.user / responses */
export const userFromToken = (decoded) => {
  if (!decoded) return null;

  return buildUserPayload({
    id: decoded.sub ?? decoded.id,
    firstName: decoded.firstName,
    lastName: decoded.lastName,
    email: decoded.email,
    role: decoded.role || "USER",
    companyName: decoded.companyName ?? null,
  });
};
