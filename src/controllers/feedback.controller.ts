import { Request, Response } from "express";
import { db } from "../database";

export const FeedbackController = {
  // 📝 Gửi đánh giá
  async create(req: Request, res: Response) {
    try {
      const user_id = (req as any).user?.id;
      const { rating, comment } = req.body;

      if (!user_id) return res.status(401).json({ message: "Chưa đăng nhập" });
      if (!rating || !comment)
        return res.status(400).json({ message: "Thiếu dữ liệu đánh giá" });

      const [result]: any = await db.execute(
        `INSERT INTO feedback (user_id, rating, comment)
         VALUES (?, ?, ?)`,
        [user_id, rating, comment]
      );

      return res.status(201).json({
        message: "Đánh giá thành công!",
        review_id: result.insertId,
      });
    } catch (err) {
      console.error("❌ Lỗi create review:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
  },

  // 📋 Lấy toàn bộ đánh giá (kèm fullname + avatar + tỉnh thành)
  async getAll(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) > 0 ? Number(req.query.page) : 1;
      const limit = Number(req.query.limit) > 0 ? Number(req.query.limit) : 6;
      const offset = (page - 1) * limit;

      const [[{ total }]]: any = await db.execute(`
        SELECT COUNT(*) AS total FROM feedback
      `);
      const totalPages = Math.ceil(total / limit);

      // 🔹 Thêm JOIN với bảng KhachHang để lấy tỉnh thành
      const [rows]: any = await db.query(`
        SELECT 
          f.id, f.rating, f.comment, f.created_at,
          u.fullname, u.avatar,
          k.TinhThanh
        FROM feedback AS f
        JOIN users AS u ON f.user_id = u.id
        LEFT JOIN KhachHang AS k ON f.user_id = k.user_id
        ORDER BY f.created_at DESC
        LIMIT ${limit} OFFSET ${offset}
      `);

      return res.json({
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
      });
    } catch (err) {
      console.error("❌ Lỗi getAll feedback:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
  },

  // 👤 Lấy đánh giá theo user (có tỉnh thành)
  async getByUser(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const [rows]: any = await db.execute(
        `
        SELECT 
          f.id, f.rating, f.comment, f.created_at,
          u.fullname, u.avatar,
          k.TinhThanh
        FROM feedback AS f
        JOIN users AS u ON f.user_id = u.id
        LEFT JOIN KhachHang AS k ON f.user_id = k.user_id
        WHERE f.user_id = ?
        ORDER BY f.created_at DESC
        `,
        [id]
      );

      return res.json(rows);
    } catch (err) {
      console.error("❌ Lỗi getByUser:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
  },

  // ❌ Xóa đánh giá (dành cho admin)
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await db.execute(`DELETE FROM feedback WHERE id = ?`, [id]);
      return res.json({ message: "Đã xóa đánh giá" });
    } catch (err) {
      console.error("❌ Lỗi delete review:", err);
      return res.status(500).json({ message: "Lỗi server" });
    }
  },
};
