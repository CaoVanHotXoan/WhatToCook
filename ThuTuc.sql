-- ========================================================
-- FILE: ThuTuc.sql
-- DỰ ÁN: WHAT TO COOK (HỆ THỐNG GỢI Ý & QUẢN LÝ MÓN ĂN)
-- TẬP HỢP TOÀN BỘ CÁC THỦ TỤC LƯU TRỮ (STORED PROCEDURES)
-- VỊ TRÍ DUY NHẤT: e:\A_LHU\BaoCaoTotNghiep\ThuTuc.sql
-- Tương thích 100% với mọi phiên bản SQL Server (2012, 2014, 2016, 2017, 2019, 2022+)
-- ========================================================

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

-- 0. DỮ LIỆU MẪU BAN ĐẦU CHO VAI TRÒ
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE TenVaiTro = 'Admin' OR TenVaiTro = 'QuanTriVien')
BEGIN
    INSERT INTO VaiTro (TenVaiTro, MoTa) VALUES 
    ('Admin', N'Quản trị viên toàn quyền hệ thống');
END
IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE TenVaiTro = 'NguoiDung')
BEGIN
    INSERT INTO VaiTro (TenVaiTro, MoTa) VALUES 
    ('NguoiDung', N'Người dùng thành viên thông thường');
END
GO

-- ========================================================
-- 1. STORED PROCEDURES CHO PHÂN QUYỀN & VAI TRÒ (VaiTro)
-- ========================================================

