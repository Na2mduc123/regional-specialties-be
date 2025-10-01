export interface KhachHang {
  MaKH: string;
  HoTen: string;
  Email: string;
  SoDienThoai?: string;
  DiaChi?: string;
  NgayDangKy?: Date;
  user_id: string; // Liên kết với users.id
}
