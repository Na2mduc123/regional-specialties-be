import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyAdmin } from "../middlewares/verifyAdmin";

const router = express.Router();

// ---- Cấu hình thư mục upload ----
const uploadDir = path.join(__dirname, "../../upload");

// Tạo folder nếu chưa có
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("📂 Đã tạo thư mục upload tại:", uploadDir);
}

// ---- Cấu hình Multer ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Chỉ chấp nhận file ảnh!"));
    }
    cb(null, true);
  },
});

// ---- Serve folder upload public ----
// Đặt trong file server chính (app.ts / server.ts) khi khởi tạo app:
// app.use("/uploads", express.static(path.join(__dirname, "../../upload")));
// Nếu muốn gộp trong file này cũng được:
router.use("/uploads", express.static(uploadDir));

// ---- Endpoint upload ảnh sản phẩm (admin-only) ----
router.post(
  "/imgproduct",
  authMiddleware,
  verifyAdmin,
  upload.single("image"),
  (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Vui lòng chọn file ảnh!" });
      }

      // Lấy base URL từ env hoặc mặc định localhost
      const baseUrl = process.env.BASE_URL || "http://localhost:5000";

      // Trả về URL đầy đủ
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      console.log("✅ Ảnh upload thành công:", imageUrl);

      res.status(200).json({ url: imageUrl });
    } catch (error: any) {
      console.error("❌ Lỗi upload ảnh:", error.message);
      res.status(500).json({
        message: "Lỗi khi upload ảnh",
        error: error.message,
      });
    }
  }
);

export default router;
