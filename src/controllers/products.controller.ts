import { Request, Response } from "express";
import { db } from "../database";
import { Product } from "../model/products.model";

// Lấy danh sách sản phẩm
export const getProducts = async (_req: Request, res: Response) => {
  try {
    const [rows] = await db.query("SELECT * FROM sanpham");
    res.json(rows);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy sản phẩm", error: err.message });
  }
};

// Lấy sản phẩm theo id
export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query("SELECT * FROM sanpham WHERE MaSP = ?", [id]);
    const product = (rows as Product[])[0];
    if (!product) {
      return res.status(404).json({ message: "Sản phẩm không tồn tại" });
    }
    res.json(product);
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi lấy sản phẩm", error: err.message });
  }
};

// Hàm tạo mã sản phẩm ngẫu nhiên NVARCHAR(10)
function generateProductId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "SP"; // prefix cho dễ nhìn
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Thêm sản phẩm
export const createProduct = async (req: Request, res: Response) => {
  try {
    const { TenSP, MoTa, GiaNhap, GiaBan, SoLuongTon, XuatXu, HinhAnh } =
      req.body;

    const MaSP = generateProductId();

    await db.query(
      "INSERT INTO sanpham (MaSP, TenSP, MoTa, GiaNhap, GiaBan, SoLuongTon, XuatXu, HinhAnh) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [MaSP, TenSP, MoTa, GiaNhap, GiaBan, SoLuongTon, XuatXu, HinhAnh]
    );

    res.status(201).json({ message: "Thêm sản phẩm thành công" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi thêm sản phẩm", error: err.message });
  }
};

// Cập nhật sản phẩm
export const updateProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { TenSP, MoTa, GiaNhap, GiaBan, SoLuongTon, XuatXu, HinhAnh } =
      req.body;

    await db.query(
      `UPDATE sanpham 
       SET TenSP = ?, MoTa = ?, GiaNhap = ?, GiaBan = ?, SoLuongTon = ?, XuatXu = ?, HinhAnh = ? 
       WHERE MaSP = ?`,
      [TenSP, MoTa, GiaNhap, GiaBan, SoLuongTon, XuatXu, HinhAnh, id]
    );

    res.json({ message: "Cập nhật sản phẩm thành công" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi cập nhật sản phẩm", error: err.message });
  }
};

// Xoá sản phẩm
export const deleteProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.query("DELETE FROM sanpham WHERE MaSP = ?", [id]);
    res.json({ message: "Xoá sản phẩm thành công" });
  } catch (err: any) {
    res
      .status(500)
      .json({ message: "Lỗi khi xoá sản phẩm", error: err.message });
  }
};
