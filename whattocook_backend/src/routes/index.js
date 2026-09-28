/**
 * ========================================================
 * TỔNG HỢP TOÀN BỘ CÁC API ROUTES CỦA DỰ ÁN
 * ========================================================
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const userRoutes = require('./user.routes');
const categoryRoutes = require('./category.routes');
const ingredientRoutes = require('./ingredient.routes');
const recipeRoutes = require('./recipe.routes');
const favoriteRoutes = require('./favorite.routes');
const crawlerRoutes = require('./crawler.routes');
const statsRoutes = require('./stats.routes');

// Gắn các router con với tiền tố endpoint tương ứng
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/categories', categoryRoutes);
router.use('/ingredients', ingredientRoutes);
router.use('/recipes', recipeRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/crawler', crawlerRoutes);
router.use('/stats', statsRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
    res.status(200).json({
        status: 'UP',
        message: 'What To Cook Backend REST API is running normally',
        timestamp: new Date().toISOString()
    });
});

module.exports = router;
