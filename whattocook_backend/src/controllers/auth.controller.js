/**
 * ========================================================
 * CONTROLLER XÁC THỰC NGƯỜI DÙNG (AUTH CONTROLLER)
 * Toàn bộ thao tác CSDL đều gọi Stored Procedure
 * ========================================================
 */

const { executeProcedure } = require('../config/db');
const { generateToken, hashPassword, comparePassword } = require('../utils/token.util');
const { sendSuccess, sendError } = require('../utils/response.util');

class AuthController {
    /**
     * [POST] /api/auth/register - Đăng ký tài khoản người dùng mới
     */
    static async register(req, res, next) {
        try {
            const { tenDangNhap, email, matKhau, anhDaiDien, tieuSu } = req.body;

            // Validate đầu vào
            if (!tenDangNhap || !email || !matKhau) {
                return sendError(res, 'Vui lòng cung cấp đầy đủ tên đăng nhập, email và mật khẩu.', 400);
            }

            if (matKhau.length < 6) {
                return sendError(res, 'Mật khẩu phải có độ dài tối thiểu từ 6 ký tự.', 400);
            }

            // Mã hóa mật khẩu an toàn với bcryptjs
            const matKhauMaHoa = await hashPassword(matKhau);

            // Gọi Stored Procedure: sp_DangKyNguoiDung
            const result = await executeProcedure('sp_DangKyNguoiDung', {
                TenDangNhap: tenDangNhap,
                Email: email.toLowerCase().trim(),
                MatKhauMaHoa: matKhauMaHoa,
                AnhDaiDien: anhDaiDien || null,
                TieuSu: tieuSu || null
            });

            const user = result.recordset[0];
            if (!user) {
                return sendError(res, 'Đăng ký tài khoản thất bại.', 500);
            }

            // Tạo Token JWT
            const token = generateToken({
                MaNguoiDung: user.MaNguoiDung,
                Email: user.Email,
                TenVaiTro: user.TenVaiTro,
                TenDangNhap: user.TenDangNhap
            });

            return sendSuccess(res, { user, token }, 'Đăng ký tài khoản thành công!', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * [POST] /api/auth/login - Đăng nhập tài khoản (hỗ trợ cả Email và Tên đăng nhập)
     */
    static async login(req, res, next) {
        try {
            // Nhận email hoặc tenDangNhap hoặc username từ client
            const { email, tenDangNhap, username, taiKhoan, matKhau } = req.body;
            const accountInput = (email || tenDangNhap || username || taiKhoan || '').trim();

            if (!accountInput || !matKhau) {
                return sendError(res, 'Vui lòng nhập email / tên đăng nhập và mật khẩu.', 400);
            }

            // Gọi Stored Procedure: sp_LayNguoiDungTheoEmail (hỗ trợ kiểm tra cả Email hoặc Tên đăng nhập)
            const result = await executeProcedure('sp_LayNguoiDungTheoEmail', {
                Email: accountInput.toLowerCase()
            });

            const user = result.recordset[0];
            if (!user) {
                return sendError(res, 'Tài khoản (Email / Tên đăng nhập) hoặc mật khẩu không chính xác.', 401);
            }

            // So khớp mật khẩu với hash trong CSDL
            const isMatch = await comparePassword(matKhau, user.MatKhauMaHoa);
            if (!isMatch) {
                return sendError(res, 'Tài khoản (Email / Tên đăng nhập) hoặc mật khẩu không chính xác.', 401);
            }

            // Tạo JWT Token
            const token = generateToken({
                MaNguoiDung: user.MaNguoiDung,
                Email: user.Email,
                TenVaiTro: user.TenVaiTro,
                TenDangNhap: user.TenDangNhap
            });

            // Loại bỏ trường mật khẩu trước khi gửi về client
            const { MatKhauMaHoa, ...userProfile } = user;

            return sendSuccess(res, {
                user: userProfile,
                token
            }, 'Đăng nhập thành công!');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [GET] /api/auth/me - Lấy thông tin tài khoản hiện tại (Profile)
     */
    static async getProfile(req, res, next) {
        try {
            const maNguoiDung = req.user.MaNguoiDung;

            // Gọi Stored Procedure: sp_LayNguoiDungTheoId
            const result = await executeProcedure('sp_LayNguoiDungTheoId', {
                MaNguoiDung: maNguoiDung
            });

            const user = result.recordset[0];
            if (!user) {
                return sendError(res, 'Không tìm thấy thông tin người dùng.', 404);
            }

            return sendSuccess(res, user, 'Lấy thông tin cá nhân thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [PUT] /api/auth/update-profile - Cập nhật hồ sơ cá nhân
     */
    static async updateProfile(req, res, next) {
        try {
            const maNguoiDung = req.user.MaNguoiDung;
            const { tenDangNhap, anhDaiDien, tieuSu } = req.body;

            if (!tenDangNhap) {
                return sendError(res, 'Tên đăng nhập không được để trống.', 400);
            }

            // Gọi Stored Procedure: sp_CapNhatThongTinNguoiDung
            const result = await executeProcedure('sp_CapNhatThongTinNguoiDung', {
                MaNguoiDung: maNguoiDung,
                TenDangNhap: tenDangNhap,
                AnhDaiDien: anhDaiDien || null,
                TieuSu: tieuSu || null
            });

            const updatedUser = result.recordset[0];
            return sendSuccess(res, updatedUser, 'Cập nhật thông tin thành công!');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [PUT] /api/auth/change-password - Đổi mật khẩu
     */
    static async changePassword(req, res, next) {
        try {
            const maNguoiDung = req.user.MaNguoiDung;
            const { matKhauCu, matKhauMoi } = req.body;

            if (!matKhauCu || !matKhauMoi) {
                return sendError(res, 'Vui lòng nhập mật khẩu cũ và mật khẩu mới.', 400);
            }

            if (matKhauMoi.length < 6) {
                return sendError(res, 'Mật khẩu mới phải có ít nhất 6 ký tự.', 400);
            }

            // Lấy thông tin user hiện tại kèm mật khẩu cũ
            const userResult = await executeProcedure('sp_LayNguoiDungTheoEmail', {
                Email: req.user.Email
            });
            const user = userResult.recordset[0];

            // Kiểm tra mật khẩu cũ
            const isMatch = await comparePassword(matKhauCu, user.MatKhauMaHoa);
            if (!isMatch) {
                return sendError(res, 'Mật khẩu hiện tại không chính xác.', 400);
            }

            // Hash mật khẩu mới
            const matKhauMoiHash = await hashPassword(matKhauMoi);

            // Gọi Stored Procedure: sp_DoiMatKhau
            await executeProcedure('sp_DoiMatKhau', {
                MaNguoiDung: maNguoiDung,
                MatKhauMoi: matKhauMoiHash
            });

            return sendSuccess(res, null, 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AuthController;
