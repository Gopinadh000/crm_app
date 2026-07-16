import multer from "multer";
import { ReE } from "../utils/Res.utils.js";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error("Only JPEG, PNG, WEBP, and GIF images are allowed"));
  }
  return cb(null, true);
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE },
}).single("image");

export const uploadContactImage = (req, res, next) => {
  multerUpload(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return ReE(res, {
          message: "Image must be 2MB or smaller",
        });
      }

      return ReE(res, {
        message: err.message || "Invalid image upload",
      });
    }

    return ReE(res, {
      message: err.message || "Invalid image upload",
    });
  });
};
