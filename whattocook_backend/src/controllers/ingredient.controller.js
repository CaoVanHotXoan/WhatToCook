/**
 * ========================================================
 * CONTROLLER QUẢN LÝ NGUYÊN LIỆU & TỪ ĐỒNG NGHĨA (INGREDIENT)
 * Toàn bộ thao tác CSDL đều gọi Stored Procedure
 * ========================================================
 */

const { executeProcedure } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

class IngredientController {
    /**
     * [GET] /api/ingredients - Lấy danh sách nguyên liệu (hỗ trợ lọc từ khóa, loại)
     */
    static async getAllIngredients(req, res, next) {
        try {
            const search = req.query.search || null;
            const type = req.query.type || null; // 'Chinh' hoặc 'GiaVi'

            // Gọi Stored Procedure: sp_LayTatCaNguyenLieu
            const result = await executeProcedure('sp_LayTatCaNguyenLieu', {
                TuKhoa: search,
                LoaiNguyenLieu: type
            });

            return sendSuccess(res, result.recordset, 'Lấy danh sách nguyên liệu thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [POST] /api/ingredients - Thêm mới nguyên liệu
     */
    static async createIngredient(req, res, next) {
        try {
            const { tenNguyenLieu, loaiNguyenLieu } = req.body;

            if (!tenNguyenLieu || !tenNguyenLieu.trim()) {
                return sendError(res, 'Tên nguyên liệu không được để trống.', 400);
            }

            // Gọi Stored Procedure: sp_ThemHoacLayNguyenLieu
            const result = await executeProcedure('sp_ThemHoacLayNguyenLieu', {
                TenNguyenLieu: tenNguyenLieu.trim(),
                LoaiNguyenLieu: loaiNguyenLieu || 'Chinh'
            });

            return sendSuccess(res, result.recordset[0], 'Thêm nguyên liệu thành công', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * [PUT] /api/ingredients/:id - Cập nhật nguyên liệu (Admin)
     */
    static async updateIngredient(req, res, next) {
        try {
            const maNguyenLieu = parseInt(req.params.id, 10);
            const { tenNguyenLieu, loaiNguyenLieu } = req.body;

            if (!tenNguyenLieu || !tenNguyenLieu.trim()) {
                return sendError(res, 'Tên nguyên liệu không được để trống.', 400);
            }

            // Gọi Stored Procedure: sp_CapNhatNguyenLieu
            const result = await executeProcedure('sp_CapNhatNguyenLieu', {
                MaNguyenLieu: maNguyenLieu,
                TenNguyenLieu: tenNguyenLieu.trim(),
                LoaiNguyenLieu: loaiNguyenLieu || 'Chinh'
            });

            return sendSuccess(res, result.recordset[0], 'Cập nhật nguyên liệu thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [DELETE] /api/ingredients/:id - Xóa nguyên liệu (Admin)
     */
    static async deleteIngredient(req, res, next) {
        try {
            const maNguyenLieu = parseInt(req.params.id, 10);

            // Gọi Stored Procedure: sp_XoaNguyenLieu
            await executeProcedure('sp_XoaNguyenLieu', {
                MaNguyenLieu: maNguyenLieu
            });

            return sendSuccess(res, null, 'Xóa nguyên liệu thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [GET] /api/ingredients/:id/synonyms - Lấy danh sách từ đồng nghĩa của một nguyên liệu
     */
    static async getSynonyms(req, res, next) {
        try {
            const maNguyenLieu = parseInt(req.params.id, 10);

            // Gọi Stored Procedure: sp_LayTuDongNghiaTheoNguyenLieu
            const result = await executeProcedure('sp_LayTuDongNghiaTheoNguyenLieu', {
                MaNguyenLieu: maNguyenLieu
            });

            return sendSuccess(res, result.recordset, 'Lấy danh sách từ đồng nghĩa thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [POST] /api/ingredients/:id/synonyms - Thêm từ đồng nghĩa cho nguyên liệu
     */
    static async addSynonym(req, res, next) {
        try {
            const maNguyenLieu = parseInt(req.params.id, 10);
            const { tenTuDongNghia } = req.body;

            if (!tenTuDongNghia || !tenTuDongNghia.trim()) {
                return sendError(res, 'Từ đồng nghĩa không được để trống.', 400);
            }

            // Gọi Stored Procedure: sp_ThemTuDongNghia
            const result = await executeProcedure('sp_ThemTuDongNghia', {
                MaNguyenLieu: maNguyenLieu,
                TenTuDongNghia: tenTuDongNghia.trim()
            });

            return sendSuccess(res, result.recordset[0], 'Thêm từ đồng nghĩa thành công', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * [DELETE] /api/ingredients/synonyms/:synonymId - Xóa từ đồng nghĩa
     */
    static async deleteSynonym(req, res, next) {
        try {
            const maTuDongNghia = parseInt(req.params.synonymId, 10);

            // Gọi Stored Procedure: sp_XoaTuDongNghia
            await executeProcedure('sp_XoaTuDongNghia', {
                MaTuDongNghia: maTuDongNghia
            });

            return sendSuccess(res, null, 'Xóa từ đồng nghĩa thành công');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = IngredientController;