-- 1.1. Lấy danh sách vai trò
IF OBJECT_ID('sp_LayTatCaVaiTro', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayTatCaVaiTro;
GO
CREATE PROCEDURE sp_LayTatCaVaiTro
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaVaiTro, TenVaiTro, MoTa 
    FROM VaiTro
    ORDER BY MaVaiTro ASC;
END
GO


-- ========================================================
-- 2. STORED PROCEDURES CHO TÀI KHOẢN & NGƯỜI DÙNG (NguoiDung)
-- ========================================================

-- 2.1. Đăng ký tài khoản người dùng mới
IF OBJECT_ID('sp_DangKyNguoiDung', 'P') IS NOT NULL
    DROP PROCEDURE sp_DangKyNguoiDung;
GO
CREATE PROCEDURE sp_DangKyNguoiDung
    @TenDangNhap NVARCHAR(50),
    @Email VARCHAR(100),
    @MatKhauMaHoa VARCHAR(255),
    @AnhDaiDien VARCHAR(500) = NULL,
    @TieuSu NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Kiểm tra email đã tồn tại chưa
        IF EXISTS (SELECT 1 FROM NguoiDung WHERE LOWER(Email) = LOWER(@Email))
        BEGIN
            RAISERROR(N'Email đã được sử dụng bởi tài khoản khác.', 16, 1);
            RETURN;
        END

        -- Kiểm tra tên đăng nhập đã tồn tại chưa
        IF EXISTS (SELECT 1 FROM NguoiDung WHERE LOWER(TenDangNhap) = LOWER(@TenDangNhap))
        BEGIN
            RAISERROR(N'Tên đăng nhập đã tồn tại. Vui lòng chọn tên khác.', 16, 1);
            RETURN;
        END

        -- Lấy mã vai trò 'NguoiDung' mặc định (tự động tìm mã chính xác theo tên)
        DECLARE @MaVaiTroDefault INT;
        SELECT TOP 1 @MaVaiTroDefault = MaVaiTro FROM VaiTro WHERE TenVaiTro = 'NguoiDung';
        
        -- Nếu không thấy, lấy vai trò thành viên thông thường bất kỳ
        IF @MaVaiTroDefault IS NULL
            SELECT TOP 1 @MaVaiTroDefault = MaVaiTro FROM VaiTro WHERE TenVaiTro NOT IN ('Admin', 'QuanTriVien');
        
        -- Nếu vẫn không thấy, lấy bất kỳ mã vai trò nào có trong bảng
        IF @MaVaiTroDefault IS NULL
            SELECT TOP 1 @MaVaiTroDefault = MaVaiTro FROM VaiTro ORDER BY MaVaiTro DESC;

        -- Thêm mới người dùng
        INSERT INTO NguoiDung (MaVaiTro, TenDangNhap, Email, MatKhauMaHoa, AnhDaiDien, TieuSu)
        VALUES (@MaVaiTroDefault, @TenDangNhap, @Email, @MatKhauMaHoa, @AnhDaiDien, @TieuSu);

        DECLARE @NewUserId INT = SCOPE_IDENTITY();

        -- Trả về thông tin người dùng vừa tạo (không kèm mật khẩu)
        SELECT 
            u.MaNguoiDung,
            u.TenDangNhap,
            u.Email,
            u.AnhDaiDien,
            u.TieuSu,
            v.MaVaiTro,
            v.TenVaiTro
        FROM NguoiDung u
        LEFT JOIN VaiTro v ON u.MaVaiTro = v.MaVaiTro
        WHERE u.MaNguoiDung = @NewUserId;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 2.2. Lấy thông tin người dùng theo Email (Phục vụ Đăng nhập & Xác thực)
IF OBJECT_ID('sp_LayNguoiDungTheoEmail', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayNguoiDungTheoEmail;
GO
CREATE PROCEDURE sp_LayNguoiDungTheoEmail
    @Email VARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.MaNguoiDung,
        u.TenDangNhap,
        u.Email,
        u.MatKhauMaHoa,
        u.AnhDaiDien,
        u.TieuSu,
        v.MaVaiTro,
        v.TenVaiTro
    FROM NguoiDung u
    LEFT JOIN VaiTro v ON u.MaVaiTro = v.MaVaiTro
    WHERE u.Email = @Email OR LOWER(u.TenDangNhap) = LOWER(@Email);
END
GO

-- 2.3. Lấy thông tin người dùng theo ID (Profile)
IF OBJECT_ID('sp_LayNguoiDungTheoId', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayNguoiDungTheoId;
GO
CREATE PROCEDURE sp_LayNguoiDungTheoId
    @MaNguoiDung INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        u.MaNguoiDung,
        u.TenDangNhap,
        u.Email,
        u.AnhDaiDien,
        u.TieuSu,
        v.MaVaiTro,
        v.TenVaiTro
    FROM NguoiDung u
    LEFT JOIN VaiTro v ON u.MaVaiTro = v.MaVaiTro
    WHERE u.MaNguoiDung = @MaNguoiDung;
END
GO

-- 2.4. Cập nhật hồ sơ người dùng
IF OBJECT_ID('sp_CapNhatThongTinNguoiDung', 'P') IS NOT NULL
    DROP PROCEDURE sp_CapNhatThongTinNguoiDung;
GO
CREATE PROCEDURE sp_CapNhatThongTinNguoiDung
    @MaNguoiDung INT,
    @TenDangNhap NVARCHAR(50),
    @AnhDaiDien VARCHAR(500) = NULL,
    @TieuSu NVARCHAR(255) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung)
        BEGIN
            RAISERROR(N'Người dùng không tồn tại.', 16, 1);
            RETURN;
        END

        UPDATE NguoiDung
        SET TenDangNhap = @TenDangNhap,
            AnhDaiDien = COALESCE(@AnhDaiDien, AnhDaiDien),
            TieuSu = COALESCE(@TieuSu, TieuSu)
        WHERE MaNguoiDung = @MaNguoiDung;

        -- Trả về thông tin sau khi cập nhật
        EXEC sp_LayNguoiDungTheoId @MaNguoiDung;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 2.5. Đổi mật khẩu
IF OBJECT_ID('sp_DoiMatKhau', 'P') IS NOT NULL
    DROP PROCEDURE sp_DoiMatKhau;
GO
CREATE PROCEDURE sp_DoiMatKhau
    @MaNguoiDung INT,
    @MatKhauMoi VARCHAR(255)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung)
        BEGIN
            RAISERROR(N'Người dùng không tồn tại.', 16, 1);
            RETURN;
        END

        UPDATE NguoiDung
        SET MatKhauMaHoa = @MatKhauMoi
        WHERE MaNguoiDung = @MaNguoiDung;

        SELECT @MaNguoiDung AS MaNguoiDung, N'Đổi mật khẩu thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 2.6. Lấy danh sách tất cả người dùng (Cho Quản trị viên)
IF OBJECT_ID('sp_LayTatCaNguoiDung', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayTatCaNguoiDung;
GO
CREATE PROCEDURE sp_LayTatCaNguoiDung
    @TuKhoa NVARCHAR(100) = NULL,
    @Page INT = 1,
    @PageSize INT = 20
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    -- Đếm tổng số bản ghi
    DECLARE @TotalCount INT;
    SELECT @TotalCount = COUNT(*)
    FROM NguoiDung u
    WHERE (@TuKhoa IS NULL OR u.TenDangNhap LIKE N'%' + @TuKhoa + N'%' OR u.Email LIKE '%' + @TuKhoa + '%');

    -- Lấy dữ liệu phân trang
    SELECT 
        u.MaNguoiDung,
        u.TenDangNhap,
        u.Email,
        u.AnhDaiDien,
        u.TieuSu,
        v.MaVaiTro,
        v.TenVaiTro,
        @TotalCount AS TongSoBanGhi
    FROM NguoiDung u
    LEFT JOIN VaiTro v ON u.MaVaiTro = v.MaVaiTro
    WHERE (@TuKhoa IS NULL OR u.TenDangNhap LIKE N'%' + @TuKhoa + N'%' OR u.Email LIKE '%' + @TuKhoa + '%')
    ORDER BY u.MaNguoiDung DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 2.7. Quản trị viên cập nhật vai trò người dùng
IF OBJECT_ID('sp_CapNhatVaiTroNguoiDung', 'P') IS NOT NULL
    DROP PROCEDURE sp_CapNhatVaiTroNguoiDung;
GO
CREATE PROCEDURE sp_CapNhatVaiTroNguoiDung
    @MaNguoiDung INT,
    @MaVaiTro INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung)
        BEGIN
            RAISERROR(N'Người dùng không tồn tại.', 16, 1);
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM VaiTro WHERE MaVaiTro = @MaVaiTro)
        BEGIN
            RAISERROR(N'Vai trò không hợp lệ.', 16, 1);
            RETURN;
        END

        UPDATE NguoiDung
        SET MaVaiTro = @MaVaiTro
        WHERE MaNguoiDung = @MaNguoiDung;

        EXEC sp_LayNguoiDungTheoId @MaNguoiDung;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 2.8. Quản trị viên xóa người dùng
