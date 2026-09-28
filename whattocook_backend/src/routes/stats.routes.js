/**
 * ========================================================
 * ROUTES THỐNG KÊ HỆ THỐNG (STATS ROUTES - ADMIN)
 * ========================================================
 */

const express = require('express');
const router = express.Router();
const StatsController = require('../controllers/stats.controller');
const { authenticateToken, requireAdmin } = require('../middlewares/auth.middleware');

// Lấy thống kê tổng quan (Chỉ dành cho Admin)
router.get('/overview', authenticateToken, requireAdmin, StatsController.getOverview);

module.exports = router;
