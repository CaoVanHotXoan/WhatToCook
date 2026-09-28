/**
 * ========================================================
 * ROUTES CÀO DỮ LIỆU TỪ COOKPAD (CRAWLER ROUTES)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const CrawlerController = require('../controllers/crawler.controller');
const { authenticateToken } = require('../middlewares/auth.middleware');

// Tìm kiếm món ăn trên Cookpad (Công khai hoặc auth)
router.get('/search', CrawlerController.searchCookpad);

// Xem trước dữ liệu cào từ một link Cookpad (Công khai / Member)
router.post('/preview', CrawlerController.previewCookpadRecipe);

// Cào và tự động lưu vào CSDL (Yêu cầu đăng nhập)
router.post('/import', authenticateToken, CrawlerController.importCookpadRecipe);

module.exports = router;
