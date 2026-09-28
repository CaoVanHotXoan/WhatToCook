/**
 * =========================================================================================
 * DỰ ÁN: WHAT TO COOK - TYPES DEFINITION
 * FILE: src/types/index.ts
 * MÔ TẢ: Định nghĩa kiểu dữ liệu cho toàn bộ 9 bảng CSDL SQL Server và API Responses
 * =========================================================================================
 */

// 1. Phân trang
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

// 2. Thống kê KPI Dashboard
export interface DashboardStats {
  TongNguoiDung: number;
  TongMonAn: number;
  TongDanhMuc: number;
  TongNguyenLieu: number;
  TongLuotLuu: number;
}

// 3. Danh mục (DanhMuc)
export interface DanhMuc {
  MaDanhMuc: number;
  TenDanhMuc: string;
  SoLuongMonAn?: number;
  NgayTao?: string;
}

// 4. Nguyên liệu (NguyenLieu)
export interface NguyenLieu {
  MaNguyenLieu: number;
  TenNguyenLieu: string;
  LoaiNguyenLieu: 'Chinh' | 'GiaVi' | string;
  TuDongNghia?: string;
  NgayTao?: string;
}

// 5. Từ đồng nghĩa nguyên liệu (TuDongNghiaNguyenLieu)
export interface TuDongNghiaItem {
  MaTuDongNghia: number;
  MaNguyenLieu: number;
  TenTuDongNghia: string;
  TenNguyenLieu?: string;
  NgayTao?: string;
}

// 6. Nguyên liệu trong món ăn (NguyenLieuMonAn)
export interface NguyenLieuMonAn {
  MaNguyenLieu?: number;
  TenNguyenLieu: string;
  DinhLuong?: string;
  LaNguyenLieuChinh?: boolean;
  LoaiNguyenLieu?: 'Chinh' | 'GiaVi' | string;
}

// 7. Các bước thực hiện (CacBuocThucHien)
export interface BuocThucHien {
  MaBuoc?: number;
  MaMonAn?: number;
  SoThuTuBuoc: number;
  NoiDungHuongDan: string;
  DuongDanAnhBuoc?: string | null;
}

// 8. Món ăn (MonAn)
export interface MonAn {
  MaMonAn: number;
  TenMonAn: string;
  MaDanhMuc?: number;
  TenDanhMuc?: string;
  MaNguoiDung?: number;
  TenTacGia?: string;
  CauChuyen?: string;
  KhauPhan?: number;
  ThoiGianNau?: number;
  DuongDanAnhChinh?: string;
  SoLuotLuu?: number;
  NgayTao?: string;
  cacBuoc?: BuocThucHien[];
  nguyenLieu?: NguyenLieuMonAn[];
}

// 9. Vai trò (VaiTro)
export interface VaiTro {
  MaVaiTro: number;
  TenVaiTro: string;
  MoTa?: string;
  SoLuongNguoiDung?: number;
}

// 10. Người dùng (NguoiDung)
export interface NguoiDung {
  MaNguoiDung: number;
  TenDangNhap: string;
  Email: string;
  HoTen?: string;
  Avatar?: string;
  AnhDaiDien?: string;
  TieuSu?: string;
  MaVaiTro: number;
  TenVaiTro?: string;
  NgayTao?: string;
}

// 11. Món ăn đã lưu (MonAnDaLuu)
export interface MonAnDaLuuItem {
  MaLuu?: number;
  MaMonAn: number;
  TenMonAn: string;
  TenDanhMuc?: string;
  DuongDanAnhChinh?: string;
  ThoiGianNau?: number;
  KhauPhan?: number;
  NgayLuu?: string;
  TenTacGia?: string;
}

// 12. Định dạng phản hồi chuẩn từ Backend
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: PaginationMeta;
  error?: string;
}
