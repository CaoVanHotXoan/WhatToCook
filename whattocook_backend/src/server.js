/**
 * ========================================================
 * ENTRY POINT KHỞI ĐỘNG MÁY CHỦ HTTP (SERVER.JS)
 * Cập nhật cấu hình kết nối SQL Server
 * ========================================================
 */

require('dotenv').config();
const http = require('http');
const app = require('./app');
const { getPool } = require('./config/db');

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

// Khởi động server và kiểm tra kết nối CSDL
const startServer = async () => {
    try {
        console.log('🔄 Đang kiểm tra kết nối tới Cơ sở dữ liệu SQL Server...');
        await getPool();
        console.log('✅ Cơ sở dữ liệu SQL Server đã sẵn sàng!');

        server.listen(PORT, () => {
            console.log('====================================================');
            console.log(`🚀 What To Cook Backend đang chạy tại: http://localhost:${PORT}`);
            console.log(`📡 API Health Check: http://localhost:${PORT}/api/health`);
            console.log(`⚙️  Môi trường: ${process.env.NODE_ENV || 'development'}`);
            console.log('====================================================');
        });
    } catch (error) {
        console.error('❌ Không thể khởi động server do lỗi kết nối CSDL:', error.message);
        console.log('⚠️  Vui lòng kiểm tra lại cấu hình tài khoản sa trong file .env và đảm bảo SQL Server đang chạy.');
        // Vẫn cho phép server chạy để người dùng có thể debug hoặc sửa env
        server.listen(PORT, () => {
            console.log(`⚠️ Server vẫn đang lắng nghe tại port ${PORT} (chưa kết nối được DB).`);
        });
    }
};

startServer();
