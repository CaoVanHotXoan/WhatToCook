/**
 * ========================================================
 * ROUTES QUẢN LÝ DANH MỤC MÓN ĂN (CATEGORY ROUTES)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/category.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Công khai: Xem danh sách và chi tiết danh mục
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Admin: Thêm, sửa, xóa danh mục
router.post('/', authenticateToken, requireAdmin, CategoryController.createCategory);
router.put('/:id', authenticateToken, requireAdmin, CategoryController.updateCategory);
router.delete('/:id', authenticateToken, requireAdmin, CategoryController.deleteCategory);

module.exports = router;
