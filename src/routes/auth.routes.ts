import { Router } from "express";
import {
  register,
  login,
  logout,
  getProfile,
  updateUser,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", authMiddleware, getProfile); // Router lấy thông tin tài khoản để hiện thị lên FE
router.put("/users/:id", authMiddleware, updateUser);

export default router;
