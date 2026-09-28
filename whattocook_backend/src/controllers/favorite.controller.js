/**
 * ========================================================
 * CONTROLLER QUẢN LÝ MÓN ĂN YÊU THÍCH (FAVORITE / BOOKMARK)
 * Toàn bộ thao tác CSDL đều gọi Stored Procedure
 * ========================================================
 */

const { executeProcedure } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

class FavoriteController {
    /**
     * [POST] /api/favorites/toggle/:recipeId - Bật / Tắt lưu món ăn yêu thích
     */
    static async toggleFavorite(req, res, next) {
        try {
            const maNguoiDung = req.user.MaNguoiDung;
            const maMonAn = parseInt(req.params.recipeId, 10);

            if (!maMonAn) {
                return sendError(res, 'Mã món ăn không hợp lệ.', 400);
            }

            // Gọi Stored Procedure: sp_ToggleLuuMonAn
            const result = await executeProcedure('sp_ToggleLuuMonAn', {
                MaNguoiDung: maNguoiDung,
                MaMonAn: maMonAn
            });

            const data = result.recordset[0];
            return sendSuccess(res, {
                maMonAn,
                daLuu: data.DaLuu === 1
            }, data.ThongBao);
        } catch (error) {
            next(error);
        }
    }

    /**
     * [GET] /api/favorites - Lấy danh sách món ăn yêu thích của người dùng hiện tại
     */
    static async getMyFavorites(req, res, next) {
        try {
            const maNguoiDung = req.user.MaNguoiDung;
            const page = parseInt(req.query.page, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10) || 12;

            const isAdm = req.user && (req.user.TenVaiTro === 'Admin' || req.user.TenVaiTro === 'QuanTriVien');
            if (isAdm) {
                // Quản trị viên xem toàn bộ danh sách lượt lưu trong hệ thống
                result = await executeProcedure('sp_LayTatCaMonAnDaLuu', {
                    Page: page,
                    PageSize: pageSize
                });
            } else {
                // Người dùng thành viên xem danh sách món ăn yêu thích cá nhân
                result = await executeProcedure('sp_LayDanhSachMonAnDaLuu', {
                    MaNguoiDung: maNguoiDung,
                    Page: page,
                    PageSize: pageSize
                });
            }

            const favorites = result.recordset;
            const totalCount = favorites.length > 0 ? favorites[0].TongSoBanGhi : 0;

            const cleanedFavorites = favorites.map(f => {
                const { TongSoBanGhi, ...rest } = f;
                return rest;
            });

            return sendSuccess(res, cleanedFavorites, 'Lấy danh sách món ăn yêu thích thành công', 200, {
                page,
                pageSize,
                totalCount,
                totalPages: Math.ceil(totalCount / pageSize)
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = FavoriteController;
