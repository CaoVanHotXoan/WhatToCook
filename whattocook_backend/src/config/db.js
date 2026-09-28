/**
 * ========================================================
 * CẤU HÌNH & KẾT NỐI CƠ SỞ DỮ LIỆU SQL SERVER
 * Hỗ trợ tự động chuẩn hóa Server (localhost, 127.0.0.1, Named Instance SQLEXPRESS)
 * ========================================================
 */

const sql = require('mssql');
require('dotenv').config();

let rawServer = process.env.DB_SERVER || 'localhost';
let instanceName = process.env.DB_INSTANCE || undefined;

// Xử lý trường hợp người dùng nhập dấu '.' hoặc '(local)' theo thói quen của SSMS
if (rawServer === '.' || rawServer === '(local)' || rawServer.toLowerCase() === 'local') {
    rawServer = 'localhost';
}

// Xử lý trường hợp người dùng nhập dạng 'localhost\\SQLEXPRESS' hoặc '.\\SQLEXPRESS'
if (rawServer.includes('\\')) {
    const parts = rawServer.split('\\');
    rawServer = (parts[0] === '.' || parts[0] === '(local)' || !parts[0]) ? 'localhost' : parts[0];
    instanceName = parts[1];
}

const dbConfig = {
    user: process.env.DB_USER || 'sa',
    password: process.env.DB_PASSWORD || '123',
    server: rawServer,
    database: process.env.DB_NAME || 'WhatToCook',
    options: {
        encrypt: process.env.DB_ENCRYPT === 'true',
        trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE !== 'false',
        enableArithAbort: true,
    },
    pool: {
        max: 20,
        min: 2,
        idleTimeoutMillis: 30000
    }
};

// Nếu có chỉ định Instance Name (ví dụ SQLEXPRESS), đưa vào options
if (instanceName) {
    dbConfig.options.instanceName = instanceName;
} else if (process.env.DB_PORT) {
    // Chỉ gán cứng port nếu không dùng dynamic instance
    dbConfig.port = parseInt(process.env.DB_PORT, 10);
}

let poolPromise = null;

/**
 * Hàm khởi tạo và lấy Connection Pool kết nối tới SQL Server
 */
const getPool = async () => {
    if (!poolPromise) {
        poolPromise = new sql.ConnectionPool(dbConfig)
            .connect()
            .then(pool => {
                console.log(`✅ Đã kết nối thành công tới SQL Server [${dbConfig.server}] - Database: [${dbConfig.database}] bằng tài khoản [${dbConfig.user}]!`);
                return pool;
            })
            .catch(err => {
                console.error('❌ Lỗi kết nối CSDL SQL Server:', err.message);
                poolPromise = null;
                throw err;
            });
    }
    return poolPromise;
};

/**
 * Hàm tiện ích thực thi Stored Procedure
 */
const executeProcedure = async (procedureName, params = {}) => {
    try {
        const pool = await getPool();
        const request = pool.request();

        Object.entries(params).forEach(([key, paramConfig]) => {
            if (paramConfig && typeof paramConfig === 'object' && paramConfig.type !== undefined) {
                request.input(key, paramConfig.type, paramConfig.value);
            } else {
                request.input(key, paramConfig);
            }
        });

        const result = await request.execute(procedureName);
        return {
            recordset: result.recordset || [],
            recordsets: result.recordsets || [],
            rowsAffected: result.rowsAffected,
            returnValue: result.returnValue
        };
    } catch (error) {
        console.error(`❌ Lỗi khi thực thi Stored Procedure [${procedureName}]:`, error.message);
        throw error;
    }
};

module.exports = {
    sql,
    dbConfig,
    getPool,
    executeProcedure
};
