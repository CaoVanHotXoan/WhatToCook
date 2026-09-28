-- ========================================================
-- CƠ SỞ DỮ LIỆU TỐI GIẢN TẬP TRUNG CHO ĐỒ ÁN (9 BẢNG)
-- ========================================================

-- 1. Bảng VaiTrò (Phân quyền hệ thống)
CREATE TABLE VaiTro (
    MaVaiTro INT IDENTITY(1,1) PRIMARY KEY,
    TenVaiTro NVARCHAR(50) NOT NULL UNIQUE, -- 'QuanTriVien', 'NguoiDung'
    MoTa NVARCHAR(255)
);

-- 2. Bảng NguoiDung (Quản lý tài khoản)
CREATE TABLE NguoiDung (
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
    MaVaiTro INT FOREIGN KEY REFERENCES VaiTro(MaVaiTro),
    TenDangNhap NVARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    MatKhauMaHoa VARCHAR(255) NOT NULL,
    AnhDaiDien VARCHAR(500),
    TieuSu NVARCHAR(255)
);

-- 3. Bảng DanhMuc (Phân loại món ăn)
CREATE TABLE DanhMuc (
    MaDanhMuc INT IDENTITY(1,1) PRIMARY KEY,
    TenDanhMuc NVARCHAR(100) NOT NULL UNIQUE
);

-- 4. Bảng MonAn (Đã XÓA NguonGocGiaoDien)
CREATE TABLE MonAn (
    MaMonAn INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung) ON DELETE SET NULL,
    MaDanhMuc INT FOREIGN KEY REFERENCES DanhMuc(MaDanhMuc) ON DELETE SET NULL,
    TenMonAn NVARCHAR(200) NOT NULL,
    CauChuyen NVARCHAR(MAX),
    KhauPhan INT,
    ThoiGianNau INT,                        -- Thời gian tính theo phút
    DuongDanAnhChinh VARCHAR(500),          -- Chuỗi URL từ Cloudinary hoặc Link ngoài
    NgayTao DATETIME DEFAULT GETDATE()
);

-- 5. Bảng CacBuocThucHien (Lưu link ảnh Upload Cloudinary HOẶC Link dán trực tiếp)
CREATE TABLE CacBuocThucHien (
    MaBuoc INT IDENTITY(1,1) PRIMARY KEY,
    MaMonAn INT FOREIGN KEY REFERENCES MonAn(MaMonAn) ON DELETE CASCADE,
    SoThuTuBuoc INT NOT NULL,
    NoiDungHuongDan NVARCHAR(MAX) NOT NULL,
    DuongDanAnhBuoc VARCHAR(500)            -- Chuỗi URL từ Cloudinary hoặc Link ngoài
);

-- 6. Bảng NguyenLieu (Từ điển nguyên liệu chuẩn)
CREATE TABLE NguyenLieu (
    MaNguyenLieu INT IDENTITY(1,1) PRIMARY KEY,
    TenNguyenLieu NVARCHAR(100) NOT NULL UNIQUE,
    LoaiNguyenLieu NVARCHAR(20) DEFAULT N'Chinh' -- 'Chinh' hoặc 'GiaVi'
);

-- 7. Bảng NguyenLieuMonAn (Bảng nối Món ăn - Nguyên liệu)
CREATE TABLE NguyenLieuMonAn (
    MaMonAn INT FOREIGN KEY REFERENCES MonAn(MaMonAn) ON DELETE CASCADE,
    MaNguyenLieu INT FOREIGN KEY REFERENCES NguyenLieu(MaNguyenLieu) ON DELETE CASCADE,
    DinhLuong NVARCHAR(100),                -- Vd: '200g', '2 quả'
    LaNguyenLieuChinh BIT DEFAULT 1,        -- 1: Nguyên liệu chính, 0: Gia vị phụ
    PRIMARY KEY (MaMonAn, MaNguyenLieu)
);

-- 8. Bảng TuDongNghiaNguyenLieu (Từ đồng nghĩa vùng miền)
CREATE TABLE TuDongNghiaNguyenLieu (
    MaTuDongNghia INT IDENTITY(1,1) PRIMARY KEY,
    MaNguyenLieu INT FOREIGN KEY REFERENCES NguyenLieu(MaNguyenLieu) ON DELETE CASCADE,
    TenTuDongNghia NVARCHAR(100) NOT NULL   -- Vd: 'dưa leo' = 'dưa chuột'
);

-- 9. Bảng MonAnDaLuu (Món ăn yêu thích của người dùng)
CREATE TABLE MonAnDaLuu (
    MaNguoiDung INT FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung) ON DELETE CASCADE,
    MaMonAn INT FOREIGN KEY REFERENCES MonAn(MaMonAn) ON DELETE CASCADE,
    NgayLuu DATETIME DEFAULT GETDATE(),
    PRIMARY KEY (MaNguoiDung, MaMonAn)
);