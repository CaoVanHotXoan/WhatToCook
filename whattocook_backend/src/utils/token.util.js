/**
 * ========================================================
 * UTILITY XỬ LÝ JSON WEB TOKEN (JWT) & MÃ HÓA BCRYPT
 * ========================================================
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'whattocook_super_secret_jwt_key_2026_!@#$%^';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Tạo mã JWT cho người dùng
 * @param {Object} payload - Thông tin người dùng { MaNguoiDung, Email, TenVaiTro, TenDangNhap }
 * @returns {string} Token
 */
const generateToken = (payload) => {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN
    });
};

/**
 * Xác thực và giải mã JWT
 * @param {string} token
 * @returns {Object} Payload giải mã
 */
const verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};

/**
 * Mã hóa mật khẩu với bcryptjs (Salt rounds: 10)
 * @param {string} rawPassword 
 * @returns {Promise<string>} Chuỗi hash
 */
const hashPassword = async (rawPassword) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(rawPassword, salt);
};

/**
 * Đối chiếu mật khẩu nhập vào với chuỗi hash trong CSDL
 * @param {string} rawPassword 
 * @param {string} hashedPassword 
 * @returns {Promise<boolean>}
 */
const comparePassword = async (rawPassword, hashedPassword) => {
    return await bcrypt.compare(rawPassword, hashedPassword);
};

module.exports = {
    generateToken,
    verifyToken,
    hashPassword,
    comparePassword
};
