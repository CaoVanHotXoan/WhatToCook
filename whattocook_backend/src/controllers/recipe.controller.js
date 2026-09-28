/**
 * ========================================================
 * CONTROLLER QUẢN LÝ MÓN ĂN & CÔNG THỨC NẤU ĂN (RECIPE)
 * Toàn bộ thao tác CSDL đều gọi Stored Procedure
 * ========================================================
 */

const { executeProcedure } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

class RecipeController {
    /**
     * [GET] /api/recipes - Lấy danh sách món ăn (Tìm kiếm, Lọc danh mục, Lọc tác giả, Phân trang)
     */
    static async getAllRecipes(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10) || 12;
            const search = req.query.search || null;
            const categoryId = req.query.categoryId ? parseInt(req.query.categoryId, 10) : null;
            const userId = req.query.userId ? parseInt(req.query.userId, 10) : null;

            // Gọi Stored Procedure: sp_LayDanhSachMonAn
            const result = await executeProcedure('sp_LayDanhSachMonAn', {
                TuKhoa: search,
                MaDanhMuc: categoryId,
                MaNguoiDung: userId,
                Page: page,
                PageSize: pageSize
            });

            const recipes = result.recordset;
            const totalCount = recipes.length > 0 ? recipes[0].TongSoBanGhi : 0;

            const cleanedRecipes = recipes.map(r => {
                const { TongSoBanGhi, ...rest } = r;
                return rest;
            });

