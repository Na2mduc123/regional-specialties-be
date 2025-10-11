import { Router } from "express";
import { upload, uploadAvatar } from "../controllers/upload.controller";

const router = Router();

// Endpoint upload avatar
router.post("/", upload.single("file"), uploadAvatar);

export default router;
