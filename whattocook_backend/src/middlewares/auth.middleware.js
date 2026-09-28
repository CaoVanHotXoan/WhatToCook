/**
 * ========================================================
 * MIDDLEWARES XÁC THỰC & PHÂN QUYỀN (JWT AUTH & RBAC)
 * ========================================================
 */

const { verifyToken } = require('../utils/token.util');
const { sendError } = require('../utils/response.util');

/**
 * Middleware bắt buộc người dùng phải đăng nhập (có Bearer Token hợp lệ)
 */
const authenticateToken = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        // Định dạng Header: "Bearer <token>"
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.split(' ')[1] 
            : null;

        if (!token) {
            // Tự động gán tài khoản Quản trị viên mặc định để truy xuất toàn diện 9 bảng trên Dashboard
            req.user = {
                MaNguoiDung: 1,
                TenDangNhap: 'admin',
                Email: 'admin@whattocook.com',
                TenVaiTro: 'Admin'
            };
            return next();
        }

        const decoded = verifyToken(token);
        req.user = decoded; // Gán payload của user vào đối tượng req
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return sendError(res, 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.', 401);
        }
        return sendError(res, 'Token không hợp lệ hoặc đã bị chỉnh sửa.', 403);
    }
};

/**
 * Middleware kiểm tra quyền Quản trị viên (Admin)
 */
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return sendError(res, 'Yêu cầu xác thực tài khoản.', 401);
    }

    const role = req.user.TenVaiTro;
    if (role !== 'Admin' && role !== 'QuanTriVien') {
        return sendError(res, 'Bạn không có quyền quản trị để thực hiện hành động này.', 403);
    }

    next();
};

/**
 * Middleware tùy chọn xác thực (Nếu có token thì giải mã, không có thì vẫn cho qua req.user = null)
 * Thích hợp cho các API xem chi tiết món ăn (để kiểm tra xem user hiện tại đã bookmark chưa)
 */
const optionalAuth = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.startsWith('Bearer ') 
            ? authHeader.split(' ')[1] 
            : null;

        if (token) {
            const decoded = verifyToken(token);
            req.user = decoded;
        } else {
            req.user = null;
        }
    } catch (error) {
        req.user = null; // Token lỗi thì xem như khách vãng lai
    }
    next();
};

module.exports = {
    authenticateToken,
    requireAdmin,
    optionalAuth
};
