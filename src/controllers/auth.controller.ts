import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "../database";
import { User } from "../model/user.model";
import dotenv from "dotenv";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || "defaultsecret";

// Hàm sinh ID ngẫu nhiên 5 số
const generateId = async (): Promise<string> => {
  let id: string;
  let exists = true;

  do {
    id = Math.floor(10000 + Math.random() * 90000).toString(); // Random 5 số
    const [rows] = await db.query("SELECT id FROM users WHERE id = ?", [id]);
    exists = (rows as any[]).length > 0;
  } while (exists);

  return id;
};

// Đăng ký
export const register = async (req: Request, res: Response) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập đầy đủ thông tin" });
    }

    // Kiểm tra username hoặc email đã tồn tại
    const [existing] = await db.query(
      "SELECT id FROM users WHERE username = ? OR email = ?",
      [username, email]
    );
    if ((existing as any[]).length > 0) {
      return res.status(400).json({ message: "Tài khoản đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = await generateId();

    await db.query(
      "INSERT INTO users (id, username, password, email) VALUES (?, ?, ?, ?)",
      [id, username, hashedPassword, email]
    );

    res.status(201).json({ message: "Đăng ký thành công", userId: id });
  } catch (error: any) {
    res.status(500).json({ message: "Lỗi khi đăng ký", error: error.message });
  }
};

// Đăng nhập
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE username = ?", [
      username,
    ]);
    const user = (rows as any[])[0] as User;

    if (!user) {
      return res
        .status(400)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Tài khoản hoặc mật khẩu không đúng" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Đăng nhập thành công", token });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng nhập", error: error.message });
  }
};

// Đăng xuất
export const logout = async (_req: Request, res: Response) => {
  try {
    // Với JWT, chỉ cần client xoá token, server có thể gửi message xác nhận
    res.json({ message: "Đăng xuất thành công" });
  } catch (error: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi đăng xuất", error: error.message });
  }
};

// ở đăng ký và đăng nhập thì chỉ cần req vì nó được dùng ở đoạn req.body
// ở đăng xuất thì nó không hề được dùng nên phải thay bằng _req để bỏ qua tránh việc xảy ra lỗi 404 not found
