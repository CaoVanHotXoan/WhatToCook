/**
 * ========================================================
 * ROUTES NGUYÊN LIỆU & TỪ ĐỒNG NGHĨA (INGREDIENT ROUTES)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const IngredientController = require('../controllers/ingredient.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Lấy danh sách nguyên liệu
router.get('/', IngredientController.getAllIngredients);

// Tạo mới nguyên liệu (Thành viên hoặc Admin)
router.post('/', authenticateToken, IngredientController.createIngredient);

// Cập nhật nguyên liệu (Admin)
router.put('/:id', authenticateToken, requireAdmin, IngredientController.updateIngredient);

// Xóa nguyên liệu (Admin)
router.delete('/:id', authenticateToken, requireAdmin, IngredientController.deleteIngredient);

// Quản lý từ đồng nghĩa
router.get('/:id/synonyms', IngredientController.getSynonyms);
router.post('/:id/synonyms', authenticateToken, requireAdmin, IngredientController.addSynonym);
router.delete('/synonyms/:synonymId', authenticateToken, requireAdmin, IngredientController.deleteSynonym);

module.exports = router;
