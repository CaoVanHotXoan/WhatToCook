/**
 * ========================================================
 * ROUTES XÁC THỰC NGƯỜI DÙNG (AUTH ROUTES)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Đăng ký tài khoản mới
router.post('/register', AuthController.register);

// Đăng nhập
router.post('/login', AuthController.login);

// Lấy thông tin cá nhân (Yêu cầu JWT)
router.get('/me', authenticateToken, AuthController.getProfile);

// Cập nhật hồ sơ (Yêu cầu JWT)
router.put('/update-profile', authenticateToken, AuthController.updateProfile);

// Đổi mật khẩu (Yêu cầu JWT)
router.put('/change-password', authenticateToken, AuthController.changePassword);

module.exports = router;
