/**
 * ========================================================
 * CONTROLLER THỐNG KÊ HỆ THỐNG (STATS CONTROLLER - ADMIN)
 * Toàn bộ thao tác CSDL đều gọi Stored Procedure
 * ========================================================
 */

const { executeProcedure } = require('../config/db');
const { sendSuccess } = require('../utils/response.util');

class StatsController {
    /**
     * [GET] /api/stats/overview - Thống kê tổng quan hệ thống (Admin)
     */
    static async getOverview(req, res, next) {
        try {
            // Gọi Stored Procedure: sp_ThongKeTongQuan
            const result = await executeProcedure('sp_ThongKeTongQuan');
            const stats = result.recordset[0] || {
                TongNguoiDung: 0,
                TongMonAn: 0,
                TongDanhMuc: 0,
                TongNguyenLieu: 0,
                TongLuotLuu: 0
            };

            return sendSuccess(res, stats, 'Lấy dữ liệu thống kê tổng quan thành công');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = StatsController;
