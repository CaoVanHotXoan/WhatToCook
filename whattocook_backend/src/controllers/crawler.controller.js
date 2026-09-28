/**
 * ========================================================
 * CONTROLLER CÀO DỮ LIỆU TỪ COOKPAD (CRAWLER CONTROLLER)
 * Sử dụng Cheerio + Axios và lưu tự động qua Stored Procedure
 * ========================================================
 */

const CookpadCrawlerService = require('../services/crawler.service');
const { executeProcedure } = require('../config/db');
const { sendSuccess, sendError } = require('../utils/response.util');

class CrawlerController {
    /**
     * [POST] /api/crawler/preview - Cào thử dữ liệu công thức từ link Cookpad (Xem trước, chưa lưu vào DB)
     */
    static async previewCookpadRecipe(req, res, next) {
        try {
            const { url } = req.body;

            if (!url || !url.trim()) {
                return sendError(res, 'Vui lòng cung cấp đường dẫn bài viết Cookpad (url).', 400);
            }

            const recipeData = await CookpadCrawlerService.scrapeRecipeByUrl(url.trim());
            return sendSuccess(res, recipeData, 'Cào dữ liệu từ Cookpad thành công');
        } catch (error) {
            next(error);
        }
    }

    /**
     * [POST] /api/crawler/import - Cào và tự động lưu trực tiếp vào CSDL qua các Stored Procedure
     */
    static async importCookpadRecipe(req, res, next) {
        try {
            const { url, maDanhMuc } = req.body;
            const maNguoiDung = req.user.MaNguoiDung;

            if (!url || !url.trim()) {
                return sendError(res, 'Vui lòng cung cấp đường dẫn bài viết Cookpad (url).', 400);
            }

            // 1. Cào dữ liệu từ Cookpad
            const data = await CookpadCrawlerService.scrapeRecipeByUrl(url.trim());

            // 2. Thêm vào CSDL bằng Stored Procedure: sp_ThemMonAn
            const createResult = await executeProcedure('sp_ThemMonAn', {
                MaNguoiDung: maNguoiDung,
                MaDanhMuc: maDanhMuc ? parseInt(maDanhMuc, 10) : null,
                TenMonAn: data.tenMonAn,
                CauChuyen: (data.cauChuyen || '') + ` (Nguồn: ${data.nguon})`,
                KhauPhan: data.khauPhan || 4,
                ThoiGianNau: data.thoiGianNau || 30,
                DuongDanAnhChinh: data.duongDanAnhChinh || null
            });

            const maMonAn = createResult.recordset[0].MaMonAn;

            // 3. Thêm các bước nấu bằng Stored Procedure: sp_ThemBuocThucHien
            if (Array.isArray(data.cacBuoc)) {
                for (const step of data.cacBuoc) {
                    await executeProcedure('sp_ThemBuocThucHien', {
                        MaMonAn: maMonAn,
                        SoThuTuBuoc: step.soThuTuBuoc,
                        NoiDungHuongDan: step.noiDungHuongDan,
                        DuongDanAnhBuoc: step.duongDanAnhBuoc || null
                    });
                }
            }

            // 4. Thêm nguyên liệu bằng Stored Procedure: sp_ThemHoacLayNguyenLieu & sp_ThemNguyenLieuMonAn
            if (Array.isArray(data.nguyenLieu)) {
                for (const item of data.nguyenLieu) {
                    if (item.tenNguyenLieu) {
                        const ingResult = await executeProcedure('sp_ThemHoacLayNguyenLieu', {
                            TenNguyenLieu: item.tenNguyenLieu.trim(),
                            LoaiNguyenLieu: 'Chinh'
                        });
                        const maNguyenLieu = ingResult.recordset[0].MaNguyenLieu;

                        await executeProcedure('sp_ThemNguyenLieuMonAn', {
                            MaMonAn: maMonAn,
                            MaNguyenLieu: maNguyenLieu,
                            DinhLuong: item.dinhLuong || null,
                            LaNguyenLieuChinh: true
                        });
                    }
                }
            }

            // 5. Trả về món ăn vừa import hoàn chỉnh
            const finalResult = await executeProcedure('sp_LayChiTietMonAnTheoId', {
                MaMonAn: maMonAn,
                MaNguoiDungHienTai: maNguoiDung
            });

            const fullRecipe = {
                ...finalResult.recordsets[0][0],
                cacBuoc: finalResult.recordsets[1] || [],
                nguyenLieu: finalResult.recordsets[2] || []
            };

            return sendSuccess(res, fullRecipe, 'Import món ăn từ Cookpad vào CSDL thành công!', 201);
        } catch (error) {
            next(error);
        }
    }

    /**
     * [GET] /api/crawler/search - Tìm kiếm công thức trực tiếp trên Cookpad
     */
    static async searchCookpad(req, res, next) {
        try {
            const keyword = req.query.q;
            if (!keyword || !keyword.trim()) {
                return sendError(res, 'Vui lòng cung cấp từ khóa tìm kiếm (q).', 400);
            }

            const results = await CookpadCrawlerService.searchRecipes(keyword.trim());
            return sendSuccess(res, results, `Tìm thấy ${results.length} kết quả từ Cookpad`);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = CrawlerController;
