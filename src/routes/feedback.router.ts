import express from "express";
import { FeedbackController } from "../controllers/feedback.controller";
import { authMiddleware } from "../middlewares/authMiddleware";
import { verifyAdmin } from "../middlewares/verifyAdmin";

const router = express.Router();

// 📝 Gửi đánh giá (chỉ người đăng nhập mới gửi được)
router.post("/", authMiddleware, FeedbackController.create);

// 📋 Lấy tất cả đánh giá (public)
router.get("/", FeedbackController.getAll);

// 👤 Lấy đánh giá theo user ID (public)
router.get("/user/:id", FeedbackController.getByUser);

// ❌ Xóa đánh giá (chỉ admin mới được — có thể gắn thêm middleware checkRole)
router.delete("/:id", authMiddleware, verifyAdmin, FeedbackController.delete);

export default router;
