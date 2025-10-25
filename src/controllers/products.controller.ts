import { Request, Response } from "express";
import { db } from "../database";
import { SanPham } from "../model/products.model";
import { AuthRequest } from "../middlewares/authMiddleware";

// 🧩 Lấy tất cả sản phẩm (có filter vùng miền + loại đồ ăn)
export const getAllSanPham = async (req: Request, res: Response) => {
  try {
    const { vungmien, loaidan } = req.query;

    let sql = `
      SELECT sp.*, u.fullname AS NguoiDang, kh.SoDienThoai, kh.DiaChiDayDu
      FROM SanPham sp
      JOIN users u ON sp.user_id = u.id
      LEFT JOIN KhachHang kh ON kh.user_id = u.id
      WHERE 1=1
    `;

    const params: any[] = [];

    if (vungmien) {
      sql += " AND sp.VungMien = ?";
      params.push(vungmien);
    }

    if (loaidan) {
      sql += " AND sp.LoaiDoAn = ?";
      params.push(loaidan);
    }

    sql += " ORDER BY sp.created_at DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi lấy danh sách sản phẩm" });
  }
};

// 🧩 Lấy 1 sản phẩm theo id
export const getSanPhamById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const [rows]: any = await db.query(
      `
       SELECT sp.*, u.fullname AS NguoiDang, kh.SoDienThoai, kh.DiaChiDayDu
       FROM SanPham sp
       JOIN users u ON sp.user_id = u.id
       LEFT JOIN KhachHang kh ON kh.user_id = u.id
       WHERE sp.MaSP = ?
      `,
      [id]
    );

    if (!rows.length)
      return res.status(404).json({ message: "Không tìm thấy sản phẩm" });

    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Lỗi khi lấy sản phẩm" });
  }
};

// 🧩 Tạo sản phẩm mới (admin)
export const createSanPham = async (req: AuthRequest, res: Response) => {
  try {
    const data: SanPham & { VungMien?: string; LoaiDoAn?: string } = req.body;

    const user_id = req.user?.id;
    if (!user_id)
      return res.status(401).json({ message: "Token không hợp lệ" });

    // ✅ Check sản phẩm đã tồn tại chưa
    const [existing]: any = await db.query(
      `SELECT MaSP FROM SanPham WHERE TenSP = ? AND XuatXu = ? AND VungMien = ?`,
      [data.TenSP, data.XuatXu, data.VungMien || "bac"]
    );

    if (existing.length > 0) {
      return res.status(400).json({ message: "Sản phẩm này đã tồn tại" });
    }

    // 🔹 Sinh MaSP ngẫu nhiên 3 chữ số
    const generateRandomId = () => Math.floor(Math.random() * 900) + 100;
    let MaSP = generateRandomId();
    let exists = await db.query("SELECT MaSP FROM SanPham WHERE MaSP = ?", [
      MaSP,
    ]);
    while ((exists as any)[0].length) {
      MaSP = generateRandomId();
      exists = await db.query("SELECT MaSP FROM SanPham WHERE MaSP = ?", [
        MaSP,
      ]);
    }

    // 🔹 Thêm sản phẩm
    await db.query(
      `INSERT INTO SanPham
        (MaSP, TenSP, HinhAnh, GiaNhap, GiaBan, SoLuongTon, DaBan, DanhGiaTrungBinh, TongLuotDanhGia, HanSuDung, XuatXu, MoTa, Voucher, user_id, VungMien, LoaiDoAn)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        MaSP,
        data.TenSP,
        data.HinhAnh,
        data.GiaNhap || 0,
        data.GiaBan,
        data.SoLuongTon || 0,
        data.DaBan || 0,
        data.DanhGiaTrungBinh || 0,
        data.TongLuotDanhGia || 0,
        data.HanSuDung,
        data.XuatXu || "",
        data.MoTa,
        data.Voucher,
        user_id,
        data.VungMien || "bac",
        data.LoaiDoAn || "tai_cho",
      ]
    );

    res.status(201).json({ message: "Thêm sản phẩm thành công", MaSP });
  } catch (error) {
    console.error("❌ Lỗi chi tiết khi thêm sản phẩm:", error);
    res.status(500).json({
      message: "Lỗi khi thêm sản phẩm",
      error: (error as Error).message,
    });
  }
};

// 🧩 Cập nhật sản phẩm (admin)
export const updateSanPham = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data: SanPham & { VungMien?: string; LoaiDoAn?: string } = req.body;

  try {
    await db.query(`UPDATE SanPham SET ? WHERE MaSP = ?`, [data, id]);
    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi cập nhật sản phẩm" });
  }
};

// 🧩 Xóa sản phẩm (admin)
export const deleteSanPham = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    await db.query(`DELETE FROM SanPham WHERE MaSP = ?`, [id]);
    res.json({ message: "Đã xóa sản phẩm" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Lỗi khi xóa sản phẩm" });
  }
};
