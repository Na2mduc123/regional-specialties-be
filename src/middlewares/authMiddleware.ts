import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

export interface AuthRequest extends Request {
  user?: JwtPayload | string;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    // Lấy header Authorization: Bearer <token>
    const authHeader = req.headers["authorization"];
    console.log("👉 Auth header FE gửi lên:", authHeader);

    if (!authHeader) {
      return res.status(401).json({ message: "Thiếu Authorization header" });
    }

    // Tách token
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res
        .status(401)
        .json({ message: "Authorization header phải có dạng: Bearer <token>" });
    }

    const token = parts[1];

    // Xác thực token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Gắn user đã decode vào req để controller dùng
    req.user = decoded;

    next();
  } catch (error: any) {
    return res
      .status(403)
      .json({
        message: "Token không hợp lệ hoặc đã hết hạn",
        error: error.message,
      });
  }
};