IF OBJECT_ID('sp_XoaNguoiDung', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNguoiDung;
GO
CREATE PROCEDURE sp_XoaNguoiDung
    @MaNguoiDung INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung)
        BEGIN
            RAISERROR(N'Người dùng không tồn tại.', 16, 1);
            RETURN;
        END

        DELETE FROM NguoiDung WHERE MaNguoiDung = @MaNguoiDung;
        SELECT @MaNguoiDung AS MaNguoiDung, N'Xóa người dùng thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO


-- ========================================================
-- 3. STORED PROCEDURES CHO DANH MỤC MÓN ĂN (DanhMuc)
-- ========================================================

-- 3.1. Lấy tất cả danh mục kèm số lượng món ăn
IF OBJECT_ID('sp_LayTatCaDanhMuc', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayTatCaDanhMuc;
GO
CREATE PROCEDURE sp_LayTatCaDanhMuc
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        d.MaDanhMuc,
        d.TenDanhMuc,
        COUNT(m.MaMonAn) AS SoLuongMonAn
    FROM DanhMuc d
    LEFT JOIN MonAn m ON d.MaDanhMuc = m.MaDanhMuc
    GROUP BY d.MaDanhMuc, d.TenDanhMuc
    ORDER BY d.TenDanhMuc ASC;
END
GO

-- 3.2. Lấy chi tiết danh mục theo ID
IF OBJECT_ID('sp_LayDanhMucTheoId', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayDanhMucTheoId;
GO
CREATE PROCEDURE sp_LayDanhMucTheoId
    @MaDanhMuc INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        d.MaDanhMuc,
        d.TenDanhMuc,
        COUNT(m.MaMonAn) AS SoLuongMonAn
    FROM DanhMuc d
    LEFT JOIN MonAn m ON d.MaDanhMuc = m.MaDanhMuc
    WHERE d.MaDanhMuc = @MaDanhMuc
    GROUP BY d.MaDanhMuc, d.TenDanhMuc;
END
GO

-- 3.3. Thêm mới danh mục
IF OBJECT_ID('sp_ThemDanhMuc', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemDanhMuc;
GO
CREATE PROCEDURE sp_ThemDanhMuc
    @TenDanhMuc NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF EXISTS (SELECT 1 FROM DanhMuc WHERE TenDanhMuc = @TenDanhMuc)
        BEGIN
            RAISERROR(N'Tên danh mục đã tồn tại.', 16, 1);
            RETURN;
        END

        INSERT INTO DanhMuc (TenDanhMuc) VALUES (@TenDanhMuc);
        DECLARE @NewId INT = SCOPE_IDENTITY();
        SELECT @NewId AS MaDanhMuc, @TenDanhMuc AS TenDanhMuc, 0 AS SoLuongMonAn;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 3.4. Cập nhật danh mục
IF OBJECT_ID('sp_CapNhatDanhMuc', 'P') IS NOT NULL
    DROP PROCEDURE sp_CapNhatDanhMuc;
GO
CREATE PROCEDURE sp_CapNhatDanhMuc
    @MaDanhMuc INT,
    @TenDanhMuc NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM DanhMuc WHERE MaDanhMuc = @MaDanhMuc)
        BEGIN
            RAISERROR(N'Danh mục không tồn tại.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM DanhMuc WHERE TenDanhMuc = @TenDanhMuc AND MaDanhMuc <> @MaDanhMuc)
        BEGIN
            RAISERROR(N'Tên danh mục này đã được sử dụng.', 16, 1);
            RETURN;
        END

        UPDATE DanhMuc
        SET TenDanhMuc = @TenDanhMuc
        WHERE MaDanhMuc = @MaDanhMuc;

        EXEC sp_LayDanhMucTheoId @MaDanhMuc;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 3.5. Xóa danh mục
IF OBJECT_ID('sp_XoaDanhMuc', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaDanhMuc;
GO
CREATE PROCEDURE sp_XoaDanhMuc
    @MaDanhMuc INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM DanhMuc WHERE MaDanhMuc = @MaDanhMuc)
        BEGIN
            RAISERROR(N'Danh mục không tồn tại.', 16, 1);
            RETURN;
        END

        -- Set NULL cho các món ăn thuộc danh mục này
        UPDATE MonAn SET MaDanhMuc = NULL WHERE MaDanhMuc = @MaDanhMuc;

        DELETE FROM DanhMuc WHERE MaDanhMuc = @MaDanhMuc;
        SELECT @MaDanhMuc AS MaDanhMuc, N'Xóa danh mục thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO


-- ========================================================
-- 4. STORED PROCEDURES CHO NGUYÊN LIỆU & TỪ ĐỒNG NGHĨA
-- ========================================================

-- 4.1. Lấy danh sách nguyên liệu (Hỗ trợ tìm kiếm, nối chuỗi tương thích mọi phiên bản SQL Server)
IF OBJECT_ID('sp_LayTatCaNguyenLieu', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayTatCaNguyenLieu;
GO
CREATE PROCEDURE sp_LayTatCaNguyenLieu
    @TuKhoa NVARCHAR(100) = NULL,
    @LoaiNguyenLieu NVARCHAR(20) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        nl.MaNguyenLieu,
        nl.TenNguyenLieu,
        nl.LoaiNguyenLieu,
        (
            STUFF((
                SELECT ', ' + tdn.TenTuDongNghia 
                FROM TuDongNghiaNguyenLieu tdn 
                WHERE tdn.MaNguyenLieu = nl.MaNguyenLieu 
                FOR XML PATH(''), TYPE
            ).value('.', 'NVARCHAR(MAX)'), 1, 2, '')
        ) AS TuDongNghia
    FROM NguyenLieu nl
    WHERE (@TuKhoa IS NULL OR nl.TenNguyenLieu LIKE N'%' + @TuKhoa + N'%')
      AND (@LoaiNguyenLieu IS NULL OR nl.LoaiNguyenLieu = @LoaiNguyenLieu)
    ORDER BY nl.TenNguyenLieu ASC;
END
GO

-- 4.2. Thêm hoặc lấy mã nguyên liệu (nếu đã tồn tại thì lấy ID cũ)
IF OBJECT_ID('sp_ThemHoacLayNguyenLieu', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemHoacLayNguyenLieu;
GO
CREATE PROCEDURE sp_ThemHoacLayNguyenLieu
    @TenNguyenLieu NVARCHAR(100),
    @LoaiNguyenLieu NVARCHAR(20) = N'Chinh'
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @MaNL INT;
    SET @TenNguyenLieu = LTRIM(RTRIM(@TenNguyenLieu));

    -- Kiểm tra trong bảng NguyenLieu
    SELECT @MaNL = MaNguyenLieu FROM NguyenLieu WHERE LOWER(TenNguyenLieu) = LOWER(@TenNguyenLieu);

    -- Nếu không thấy, kiểm tra trong bảng Từ đồng nghĩa
    IF @MaNL IS NULL
    BEGIN
        SELECT @MaNL = MaNguyenLieu FROM TuDongNghiaNguyenLieu WHERE LOWER(TenTuDongNghia) = LOWER(@TenNguyenLieu);
    END

    -- Nếu chưa có thì tạo mới
    IF @MaNL IS NULL
    BEGIN
        INSERT INTO NguyenLieu (TenNguyenLieu, LoaiNguyenLieu)
        VALUES (@TenNguyenLieu, @LoaiNguyenLieu);
        SET @MaNL = SCOPE_IDENTITY();
    END

    SELECT MaNguyenLieu, TenNguyenLieu, LoaiNguyenLieu 
    FROM NguyenLieu 
    WHERE MaNguyenLieu = @MaNL;
END
GO

-- 4.3. Cập nhật nguyên liệu
IF OBJECT_ID('sp_CapNhatNguyenLieu', 'P') IS NOT NULL
    DROP PROCEDURE sp_CapNhatNguyenLieu;
GO
CREATE PROCEDURE sp_CapNhatNguyenLieu
    @MaNguyenLieu INT,
    @TenNguyenLieu NVARCHAR(100),
    @LoaiNguyenLieu NVARCHAR(20)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NguyenLieu WHERE MaNguyenLieu = @MaNguyenLieu)
        BEGIN
            RAISERROR(N'Nguyên liệu không tồn tại.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM NguyenLieu WHERE TenNguyenLieu = @TenNguyenLieu AND MaNguyenLieu <> @MaNguyenLieu)
        BEGIN
            RAISERROR(N'Tên nguyên liệu này đã tồn tại.', 16, 1);
            RETURN;
        END

        UPDATE NguyenLieu
        SET TenNguyenLieu = @TenNguyenLieu,
            LoaiNguyenLieu = @LoaiNguyenLieu
        WHERE MaNguyenLieu = @MaNguyenLieu;

        SELECT MaNguyenLieu, TenNguyenLieu, LoaiNguyenLieu
        FROM NguyenLieu
        WHERE MaNguyenLieu = @MaNguyenLieu;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 4.4. Xóa nguyên liệu
IF OBJECT_ID('sp_XoaNguyenLieu', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaNguyenLieu;
GO
CREATE PROCEDURE sp_XoaNguyenLieu
    @MaNguyenLieu INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NguyenLieu WHERE MaNguyenLieu = @MaNguyenLieu)
        BEGIN
            RAISERROR(N'Nguyên liệu không tồn tại.', 16, 1);
            RETURN;
        END

        DELETE FROM NguyenLieu WHERE MaNguyenLieu = @MaNguyenLieu;
        SELECT @MaNguyenLieu AS MaNguyenLieu, N'Xóa nguyên liệu thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 4.5. Thêm từ đồng nghĩa nguyên liệu
IF OBJECT_ID('sp_ThemTuDongNghia', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemTuDongNghia;
GO
CREATE PROCEDURE sp_ThemTuDongNghia
    @MaNguyenLieu INT,
    @TenTuDongNghia NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM NguyenLieu WHERE MaNguyenLieu = @MaNguyenLieu)
        BEGIN
            RAISERROR(N'Nguyên liệu gốc không tồn tại.', 16, 1);
            RETURN;
        END

        INSERT INTO TuDongNghiaNguyenLieu (MaNguyenLieu, TenTuDongNghia)
        VALUES (@MaNguyenLieu, LTRIM(RTRIM(@TenTuDongNghia)));

        DECLARE @NewId INT = SCOPE_IDENTITY();
        SELECT @NewId AS MaTuDongNghia, @MaNguyenLieu AS MaNguyenLieu, @TenTuDongNghia AS TenTuDongNghia;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 4.6. Lấy danh sách từ đồng nghĩa theo nguyên liệu
IF OBJECT_ID('sp_LayTuDongNghiaTheoNguyenLieu', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayTuDongNghiaTheoNguyenLieu;
GO
CREATE PROCEDURE sp_LayTuDongNghiaTheoNguyenLieu
    @MaNguyenLieu INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT MaTuDongNghia, MaNguyenLieu, TenTuDongNghia
    FROM TuDongNghiaNguyenLieu
    WHERE MaNguyenLieu = @MaNguyenLieu;
END
GO

-- 4.7. Xóa từ đồng nghĩa
IF OBJECT_ID('sp_XoaTuDongNghia', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaTuDongNghia;
GO
CREATE PROCEDURE sp_XoaTuDongNghia
    @MaTuDongNghia INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM TuDongNghiaNguyenLieu WHERE MaTuDongNghia = @MaTuDongNghia;
    SELECT @MaTuDongNghia AS MaTuDongNghia, N'Xóa từ đồng nghĩa thành công' AS ThongBao;
END
GO


-- ========================================================
-- 5. STORED PROCEDURES CHO MÓN ĂN & NGUYÊN LIỆU / BƯỚC NẤU (MonAn)
-- ========================================================

-- 5.1. Lấy danh sách món ăn (Tìm kiếm, Lọc danh mục, Phân trang)
IF OBJECT_ID('sp_LayDanhSachMonAn', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayDanhSachMonAn;
GO
CREATE PROCEDURE sp_LayDanhSachMonAn
    @TuKhoa NVARCHAR(100) = NULL,
    @MaDanhMuc INT = NULL,
    @MaNguoiDung INT = NULL, -- Lọc theo người đăng
    @Page INT = 1,
    @PageSize INT = 12
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    -- Đếm tổng số bản ghi
    DECLARE @TotalCount INT;
    SELECT @TotalCount = COUNT(*)
    FROM MonAn m
    WHERE (@TuKhoa IS NULL OR m.TenMonAn LIKE N'%' + @TuKhoa + N'%')
      AND (@MaDanhMuc IS NULL OR m.MaDanhMuc = @MaDanhMuc)
      AND (@MaNguoiDung IS NULL OR m.MaNguoiDung = @MaNguoiDung);

    -- Trả về danh sách món ăn kèm thông tin DanhMuc, NguoiDung, và số lượt lưu
    SELECT 
        m.MaMonAn,
        m.TenMonAn,
        m.CauChuyen,
        m.KhauPhan,
        m.ThoiGianNau,
        m.DuongDanAnhChinh,
        m.NgayTao,
        d.MaDanhMuc,
        d.TenDanhMuc,
        u.MaNguoiDung,
        u.TenDangNhap AS TenTacGia,
        u.AnhDaiDien AS AnhTacGia,
        (SELECT COUNT(*) FROM MonAnDaLuu f WHERE f.MaMonAn = m.MaMonAn) AS SoLuotLuu,
        @TotalCount AS TongSoBanGhi
    FROM MonAn m
    LEFT JOIN DanhMuc d ON m.MaDanhMuc = d.MaDanhMuc
    LEFT JOIN NguoiDung u ON m.MaNguoiDung = u.MaNguoiDung
    WHERE (@TuKhoa IS NULL OR m.TenMonAn LIKE N'%' + @TuKhoa + N'%')
      AND (@MaDanhMuc IS NULL OR m.MaDanhMuc = @MaDanhMuc)
      AND (@MaNguoiDung IS NULL OR m.MaNguoiDung = @MaNguoiDung)
    ORDER BY m.NgayTao DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO

-- 5.2. Lấy thông tin chi tiết một món ăn
IF OBJECT_ID('sp_LayChiTietMonAnTheoId', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayChiTietMonAnTheoId;
GO
CREATE PROCEDURE sp_LayChiTietMonAnTheoId
    @MaMonAn INT,
    @MaNguoiDungHienTai INT = NULL -- Kiểm tra xem user này đã lưu món ăn chưa
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 1. Thông tin chung món ăn
    SELECT 
        m.MaMonAn,
        m.TenMonAn,
        m.CauChuyen,
        m.KhauPhan,
        m.ThoiGianNau,
        m.DuongDanAnhChinh,
        m.NgayTao,
        d.MaDanhMuc,
        d.TenDanhMuc,
        u.MaNguoiDung,
        u.TenDangNhap AS TenTacGia,
        u.AnhDaiDien AS AnhTacGia,
        (SELECT COUNT(*) FROM MonAnDaLuu f WHERE f.MaMonAn = m.MaMonAn) AS SoLuotLuu,
        CASE 
            WHEN @MaNguoiDungHienTai IS NOT NULL AND EXISTS (
                SELECT 1 FROM MonAnDaLuu WHERE MaMonAn = m.MaMonAn AND MaNguoiDung = @MaNguoiDungHienTai
            ) THEN 1 
            ELSE 0 
        END AS DaLuu
    FROM MonAn m
    LEFT JOIN DanhMuc d ON m.MaDanhMuc = d.MaDanhMuc
    LEFT JOIN NguoiDung u ON m.MaNguoiDung = u.MaNguoiDung
    WHERE m.MaMonAn = @MaMonAn;

    -- 2. Danh sách các bước thực hiện
    SELECT 
        MaBuoc,
        MaMonAn,
        SoThuTuBuoc,
        NoiDungHuongDan,
        DuongDanAnhBuoc
    FROM CacBuocThucHien
    WHERE MaMonAn = @MaMonAn
    ORDER BY SoThuTuBuoc ASC;

    -- 3. Danh sách nguyên liệu của món ăn
    SELECT 
        nlma.MaMonAn,
        nlma.MaNguyenLieu,
        nl.TenNguyenLieu,
        nl.LoaiNguyenLieu,
        nlma.DinhLuong,
        nlma.LaNguyenLieuChinh
    FROM NguyenLieuMonAn nlma
    INNER JOIN NguyenLieu nl ON nlma.MaNguyenLieu = nl.MaNguyenLieu
    WHERE nlma.MaMonAn = @MaMonAn
    ORDER BY nlma.LaNguyenLieuChinh DESC, nl.TenNguyenLieu ASC;
END
GO

-- 5.3. Tạo mới món ăn (Master record)
IF OBJECT_ID('sp_ThemMonAn', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemMonAn;
GO
CREATE PROCEDURE sp_ThemMonAn
    @MaNguoiDung INT,
    @MaDanhMuc INT = NULL,
    @TenMonAn NVARCHAR(200),
    @CauChuyen NVARCHAR(MAX) = NULL,
    @KhauPhan INT = NULL,
    @ThoiGianNau INT = NULL,
    @DuongDanAnhChinh VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        INSERT INTO MonAn (MaNguoiDung, MaDanhMuc, TenMonAn, CauChuyen, KhauPhan, ThoiGianNau, DuongDanAnhChinh, NgayTao)
        VALUES (@MaNguoiDung, @MaDanhMuc, @TenMonAn, @CauChuyen, @KhauPhan, @ThoiGianNau, @DuongDanAnhChinh, GETDATE());

        DECLARE @NewId INT = SCOPE_IDENTITY();
        SELECT @NewId AS MaMonAn;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 5.4. Thêm bước thực hiện cho món ăn
IF OBJECT_ID('sp_ThemBuocThucHien', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemBuocThucHien;
GO
CREATE PROCEDURE sp_ThemBuocThucHien
    @MaMonAn INT,
    @SoThuTuBuoc INT,
    @NoiDungHuongDan NVARCHAR(MAX),
    @DuongDanAnhBuoc VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    INSERT INTO CacBuocThucHien (MaMonAn, SoThuTuBuoc, NoiDungHuongDan, DuongDanAnhBuoc)
    VALUES (@MaMonAn, @SoThuTuBuoc, @NoiDungHuongDan, @DuongDanAnhBuoc);
END
GO

-- 5.5. Thêm nguyên liệu cho món ăn
IF OBJECT_ID('sp_ThemNguyenLieuMonAn', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThemNguyenLieuMonAn;
GO
CREATE PROCEDURE sp_ThemNguyenLieuMonAn
    @MaMonAn INT,
    @MaNguyenLieu INT,
    @DinhLuong NVARCHAR(100) = NULL,
    @LaNguyenLieuChinh BIT = 1
AS
BEGIN
    SET NOCOUNT ON;
    IF NOT EXISTS (SELECT 1 FROM NguyenLieuMonAn WHERE MaMonAn = @MaMonAn AND MaNguyenLieu = @MaNguyenLieu)
    BEGIN
        INSERT INTO NguyenLieuMonAn (MaMonAn, MaNguyenLieu, DinhLuong, LaNguyenLieuChinh)
        VALUES (@MaMonAn, @MaNguyenLieu, @DinhLuong, @LaNguyenLieuChinh);
    END
    ELSE
    BEGIN
        UPDATE NguyenLieuMonAn
        SET DinhLuong = @DinhLuong,
            LaNguyenLieuChinh = @LaNguyenLieuChinh
        WHERE MaMonAn = @MaMonAn AND MaNguyenLieu = @MaNguyenLieu;
    END
END
GO

-- 5.6. Cập nhật thông tin cơ bản món ăn
IF OBJECT_ID('sp_CapNhatMonAn', 'P') IS NOT NULL
    DROP PROCEDURE sp_CapNhatMonAn;
GO
CREATE PROCEDURE sp_CapNhatMonAn
    @MaMonAn INT,
    @MaDanhMuc INT = NULL,
    @TenMonAn NVARCHAR(200),
    @CauChuyen NVARCHAR(MAX) = NULL,
    @KhauPhan INT = NULL,
    @ThoiGianNau INT = NULL,
    @DuongDanAnhChinh VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM MonAn WHERE MaMonAn = @MaMonAn)
        BEGIN
            RAISERROR(N'Món ăn không tồn tại.', 16, 1);
            RETURN;
        END

        UPDATE MonAn
        SET MaDanhMuc = @MaDanhMuc,
            TenMonAn = @TenMonAn,
            CauChuyen = @CauChuyen,
            KhauPhan = @KhauPhan,
            ThoiGianNau = @ThoiGianNau,
            DuongDanAnhChinh = COALESCE(@DuongDanAnhChinh, DuongDanAnhChinh)
        WHERE MaMonAn = @MaMonAn;

        SELECT @MaMonAn AS MaMonAn, N'Cập nhật món ăn thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 5.7. Xóa toàn bộ các bước và nguyên liệu của món ăn (Phục vụ cập nhật lại công thức)
IF OBJECT_ID('sp_XoaChiTietMonAn', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaChiTietMonAn;
GO
CREATE PROCEDURE sp_XoaChiTietMonAn
    @MaMonAn INT
AS
BEGIN
    SET NOCOUNT ON;
    DELETE FROM CacBuocThucHien WHERE MaMonAn = @MaMonAn;
    DELETE FROM NguyenLieuMonAn WHERE MaMonAn = @MaMonAn;
END
GO

-- 5.8. Xóa món ăn
IF OBJECT_ID('sp_XoaMonAn', 'P') IS NOT NULL
    DROP PROCEDURE sp_XoaMonAn;
GO
CREATE PROCEDURE sp_XoaMonAn
    @MaMonAn INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM MonAn WHERE MaMonAn = @MaMonAn)
        BEGIN
            RAISERROR(N'Món ăn không tồn tại.', 16, 1);
            RETURN;
        END

        DELETE FROM MonAn WHERE MaMonAn = @MaMonAn;
        SELECT @MaMonAn AS MaMonAn, N'Xóa món ăn thành công' AS ThongBao;
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- ========================================================
-- 6. TÍNH NĂNG CỐT LÕI: GỢI Ý MÓN ĂN THEO NGUYÊN LIỆU CÓ SẴN (WHAT TO COOK)
-- Đã fix lỗi tương thích: Sử dụng XML Split và LEFT JOIN không chứa subquery lồng trong hàm tổng hợp
-- ========================================================
IF OBJECT_ID('sp_GoiYMonAnTheoNguyenLieu', 'P') IS NOT NULL
    DROP PROCEDURE sp_GoiYMonAnTheoNguyenLieu;
GO
CREATE PROCEDURE sp_GoiYMonAnTheoNguyenLieu
    @ChuoiNguyenLieu NVARCHAR(MAX), -- Danh sách nguyên liệu người dùng có, ví dụ: 'thịt heo, trứng, hành tây'
    @Page INT = 1,
    @PageSize INT = 12
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    CREATE TABLE #TuKhoaUser (
        TenNguyenLieu NVARCHAR(100)
    );

    -- Tách chuỗi nguyên liệu bằng XML (Tương thích 100% với SQL Server 2012, 2014, 2016, 2017, 2019, 2022)
    DECLARE @XmlList XML;
    SET @XmlList = CAST('<r><s>' + REPLACE(REPLACE(REPLACE(ISNULL(@ChuoiNguyenLieu, ''), '&', '&amp;'), '<', '&lt;'), ',', '</s><s>') + '</s></r>' AS XML);

    INSERT INTO #TuKhoaUser (TenNguyenLieu)
    SELECT LOWER(LTRIM(RTRIM(t.c.value('.', 'NVARCHAR(100)'))))
    FROM @XmlList.nodes('/r/s') AS t(c)
    WHERE LTRIM(RTRIM(t.c.value('.', 'NVARCHAR(100)'))) <> '';

    CREATE TABLE #NguyenLieuMatched (
        MaNguyenLieu INT PRIMARY KEY
    );

    INSERT INTO #NguyenLieuMatched (MaNguyenLieu)
    SELECT DISTINCT nl.MaNguyenLieu
    FROM NguyenLieu nl
    INNER JOIN #TuKhoaUser tk ON LOWER(nl.TenNguyenLieu) LIKE '%' + tk.TenNguyenLieu + '%'
    UNION
    SELECT DISTINCT tdn.MaNguyenLieu
    FROM TuDongNghiaNguyenLieu tdn
    INNER JOIN #TuKhoaUser tk ON LOWER(tdn.TenTuDongNghia) LIKE '%' + tk.TenNguyenLieu + '%';

    ;WITH ThongKeMonAn AS (
        SELECT 
            m.MaMonAn,
            COUNT(nlma.MaNguyenLieu) AS TongSoNguyenLieu,
            COUNT(CASE WHEN nlma.LaNguyenLieuChinh = 1 THEN 1 END) AS TongSoNLChinh,
            COUNT(matched.MaNguyenLieu) AS SoNLTrungKhop,
            COUNT(CASE WHEN nlma.LaNguyenLieuChinh = 1 AND matched.MaNguyenLieu IS NOT NULL THEN 1 END) AS SoNLChinhTrungKhop
        FROM MonAn m
        INNER JOIN NguyenLieuMonAn nlma ON m.MaMonAn = nlma.MaMonAn
        LEFT JOIN #NguyenLieuMatched matched ON nlma.MaNguyenLieu = matched.MaNguyenLieu
        GROUP BY m.MaMonAn
    ),
    KetQuaGoiY AS (
        SELECT 
            m.MaMonAn,
            m.TenMonAn,
            m.CauChuyen,
            m.KhauPhan,
            m.ThoiGianNau,
            m.DuongDanAnhChinh,
            m.NgayTao,
            d.MaDanhMuc,
            d.TenDanhMuc,
            u.MaNguoiDung,
            u.TenDangNhap AS TenTacGia,
            u.AnhDaiDien AS AnhTacGia,
            tk.TongSoNguyenLieu,
            tk.SoNLTrungKhop,
            (tk.TongSoNguyenLieu - tk.SoNLTrungKhop) AS SoNLConThieu,
            CAST(ROUND((CAST(tk.SoNLTrungKhop AS FLOAT) / NULLIF(tk.TongSoNguyenLieu, 0)) * 100, 1) AS DECIMAL(5,1)) AS PhanTramKhop,
            (SELECT COUNT(*) FROM MonAnDaLuu f WHERE f.MaMonAn = m.MaMonAn) AS SoLuotLuu
        FROM ThongKeMonAn tk
        INNER JOIN MonAn m ON tk.MaMonAn = m.MaMonAn
        LEFT JOIN DanhMuc d ON m.MaDanhMuc = d.MaDanhMuc
        LEFT JOIN NguoiDung u ON m.MaNguoiDung = u.MaNguoiDung
        WHERE tk.SoNLTrungKhop > 0
    )
    SELECT 
        *,
        (SELECT COUNT(*) FROM KetQuaGoiY) AS TongSoBanGhi
    FROM KetQuaGoiY
    ORDER BY PhanTramKhop DESC, SoNLTrungKhop DESC, NgayTao DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;

    DROP TABLE #TuKhoaUser;
    DROP TABLE #NguyenLieuMatched;
END
GO


-- ========================================================
-- 7. STORED PROCEDURES CHO MÓN ĂN ĐÃ LƯU / YÊU THÍCH (MonAnDaLuu)
-- ========================================================

-- 7.1. Lưu hoặc Bỏ lưu món ăn (Toggle Bookmark)
IF OBJECT_ID('sp_ToggleLuuMonAn', 'P') IS NOT NULL
    DROP PROCEDURE sp_ToggleLuuMonAn;
GO
CREATE PROCEDURE sp_ToggleLuuMonAn
    @MaNguoiDung INT,
    @MaMonAn INT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        IF NOT EXISTS (SELECT 1 FROM MonAn WHERE MaMonAn = @MaMonAn)
        BEGIN
            RAISERROR(N'Món ăn không tồn tại.', 16, 1);
            RETURN;
        END

        IF EXISTS (SELECT 1 FROM MonAnDaLuu WHERE MaNguoiDung = @MaNguoiDung AND MaMonAn = @MaMonAn)
        BEGIN
            DELETE FROM MonAnDaLuu WHERE MaNguoiDung = @MaNguoiDung AND MaMonAn = @MaMonAn;
            SELECT 0 AS DaLuu, N'Đã bỏ lưu món ăn' AS ThongBao;
        END
        ELSE
        BEGIN
            INSERT INTO MonAnDaLuu (MaNguoiDung, MaMonAn, NgayLuu)
            VALUES (@MaNguoiDung, @MaMonAn, GETDATE());
            SELECT 1 AS DaLuu, N'Đã lưu món ăn vào danh sách yêu thích' AS ThongBao;
        END
    END TRY
    BEGIN CATCH
        THROW;
    END CATCH
END
GO

-- 7.2. Lấy danh sách món ăn đã lưu của một người dùng
IF OBJECT_ID('sp_LayDanhSachMonAnDaLuu', 'P') IS NOT NULL
    DROP PROCEDURE sp_LayDanhSachMonAnDaLuu;
GO
CREATE PROCEDURE sp_LayDanhSachMonAnDaLuu
    @MaNguoiDung INT,
    @Page INT = 1,
    @PageSize INT = 12
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @Offset INT = (@Page - 1) * @PageSize;

    DECLARE @TotalCount INT;
    SELECT @TotalCount = COUNT(*)
    FROM MonAnDaLuu
    WHERE MaNguoiDung = @MaNguoiDung;

    SELECT 
        m.MaMonAn,
        m.TenMonAn,
        m.CauChuyen,
        m.KhauPhan,
        m.ThoiGianNau,
        m.DuongDanAnhChinh,
        m.NgayTao,
        d.MaDanhMuc,
        d.TenDanhMuc,
        u.MaNguoiDung AS MaTacGia,
        u.TenDangNhap AS TenTacGia,
        u.AnhDaiDien AS AnhTacGia,
        f.NgayLuu,
        1 AS DaLuu,
        (SELECT COUNT(*) FROM MonAnDaLuu allF WHERE allF.MaMonAn = m.MaMonAn) AS SoLuotLuu,
        @TotalCount AS TongSoBanGhi
    FROM MonAnDaLuu f
    INNER JOIN MonAn m ON f.MaMonAn = m.MaMonAn
    LEFT JOIN DanhMuc d ON m.MaDanhMuc = d.MaDanhMuc
    LEFT JOIN NguoiDung u ON m.MaNguoiDung = u.MaNguoiDung
    WHERE f.MaNguoiDung = @MaNguoiDung
    ORDER BY f.NgayLuu DESC
    OFFSET @Offset ROWS
    FETCH NEXT @PageSize ROWS ONLY;
END
GO


-- ========================================================
-- 8. STORED PROCEDURES THỐNG KÊ (DASHBOARD ADMIN)
-- ========================================================

-- 8.1. Thống kê tổng quan hệ thống
IF OBJECT_ID('sp_ThongKeTongQuan', 'P') IS NOT NULL
    DROP PROCEDURE sp_ThongKeTongQuan;
GO
CREATE PROCEDURE sp_ThongKeTongQuan
AS
BEGIN
    SET NOCOUNT ON;
    SELECT 
        (SELECT COUNT(*) FROM NguoiDung) AS TongNguoiDung,
        (SELECT COUNT(*) FROM MonAn) AS TongMonAn,
        (SELECT COUNT(*) FROM DanhMuc) AS TongDanhMuc,
        (SELECT COUNT(*) FROM NguyenLieu) AS TongNguyenLieu,
        (SELECT COUNT(*) FROM MonAnDaLuu) AS TongLuotLuu;
END
GO

PRINT N'>>> ĐÃ TẠO TOÀN BỘ CÁC STORED PROCEDURES THÀNH CÔNG CHO HỆ THỐNG WHAT TO COOK! <<<';
GO