            return sendSuccess(res, cleanedRecipes, 'Lấy danh sách món ăn thành công', 200, {
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
     * [GET] /api/recipes/suggest - Tính năng cốt lõi: Gợi ý món ăn theo nguyên liệu có sẵn ("What to Cook")
     * Query: ?ingredients=trứng gà, thịt heo, cà chua
     */
    static async suggestRecipes(req, res, next) {
        try {
            const ingredientsQuery = req.query.ingredients;
            const page = parseInt(req.query.page, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10) || 12;

            if (!ingredientsQuery || !ingredientsQuery.trim()) {
                return sendError(res, 'Vui lòng cung cấp danh sách nguyên liệu bạn có (cách nhau bởi dấu phẩy).', 400);
            }

            // Gọi Stored Procedure: sp_GoiYMonAnTheoNguyenLieu
            const result = await executeProcedure('sp_GoiYMonAnTheoNguyenLieu', {
                ChuoiNguyenLieu: ingredientsQuery.trim(),
                Page: page,
                PageSize: pageSize
            });

            const recipes = result.recordset;
            const totalCount = recipes.length > 0 ? recipes[0].TongSoBanGhi : 0;

            const cleanedRecipes = recipes.map(r => {
                const { TongSoBanGhi, ...rest } = r;
                return rest;
            });

            return sendSuccess(res, cleanedRecipes, 'Gợi ý món ăn theo nguyên liệu thành công', 200, {
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
     * [GET] /api/recipes/my-recipes - Lấy danh sách món ăn do chính người dùng hiện tại đăng
     */
    static async getMyRecipes(req, res, next) {
        try {
            const page = parseInt(req.query.page, 10) || 1;
            const pageSize = parseInt(req.query.pageSize, 10) || 12;
            const maNguoiDung = req.user.MaNguoiDung;

            // Gọi Stored Procedure: sp_LayDanhSachMonAn
            const result = await executeProcedure('sp_LayDanhSachMonAn', {
                TuKhoa: null,
                MaDanhMuc: null,
                MaNguoiDung: maNguoiDung,
                Page: page,
                PageSize: pageSize
            });

            const recipes = result.recordset;
            const totalCount = recipes.length > 0 ? recipes[0].TongSoBanGhi : 0;

            const cleanedRecipes = recipes.map(r => {
                const { TongSoBanGhi, ...rest } = r;
                return rest;
            });

            return sendSuccess(res, cleanedRecipes, 'Lấy danh sách món ăn của tôi thành công', 200, {
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
     * [GET] /api/recipes/:id - Lấy chi tiết món ăn (Kèm các bước nấu và nguyên liệu)
     */
    static async getRecipeById(req, res, next) {
        try {
            const maMonAn = parseInt(req.params.id, 10);
            const currentUserId = req.user ? req.user.MaNguoiDung : null;

            // Gọi Stored Procedure: sp_LayChiTietMonAnTheoId
            const result = await executeProcedure('sp_LayChiTietMonAnTheoId', {
                MaMonAn: maMonAn,
                MaNguoiDungHienTai: currentUserId
            });

            // Thủ tục trả về 3 Recordsets:
            // 0: Thông tin chung món ăn
            // 1: Các bước thực hiện
            // 2: Danh sách nguyên liệu
            const generalInfo = result.recordsets[0] ? result.recordsets[0][0] : null;

            if (!generalInfo) {
                return sendError(res, 'Không tìm thấy món ăn yêu cầu.', 404);
            }

            const steps = result.recordsets[1] || [];
            const ingredients = result.recordsets[2] || [];

            const fullRecipe = {
                ...generalInfo,
                cacBuoc: steps,
                nguyenLieu: ingredients
            };

            return sendSuccess(res, fullRecipe, 'Lấy chi tiết món ăn thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [POST] /api/recipes - Tạo mới món ăn (kèm các bước và nguyên liệu)
     */
    static async createRecipe(req, res, next) {
        try {
            const maNguoiDung = req.user.MaNguoiDung;
            const {
                tenMonAn,
                maDanhMuc,
                cauChuyen,
                khauPhan,
                thoiGianNau,
                duongDanAnhChinh,
                cacBuoc,       // Array of { soThuTuBuoc, noiDungHuongDan, duongDanAnhBuoc }
                nguyenLieu     // Array of { tenNguyenLieu, dinhLuong, laNguyenLieuChinh, loaiNguyenLieu }
            } = req.body;

            if (!tenMonAn || !tenMonAn.trim()) {
                return sendError(res, 'Tên món ăn không được để trống.', 400);
            }

            // 1. Tạo bản ghi món ăn chính qua Stored Procedure: sp_ThemMonAn
            const createRecipeResult = await executeProcedure('sp_ThemMonAn', {
                MaNguoiDung: maNguoiDung,
                MaDanhMuc: maDanhMuc ? parseInt(maDanhMuc, 10) : null,
                TenMonAn: tenMonAn.trim(),
                CauChuyen: cauChuyen || null,
                KhauPhan: khauPhan ? parseInt(khauPhan, 10) : 4,
                ThoiGianNau: thoiGianNau ? parseInt(thoiGianNau, 10) : 30,
                DuongDanAnhChinh: duongDanAnhChinh || null
            });

            const maMonAn = createRecipeResult.recordset[0].MaMonAn;

            // 2. Thêm các bước thực hiện qua Stored Procedure: sp_ThemBuocThucHien
            if (Array.isArray(cacBuoc) && cacBuoc.length > 0) {
                for (let i = 0; i < cacBuoc.length; i++) {
                    const step = cacBuoc[i];
                    if (step.noiDungHuongDan && step.noiDungHuongDan.trim()) {
                        await executeProcedure('sp_ThemBuocThucHien', {
                            MaMonAn: maMonAn,
                            SoThuTuBuoc: step.soThuTuBuoc || (i + 1),
                            NoiDungHuongDan: step.noiDungHuongDan.trim(),
                            DuongDanAnhBuoc: step.duongDanAnhBuoc || null
                        });
                    }
                }
            }

            // 3. Thêm nguyên liệu món ăn qua Stored Procedure: sp_ThemHoacLayNguyenLieu & sp_ThemNguyenLieuMonAn
            if (Array.isArray(nguyenLieu) && nguyenLieu.length > 0) {
                for (const item of nguyenLieu) {
                    if (item.tenNguyenLieu && item.tenNguyenLieu.trim()) {
                        // Tìm hoặc tạo nguyên liệu trong từ điển
                        const ingResult = await executeProcedure('sp_ThemHoacLayNguyenLieu', {
                            TenNguyenLieu: item.tenNguyenLieu.trim(),
                            LoaiNguyenLieu: item.loaiNguyenLieu || 'Chinh'
                        });

                        const maNguyenLieu = ingResult.recordset[0].MaNguyenLieu;

                        // Gán vào bảng nối nguyên liệu món ăn
                        await executeProcedure('sp_ThemNguyenLieuMonAn', {
                            MaMonAn: maMonAn,
                            MaNguyenLieu: maNguyenLieu,
                            DinhLuong: item.dinhLuong || null,
                            LaNguyenLieuChinh: item.laNguyenLieuChinh !== undefined ? Boolean(item.laNguyenLieuChinh) : true
                        });
                    }
                }
            }

            // Lấy lại chi tiết món ăn vừa tạo để trả về client
            const finalResult = await executeProcedure('sp_LayChiTietMonAnTheoId', {
                MaMonAn: maMonAn,
                MaNguoiDungHienTai: maNguoiDung
            });

            const fullRecipe = {
                ...finalResult.recordsets[0][0],
                cacBuoc: finalResult.recordsets[1] || [],
                nguyenLieu: finalResult.recordsets[2] || []
            };

            return sendSuccess(res, fullRecipe, 'Tạo món ăn mới thành công!', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * [PUT] /api/recipes/:id - Cập nhật món ăn (Chỉ tác giả hoặc Admin)
     */
    static async updateRecipe(req, res, next) {
        try {
            const maMonAn = parseInt(req.params.id, 10);
            const currentUser = req.user;

            // Kiểm tra món ăn tồn tại và quyền sở hữu
            const checkResult = await executeProcedure('sp_LayChiTietMonAnTheoId', {
                MaMonAn: maMonAn
            });

            const existing = checkResult.recordsets[0] ? checkResult.recordsets[0][0] : null;
            if (!existing) {
                return sendError(res, 'Món ăn không tồn tại.', 404);
            }

            // Phân quyền: Chỉ chủ sở hữu hoặc Quản trị viên mới được sửa
            const isAdm = currentUser.TenVaiTro === 'Admin' || currentUser.TenVaiTro === 'QuanTriVien';
            if (existing.MaNguoiDung !== currentUser.MaNguoiDung && !isAdm) {
                return sendError(res, 'Bạn không có quyền chỉnh sửa món ăn này.', 403);
            }

            const {
                tenMonAn,
                maDanhMuc,
                cauChuyen,
                khauPhan,
                thoiGianNau,
                duongDanAnhChinh,
                cacBuoc,
                nguyenLieu
            } = req.body;

            // 1. Cập nhật thông tin chính qua Stored Procedure: sp_CapNhatMonAn
            await executeProcedure('sp_CapNhatMonAn', {
                MaMonAn: maMonAn,
                MaDanhMuc: maDanhMuc ? parseInt(maDanhMuc, 10) : null,
                TenMonAn: (tenMonAn || existing.TenMonAn).trim(),
                CauChuyen: cauChuyen !== undefined ? cauChuyen : existing.CauChuyen,
                KhauPhan: khauPhan ? parseInt(khauPhan, 10) : existing.KhauPhan,
                ThoiGianNau: thoiGianNau ? parseInt(thoiGianNau, 10) : existing.ThoiGianNau,
                DuongDanAnhChinh: duongDanAnhChinh !== undefined ? duongDanAnhChinh : existing.DuongDanAnhChinh
            });

            // 2. Nếu có gửi danh sách bước hoặc nguyên liệu mới thì làm mới chi tiết
            if (cacBuoc !== undefined || nguyenLieu !== undefined) {
                // Xóa chi tiết cũ qua Stored Procedure: sp_XoaChiTietMonAn
                await executeProcedure('sp_XoaChiTietMonAn', {
                    MaMonAn: maMonAn
                });

                // Thêm lại các bước
                if (Array.isArray(cacBuoc)) {
                    for (let i = 0; i < cacBuoc.length; i++) {
                        const step = cacBuoc[i];
                        if (step.noiDungHuongDan && step.noiDungHuongDan.trim()) {
                            await executeProcedure('sp_ThemBuocThucHien', {
                                MaMonAn: maMonAn,
                                SoThuTuBuoc: step.soThuTuBuoc || (i + 1),
                                NoiDungHuongDan: step.noiDungHuongDan.trim(),
                                DuongDanAnhBuoc: step.duongDanAnhBuoc || null
                            });
                        }
                    }
                }

                // Thêm lại các nguyên liệu
                if (Array.isArray(nguyenLieu)) {
                    for (const item of nguyenLieu) {
                        if (item.tenNguyenLieu && item.tenNguyenLieu.trim()) {
                            const ingResult = await executeProcedure('sp_ThemHoacLayNguyenLieu', {
                                TenNguyenLieu: item.tenNguyenLieu.trim(),
                                LoaiNguyenLieu: item.loaiNguyenLieu || 'Chinh'
                            });
                            const maNguyenLieu = ingResult.recordset[0].MaNguyenLieu;

                            await executeProcedure('sp_ThemNguyenLieuMonAn', {
                                MaMonAn: maMonAn,
                                MaNguyenLieu: maNguyenLieu,
                                DinhLuong: item.dinhLuong || null,
                                LaNguyenLieuChinh: item.laNguyenLieuChinh !== undefined ? Boolean(item.laNguyenLieuChinh) : true
                            });
                        }
                    }
                }
            }

            // Lấy lại chi tiết cập nhật
            const updatedResult = await executeProcedure('sp_LayChiTietMonAnTheoId', {
                MaMonAn: maMonAn,
                MaNguoiDungHienTai: currentUser.MaNguoiDung
            });

            const fullRecipe = {
                ...updatedResult.recordsets[0][0],
                cacBuoc: updatedResult.recordsets[1] || [],
                nguyenLieu: updatedResult.recordsets[2] || []
            };

            return sendSuccess(res, fullRecipe, 'Cập nhật món ăn thành công!');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [DELETE] /api/recipes/:id - Xóa món ăn (Chỉ tác giả hoặc Admin)
     */
    static async deleteRecipe(req, res, next) {
        try {
            const maMonAn = parseInt(req.params.id, 10);
            const currentUser = req.user;

            // Kiểm tra món ăn và quyền sở hữu
            const checkResult = await executeProcedure('sp_LayChiTietMonAnTheoId', {
                MaMonAn: maMonAn
            });

            const existing = checkResult.recordsets[0] ? checkResult.recordsets[0][0] : null;
            if (!existing) {
                return sendError(res, 'Món ăn không tồn tại.', 404);
            }

            const isAdm = currentUser.TenVaiTro === 'Admin' || currentUser.TenVaiTro === 'QuanTriVien';
            if (existing.MaNguoiDung !== currentUser.MaNguoiDung && !isAdm) {
                return sendError(res, 'Bạn không có quyền xóa món ăn này.', 403);
            }

            // Gọi Stored Procedure: sp_XoaMonAn
            await executeProcedure('sp_XoaMonAn', {
                MaMonAn: maMonAn
            });

            return sendSuccess(res, null, 'Xóa món ăn thành công!');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = RecipeController;
