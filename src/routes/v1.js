import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  getCurrentUser,
} from "../controllers/auth.controller.js";
import {
  createContact,
  getContacts,
  getContact,
  getContactImage,
  updateContact,
  deleteContact,
} from "../controllers/contacts.controller.js";
import { getActivityLogs } from "../controllers/activitylogs.controller.js";
import { getDashboard } from "../controllers/dashboard.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/requireAdmin.middleware.js";
import { uploadContactImage } from "../middleware/upload.middleware.js";
import { loginRateLimiter } from "../middleware/rate-limit.middleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.send("Test Api Working");
});

router.post("/auth/register", registerUser);
router.post("/auth/login", loginRateLimiter, loginUser);
router.post("/auth/refresh", refreshAccessToken);
router.post("/auth/logout", logoutUser);
router.get("/auth/me", requireAuth, getCurrentUser);

router.get("/dashboard", requireAuth, getDashboard);

router.post(
  "/contact",
  requireAuth,
  requireAdmin,
  uploadContactImage,
  createContact
);
router.get("/contacts", requireAuth, getContacts);
router.get("/contact/:id/image", requireAuth, getContactImage);
router.get("/contact/:id", requireAuth, getContact);
router.put(
  "/contact/:id",
  requireAuth,
  requireAdmin,
  uploadContactImage,
  updateContact
);
router.delete("/contact/:id", requireAuth, requireAdmin, deleteContact);

router.get("/activity-logs", requireAuth, getActivityLogs);

export default router;
