/**
 * ========================================================
 * CONTROLLER QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN (ADMIN)
 * Toàn bộ thao tác CSDL đều gọi Stored Procedure
 * ========================================================
 */

const { executeProcedure } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

class UserController {
    /**
     * [GET] /api/users - Lấy danh sách tất cả người dùng (Admin)
     */
    static async getAllUsers(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10) || 20;
            const search = req.query.search || null;

            // Gọi Stored Procedure: sp_LayTatCaNguoiDung
            const result = await executeProcedure('sp_LayTatCaNguoiDung', {
                TuKhoa: search,
                Page: page,
                PageSize: pageSize
            });

            const users = result.recordset;
            const totalCount = users.length > 0 ? users[0].TongSoBanGhi : 0;

            // Xóa trường TongSoBanGhi khỏi từng object người dùng để JSON sạch sẽ
            const cleanedUsers = users.map(u => {
                const { TongSoBanGhi, ...rest } = u;
                return rest;
            });

            return sendSuccess(res, cleanedUsers, 'Lấy danh sách người dùng thành công', 200, {
                page,
                pageSize,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize)
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * [GET] /api/users/roles - Lấy danh sách tất cả vai trò
     */
    static async getRoles(req, res, next) {
        try {
            // Gọi Stored Procedure: sp_LayTatCaVaiTro
            const result = await executeProcedure('sp_LayTatCaVaiTro');
            return sendSuccess(res, result.recordset, 'Lấy danh sách vai trò thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [PUT] /api/users/:id/role - Phân quyền vai trò người dùng (Admin)
     */
    static async updateUserRole(req, res, next) {
        try {
            const maNguoiDung = parseInt(req.params.id, 10);
            const { maVaiTro } = req.body;

            if (!maVaiTro) {
                return sendError(res, 'Vui lòng cung cấp mã vai trò mới.', 400);
            }

            // Gọi Stored Procedure: sp_CapNhatVaiTroNguoiDung
            const result = await executeProcedure('sp_CapNhatVaiTroNguoiDung', {
                MaNguoiDung: maNguoiDung,
                MaVaiTro: parseInt(maVaiTro, 10)
            });

            return sendSuccess(res, result.recordset[0], 'Cập nhật vai trò người dùng thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [DELETE] /api/users/:id - Xóa người dùng (Admin)
     */
    static async deleteUser(req, res, next) {
        try {
            const maNguoiDung = parseInt(req.params.id, 10);

            // Không cho phép tự xóa chính mình
            if (req.user.MaNguoiDung === maNguoiDung) {
                return sendError(res, 'Bạn không thể tự xóa tài khoản của chính mình.', 400);
            }

            // Gọi Stored Procedure: sp_XoaNguoiDung
            await executeProcedure('sp_XoaNguoiDung', {
                MaNguoiDung: maNguoiDung
            });

            return sendSuccess(res, null, 'Xóa người dùng thành công');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = UserController;
