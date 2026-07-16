import { ReE } from "../utils/Res.utils.js";

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "ADMIN") {
    return ReE(res, {
      message: "Admin access required for this action",
      statusCode: 403,
    });
  }

  return next();
};
