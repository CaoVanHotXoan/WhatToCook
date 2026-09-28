/**
 * ========================================================
 * MIDDLEWARES XỬ LÝ LỖI TOÀN CỤC (GLOBAL ERROR HANDLER)
 * ========================================================
 */

const { sendError } = require('../utils/response.util');

/**
 * Middleware bắt các route không tồn tại (404 Not Found)
 */
const notFoundHandler = (req, res, next) => {
    return sendError(res, `Đường dẫn [${req.method}] ${req.originalUrl} không tồn tại trên hệ thống.`, 404);
};

/**
 * Middleware xử lý tất cả lỗi chưa được bắt (500 Internal Server Error)
 */
const globalErrorHandler = (err, req, res, next) => {
    console.error('🔥 Server Error:', err);

    let statusCode = err.statusCode || 500;
    let message = err.message || 'Lỗi hệ thống máy chủ nội bộ.';

    // Bắt lỗi từ SQL Server RAISERROR hoặc THROW
    if (err.number || err.code === 'EREQUEST') {
        statusCode = 400;
        message = err.message || 'Lỗi thao tác cơ sở dữ liệu SQL Server.';
    }

    return sendError(res, message, statusCode, err);
};

module.exports = {
    notFoundHandler,
    globalErrorHandler
};
