/**
 * ========================================================
 * SERVICE CÀO DỮ LIỆU CÔNG THỨC MÓN ĂN TỪ COOKPAD
 * Sử dụng thư viện 'axios' tải HTML và 'cheerio' bóc tách DOM
 * ========================================================
 */

const axios = require('axios');
const cheerio = require('cheerio');

// Header giả lập trình duyệt để tránh bị chặn bot
const DEFAULT_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8'
};

class CookpadCrawlerService {
    /**
     * Cào chi tiết công thức nấu ăn từ đường dẫn Cookpad
     * @param {string} recipeUrl - URL bài viết trên cookpad.com/vn/cong-thuc/...
     * @returns {Promise<Object>} Dữ liệu món ăn bóc tách được
     */
    static async scrapeRecipeByUrl(recipeUrl) {
        try {
            if (!recipeUrl || !recipeUrl.includes('cookpad.com')) {
                throw new Error('Đường dẫn công thức không hợp lệ (Phải thuộc cookpad.com).');
            }

            const response = await axios.get(recipeUrl, {
                headers: DEFAULT_HEADERS,
                timeout: 15000
            });

            const html = response.data;
            const $ = cheerio.load(html);

            // 1. Tên món ăn
            let tenMonAn = $('h1.recipe-title, h1[itemprop="name"], h1').first().text().trim();
            if (!tenMonAn) {
                tenMonAn = $('meta[property="og:title"]').attr('content') || 'Món ăn Cookpad';
            }

            // 2. Câu chuyện / Giới thiệu món ăn
            let cauChuyen = $('.recipe-description, .description, [itemprop="description"]').text().trim();
            if (!cauChuyen) {
                cauChuyen = $('meta[property="og:description"]').attr('content') || '';
            }

            // 3. Ảnh chính của món
            let duongDanAnhChinh = $('meta[property="og:image"]').attr('content') || 
                                   $('#recipe-image img, .recipe-main-image img').attr('src') || null;

            // 4. Khẩu phần (Serving) & Thời gian nấu
            let khauPhanText = $('.recipe-serving, [itemprop="recipeYield"], .serving').text().trim();
            let khauPhan = null;
            if (khauPhanText) {
                const matchServings = khauPhanText.match(/\d+/);
                if (matchServings) khauPhan = parseInt(matchServings[0], 10);
            }

            let thoiGianNau = null;
            let cookingTimeText = $('.cooking-time, [itemprop="cookTime"]').text().trim();
            if (cookingTimeText) {
                const matchTime = cookingTimeText.match(/\d+/);
                if (matchTime) thoiGianNau = parseInt(matchTime[0], 10);
            }

            // 5. Danh sách nguyên liệu (Ingredients)
            const danhSachNguyenLieu = [];
            $('.ingredient-list li, #ingredients .ingredient, [itemprop="recipeIngredient"]').each((index, el) => {
                const element = $(el);
                let tenNL = element.find('.ingredient-name, .name').text().trim();
                let dinhLuong = element.find('.ingredient-quantity, .quantity, .amount').text().trim();

                if (!tenNL && !dinhLuong) {
                    // Nếu không có class con, lấy toàn bộ text của dòng
                    const fullText = element.text().trim();
                    if (fullText) {
                        danhSachNguyenLieu.push({
                            tenNguyenLieu: fullText,
                            dinhLuong: '',
                            laNguyenLieuChinh: true
                        });
                    }
                } else {
                    danhSachNguyenLieu.push({
                        tenNguyenLieu: tenNL || element.text().trim(),
                        dinhLuong: dinhLuong || '',
                        laNguyenLieuChinh: true
                    });
                }
            });

            // Nếu các selector trên không khớp, thử selector dạng bảng hoặc thẻ p
            if (danhSachNguyenLieu.length === 0) {
                $('li.ingredient, .ingredient_row').each((_, el) => {
                    const txt = $(el).text().replace(/\s+/g, ' ').trim();
                    if (txt) {
                        danhSachNguyenLieu.push({
                            tenNguyenLieu: txt,
                            dinhLuong: '',
                            laNguyenLieuChinh: true
                        });
                    }
                });
            }

            // 6. Các bước thực hiện (Cooking Steps)
            const cacBuocThucHien = [];
            let stepIndex = 1;
            $('#steps li, .step-list li, .instruction-list li, [itemprop="recipeInstructions"] li, .step').each((_, el) => {
                const element = $(el);
                let text = element.find('.step-text, .instruction, p').text().trim();
                if (!text) {
                    text = element.text().trim();
                }

                let stepImage = element.find('img').attr('src') || 
                                element.find('img').attr('data-src') || 
                                element.find('img').attr('data-original') || null;

                if (text && text.length > 3) {
                    cacBuocThucHien.push({
                        soThuTuBuoc: stepIndex++,
                        noiDungHuongDan: text,
                        duongDanAnhBuoc: stepImage
                    });
                }
            });

            return {
                tenMonAn,
                cauChuyen,
                duongDanAnhChinh,
                khauPhan: khauPhan || 4,
                thoiGianNau: thoiGianNau || 30,
                nguyenLieu: danhSachNguyenLieu,
                cacBuoc: cacBuocThucHien,
                nguon: recipeUrl
            };
        } catch (error) {
            console.error('❌ Lỗi khi bóc tách Cookpad URL:', error.message);
            throw new Error(`Không thể cào dữ liệu từ URL này: ${error.message}`);
        }
    }

    /**
     * Tìm kiếm danh sách món ăn từ Cookpad theo từ khóa
     * @param {string} keyword - Từ khóa tìm kiếm (Ví dụ: 'thịt kho tàu')
     * @returns {Promise<Array>} Danh sách kết quả tóm tắt gồm tiêu đề, ảnh, URL
     */
    static async searchRecipes(keyword) {
        try {
            const encodedKeyword = encodeURIComponent(keyword.trim());
            const searchUrl = `https://cookpad.com/vn/tim-kiem/${encodedKeyword}`;

            const response = await axios.get(searchUrl, {
                headers: DEFAULT_HEADERS,
                timeout: 15000
            });

            const html = response.data;
            const $ = cheerio.load(html);
            const results = [];

            // Duyệt danh sách bài viết từ kết quả tìm kiếm
            $('li.block-link, .recipe-preview, li.recipe').each((_, el) => {
                const element = $(el);
                const titleEl = element.find('h2 a, .recipe-title, a.link-unstyled').first();
                const title = titleEl.text().trim();
                let link = titleEl.attr('href') || element.find('a').first().attr('href');

                if (link && !link.startsWith('http')) {
                    link = `https://cookpad.com${link}`;
                }

                let image = element.find('img').attr('src') || 
                            element.find('img').attr('data-src') || null;

                let author = element.find('.author, .user-name').text().trim() || 'Cookpad Member';

                if (title && link && link.includes('/cong-thuc/')) {
                    results.push({
                        tenMonAn: title,
                        linkCookpad: link,
                        duongDanAnh: image,
                        tacGia: author
                    });
                }
            });

            return results;
        } catch (error) {
            console.error('❌ Lỗi khi tìm kiếm trên Cookpad:', error.message);
            throw new Error(`Lỗi tìm kiếm Cookpad: ${error.message}`);
        }
    }
}

module.exports = CookpadCrawlerService;
