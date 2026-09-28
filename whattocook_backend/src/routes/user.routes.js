/**
 * ========================================================
 * ROUTES QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (USER ROUTES - ADMIN)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Áp dụng xác thực và quyền Admin cho toàn bộ routes user bên dưới
router.use(authenticateToken, requireAdmin);

// Lấy danh sách người dùng
router.get('/', UserController.getAllUsers);

// Lấy danh sách các vai trò hệ thống
router.get('/roles', UserController.getRoles);

// Phân quyền vai trò người dùng
router.put('/:id/role', UserController.updateUserRole);

// Xóa người dùng
router.delete('/:id', UserController.deleteUser);

module.exports = router;
