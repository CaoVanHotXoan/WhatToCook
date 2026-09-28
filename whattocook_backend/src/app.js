/**
 * ========================================================
 * CẤU HÌNH ỨNG DỤNG EXPRESS (EXPRESS APP CONFIGURATION)
 * ========================================================
 */

const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes');
const { notFoundHandler, globalErrorHandler } = require('./middlewares/error.middleware');

const app = express();

// 1. Cấu hình CORS để cho phép Next.js Frontend truy cập
const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
app.use(cors({
    origin: (origin, callback) => {
        // Cho phép các request không có origin (ví dụ Postman, Server-to-server) hoặc từ clientUrl
        if (!origin || origin === clientUrl || origin.startsWith('http://localhost:')) {
            callback(null, true);
        } else {
            callback(null, true); // Cho phép tất cả trong môi trường phát triển
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Parsers cho body JSON và URL Encoded
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 3. Logger đơn giản trong môi trường phát triển
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

// 4. API Routes chính
app.use('/api', apiRoutes);

// 5. Route trang chủ chào đón
app.get('/', (req, res) => {
    res.json({
        name: 'What To Cook RESTful API',
        version: '1.0.0',
        author: 'Backend Team',
        description: 'RESTful API hỗ trợ gợi ý món ăn, quản lý công thức, cào dữ liệu Cookpad và kết nối SQL Server qua Stored Procedures.',
        docs: '/api/health'
    });
});

// 6. Xử lý lỗi Route không tồn tại (404)
app.use(notFoundHandler);

// 7. Xử lý lỗi toàn cục (500)
app.use(globalErrorHandler);

module.exports = app;
