/**
 * ========================================================
 * CONTROLLER QUẢN LÝ DANH MỤC MÓN ĂN (CATEGORY CONTROLLER)
 * Toàn bộ thao tác CSDL đều gọi Stored Procedure
 * ========================================================
 */

const { executeProcedure } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

class CategoryController {
    /**
     * [GET] /api/categories - Lấy danh sách tất cả danh mục kèm số lượng món
     */
    static async getAllCategories(req, res, next) {
        try {
            // Gọi Stored Procedure: sp_LayTatCaDanhMuc
            const result = await executeProcedure('sp_LayTatCaDanhMuc');
            return sendSuccess(res, result.recordset, 'Lấy danh sách danh mục thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [GET] /api/categories/:id - Lấy chi tiết danh mục theo ID
     */
    static async getCategoryById(req, res, next) {
        try {
            const maDanhMuc = parseInt(req.params.id, 10);

            // Gọi Stored Procedure: sp_LayDanhMucTheoId
            const result = await executeProcedure('sp_LayDanhMucTheoId', {
                MaDanhMuc: maDanhMuc
            });

            const category = result.recordset[0];
            if (!category) {
                return sendError(res, 'Không tìm thấy danh mục yêu cầu.', 404);
            }

            return sendSuccess(res, category, 'Lấy chi tiết danh mục thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [POST] /api/categories - Thêm danh mục mới (Admin)
     */
    static async createCategory(req, res, next) {
        try {
            const { tenDanhMuc } = req.body;

            if (!tenDanhMuc || !tenDanhMuc.trim()) {
                return sendError(res, 'Tên danh mục không được để trống.', 400);
            }

            // Gọi Stored Procedure: sp_ThemDanhMuc
            const result = await executeProcedure('sp_ThemDanhMuc', {
                TenDanhMuc: tenDanhMuc.trim()
            });

            return sendSuccess(res, result.recordset[0], 'Tạo danh mục mới thành công', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * [PUT] /api/categories/:id - Cập nhật danh mục (Admin)
     */
    static async updateCategory(req, res, next) {
        try {
            const maDanhMuc = parseInt(req.params.id, 10);
            const { tenDanhMuc } = req.body;

            if (!tenDanhMuc || !tenDanhMuc.trim()) {
                return sendError(res, 'Tên danh mục không được để trống.', 400);
            }

            // Gọi Stored Procedure: sp_CapNhatDanhMuc
            const result = await executeProcedure('sp_CapNhatDanhMuc', {
                MaDanhMuc: maDanhMuc,
                TenDanhMuc: tenDanhMuc.trim()
            });

            return sendSuccess(res, result.recordset[0], 'Cập nhật danh mục thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [DELETE] /api/categories/:id - Xóa danh mục (Admin)
     */
    static async deleteCategory(req, res, next) {
        try {
            const maDanhMuc = parseInt(req.params.id, 10);

            // Gọi Stored Procedure: sp_XoaDanhMuc
            await executeProcedure('sp_XoaDanhMuc', {
                MaDanhMuc: maDanhMuc
            });

            return sendSuccess(res, null, 'Xóa danh mục thành công');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CategoryController;
