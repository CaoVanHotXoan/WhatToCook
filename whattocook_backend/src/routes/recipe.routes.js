/**
 * ========================================================
 * ROUTES MÓN ĂN & CÔNG THỨC NẤU ĂN (RECIPE ROUTES)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const RecipeController = require('../controllers/recipe.controller');
const { authenticateToken, optionalAuth } = require('../middlewares/auth.middleware');

// Gợi ý món ăn theo nguyên liệu có sẵn ("What to Cook" cốt lõi)
router.get('/suggest', RecipeController.suggestRecipes);

// Lấy danh sách món ăn do chính người dùng hiện tại đăng
router.get('/my-recipes', authenticateToken, RecipeController.getMyRecipes);

// Lấy danh sách tất cả món ăn (kèm lọc tìm kiếm, danh mục, phân trang)
router.get('/', RecipeController.getAllRecipes);

// Lấy chi tiết một món ăn (kèm kiểm tra đã bookmark chưa nếu có token)
router.get('/:id', optionalAuth, RecipeController.getRecipeById);

// Tạo món ăn mới (Yêu cầu đăng nhập)
router.post('/', authenticateToken, RecipeController.createRecipe);

// Cập nhật món ăn (Yêu cầu đăng nhập, chỉ tác giả hoặc Admin)
router.put('/:id', authenticateToken, RecipeController.updateRecipe);

// Xóa món ăn (Yêu cầu đăng nhập, chỉ tác giả hoặc Admin)
router.delete('/:id', authenticateToken, RecipeController.deleteRecipe);

module.exports = router;
