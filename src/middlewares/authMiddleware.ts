import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

export interface AuthRequest extends Request {
  user?: JwtPayload & { id?: number; username?: string }; // tiện lấy id
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers["authorization"];
    console.log("👉 Auth header FE gửi lên:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Thiếu Authorization header" });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Authorization header phải có dạng: Bearer <token>" });
    }

    const token = parts[1];

    // ✅ Kiểm tra và giải mã token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.user = decoded; // gắn user info vào request
    next();
  } catch (error: any) {
    // ✅ Nếu token hết hạn
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({
        message: "Token đã hết hạn",
        error: "jwt expired",
      });
    }

    // ✅ Nếu token sai hoặc không giải mã được
    return res.status(403).json({
      message: "Token không hợp lệ",
      error: error.message,
    });
  }
};
