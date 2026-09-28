/**
 * ========================================================
 * ROUTES MÓN ĂN YÊU THÍCH (FAVORITE ROUTES)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const FavoriteController = require('../controllers/favorite.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Toàn bộ các route yêu thích đều yêu cầu đăng nhập
router.use(authenticateToken);

// Bật / tắt lưu món ăn (Bookmark Toggle)
router.post('/toggle/:recipeId', FavoriteController.toggleFavorite);

// Lấy danh sách món ăn đã lưu
router.get('/', FavoriteController.getMyFavorites);

module.exports = router;
