# 🍳 WHAT TO COOK - BACKEND RESTFUL API

Hệ thống Backend RESTful API hoàn chỉnh cho dự án **What To Cook** (Gợi ý và quản lý công thức món ăn). Được xây dựng bằng **Node.js (Express.js)**, kết nối cơ sở dữ liệu **Microsoft SQL Server** với tài khoản `sa`, bảo mật xác thực bằng **JWT & bcryptjs**, tính năng cào dữ liệu từ **Cookpad** bằng **Axios + Cheerio**, và **100% các thao tác dữ liệu được thực thi thông qua Stored Procedures (Thủ tục lưu trữ)**.

---

## 📋 Mục lục
1. [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
2. [Cấu trúc thư mục](#-cấu-trúc-thư-mục)
3. [Hướng dẫn cài đặt & Chạy ứng dụng](#-hướng-dẫn-cài-đặt--chạy-ứng-dụng)
4. [Cơ sở dữ liệu & Stored Procedures](#-cơ-sở-dữ-liệu--stored-procedures)
5. [Tài liệu danh sách RESTful API Endpoints](#-tài-liệu-danh-sách-restful-api-endpoints)
6. [Tính năng cào dữ liệu Cookpad](#-tính-năng-cào-dữ-liệu-cookpad)

---

## 🛠 Công nghệ sử dụng

- **Runtime & Framework**: Node.js & Express.js
- **Database**: Microsoft SQL Server (kết nối qua thư viện `mssql` với connection pooling)
- **Stored Procedures**: 100% các thao tác CRUD và tính năng gợi ý đều xử lý trong SQL Server Stored Procedures (`ThuTuc.sql`)
- **Authentication & Security**: `jsonwebtoken` (JWT), `bcryptjs` (mã hóa mật khẩu)
- **Web Scraping**: `axios` (HTTP request) + `cheerio` (phân tích DOM HTML của Cookpad)
- **CORS & Environment**: `cors`, `dotenv`
- **Development Tool**: `nodemon`

---

## 📁 Cấu trúc thư mục

```
whattocook_backend/
├── src/
│   ├── config/
│   │   └── db.js                 # Kết nối SQL Server (sa) & Helper gọi Stored Procedures
│   ├── controllers/
│   │   ├── auth.controller.js     # Đăng ký, đăng nhập, profile, đổi mật khẩu
│   │   ├── user.controller.js     # Quản lý người dùng, phân quyền (Admin)
│   │   ├── category.controller.js # CRUD danh mục món ăn
│   │   ├── ingredient.controller.js# CRUD nguyên liệu, từ đồng nghĩa
│   │   ├── recipe.controller.js   # CRUD món ăn, chi tiết bước/nguyên liệu, gợi ý "What to Cook"
│   │   ├── favorite.controller.js # Lưu/Bỏ lưu món ăn yêu thích
│   │   ├── crawler.controller.js  # Cào dữ liệu Cookpad (preview, import)
│   │   └── stats.controller.js    # Thống kê tổng quan hệ thống (Admin)
│   ├── middlewares/
│   │   ├── auth.middleware.js     # Xác thực JWT (authenticateToken, requireAdmin, optionalAuth)
│   │   └── error.middleware.js    # Bắt lỗi 404 và Global Error Handler
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── user.routes.js
│   │   ├── category.routes.js
│   │   ├── ingredient.routes.js
│   │   ├── recipe.routes.js
│   │   ├── favorite.routes.js
│   │   ├── crawler.routes.js
│   │   ├── stats.routes.js
│   │   └── index.js              # Tổng hợp toàn bộ API routes (/api/...)
│   ├── services/
│   │   └── crawler.service.js    # Service bóc tách dữ liệu Cookpad bằng Cheerio
│   ├── utils/
│   │   ├── response.util.js      # Chuẩn hóa định dạng JSON Response
│   │   └── token.util.js         # Xử lý JWT và Bcrypt Hash
│   ├── app.js                    # Cấu hình Express app và middlewares
│   └── server.js                 # Entry point khởi động Server HTTP
├── .env                          # Biến môi trường CSDL, JWT, Port
├── .env.example                  # Mẫu biến môi trường
├── package.json
├── ThuTuc.sql                    # Toàn bộ mã nguồn Stored Procedures cho SQL Server
└── README.md
```

---

## 🚀 Hướng dẫn cài đặt & Chạy ứng dụng

### 1. Chuẩn bị Cơ sở dữ liệu SQL Server
1. Mở **SQL Server Management Studio (SSMS)** hoặc Azure Data Studio.
2. Tạo Database mới có tên `WhatToCook`:
   ```sql
   CREATE DATABASE WhatToCook;
   GO
   USE WhatToCook;
   GO
   ```
3. Mở và thực thi file `whattocook.sql` để tạo 9 bảng dữ liệu.
4. Mở và thực thi file `ThuTuc.sql` để tạo toàn bộ các Stored Procedures.

### 2. Cài đặt Dependencies
Mở terminal tại thư mục `whattocook_backend` và chạy:
```bash
npm install
```

### 3. Cấu hình file `.env`
Kiểm tra file `.env` và cập nhật thông tin tài khoản `sa` của bạn:
```env
PORT=5000
NODE_ENV=development

DB_USER=sa
DB_PASSWORD=mật_khẩu_sa_của_bạn
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=WhatToCook
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_SECRET=whattocook_super_secret_jwt_key_2026_!@#$%^
JWT_EXPIRES_IN=7d

CLIENT_URL=http://localhost:3000
```

### 4. Khởi chạy Server
- **Chế độ phát triển (Tự động reload khi sửa code)**:
  ```bash
  npm run dev
  ```
- **Chế độ chạy thông thường**:
  ```bash
  npm start
  ```

---

## 📦 Cơ sở dữ liệu & Danh sách Stored Procedures (`ThuTuc.sql`)

| Tên Stored Procedure | Mục đích sử dụng |
| :--- | :--- |
| `sp_LayTatCaVaiTro` | Lấy danh sách các vai trò hệ thống (`QuanTriVien`, `NguoiDung`) |
| `sp_DangKyNguoiDung` | Đăng ký người dùng mới (kiểm tra trùng email, gán vai trò mặc định) |
| `sp_LayNguoiDungTheoEmail` | Tìm kiếm người dùng theo Email (xác thực mật khẩu lúc đăng nhập) |
| `sp_LayNguoiDungTheoId` | Lấy thông tin cá nhân của người dùng |
| `sp_CapNhatThongTinNguoiDung` | Cập nhật tên, ảnh đại diện, tiểu sử |
| `sp_DoiMatKhau` | Đổi mật khẩu đã mã hóa mới |
| `sp_LayTatCaNguoiDung` | Lấy danh sách tài khoản phân trang, tìm kiếm (Admin) |
| `sp_CapNhatVaiTroNguoiDung` | Phân quyền vai trò người dùng (Admin) |
| `sp_XoaNguoiDung` | Xóa người dùng (Admin) |
| `sp_LayTatCaDanhMuc` | Lấy tất cả danh mục kèm số lượng món ăn trong từng danh mục |
| `sp_LayDanhMucTheoId` | Lấy chi tiết 1 danh mục |
| `sp_ThemDanhMuc` | Thêm danh mục món ăn mới |
| `sp_CapNhatDanhMuc` | Cập nhật tên danh mục |
| `sp_XoaDanhMuc` | Xóa danh mục và set NULL các món ăn thuộc danh mục |
| `sp_LayTatCaNguyenLieu` | Lấy từ điển nguyên liệu (kèm từ đồng nghĩa) |
| `sp_ThemHoacLayNguyenLieu` | Tìm ID nguyên liệu theo tên (hoặc từ đồng nghĩa), nếu chưa có thì tự động tạo mới |
| `sp_CapNhatNguyenLieu` | Cập nhật tên/loại nguyên liệu |
| `sp_XoaNguyenLieu` | Xóa nguyên liệu |
| `sp_ThemTuDongNghia` | Thêm từ đồng nghĩa vùng miền (Vd: "dưa chuột" = "dưa leo") |
| `sp_LayTuDongNghiaTheoNguyenLieu` | Lấy danh sách từ đồng nghĩa của nguyên liệu |
| `sp_XoaTuDongNghia` | Xóa từ đồng nghĩa |
| `sp_LayDanhSachMonAn` | Lấy danh sách món ăn (tìm kiếm, lọc danh mục, lọc theo tác giả, phân trang) |
| `sp_LayChiTietMonAnTheoId` | Trả về 3 Recordsets: Thông tin món, danh sách các bước nấu, danh sách nguyên liệu |
| `sp_ThemMonAn` | Tạo bản ghi món ăn mới |
| `sp_ThemBuocThucHien` | Thêm bước nấu cho món ăn |
| `sp_ThemNguyenLieuMonAn` | Gán nguyên liệu và định lượng vào món ăn |
| `sp_CapNhatMonAn` | Cập nhật thông tin cơ bản món ăn |
| `sp_XoaChiTietMonAn` | Xóa các bước và nguyên liệu cũ của món ăn để cập nhật lại |
| `sp_XoaMonAn` | Xóa món ăn (tự động xóa cascade các bước, nguyên liệu và bookmark) |
| `sp_GoiYMonAnTheoNguyenLieu` | **Tính năng cốt lõi**: Gợi ý món ăn dựa trên nguyên liệu có sẵn trong tủ lạnh, tính % khớp và số nguyên liệu còn thiếu |
| `sp_ToggleLuuMonAn` | Bật/tắt lưu món ăn yêu thích |
| `sp_LayDanhSachMonAnDaLuu` | Lấy danh sách món ăn người dùng đã bookmark |
| `sp_ThongKeTongQuan` | Thống kê số lượng Người dùng, Món ăn, Danh mục, Nguyên liệu, Lượt lưu |

---

## 📡 Tài liệu danh sách RESTful API Endpoints

### 1. Xác thực & Tài khoản (`/api/auth`)
- `POST /api/auth/register`: Đăng ký tài khoản (`tenDangNhap`, `email`, `matKhau`, `anhDaiDien`, `tieuSu`)
- `POST /api/auth/login`: Đăng nhập (`email`, `matKhau`) -> Trả về `token` JWT và `user`
- `GET /api/auth/me`: Lấy thông tin cá nhân (Header: `Authorization: Bearer <token>`)
- `PUT /api/auth/update-profile`: Cập nhật thông tin cá nhân
- `PUT /api/auth/change-password`: Đổi mật khẩu (`matKhauCu`, `matKhauMoi`)

### 2. Quản lý Món ăn & Gợi ý (`/api/recipes`)
- `GET /api/recipes`: Lấy danh sách món ăn (`?page=1&pageSize=12&search=thit&categoryId=1`)
- `GET /api/recipes/suggest`: Gợi ý món ăn theo nguyên liệu (`?ingredients=trứng gà, thịt bò, cà chua&page=1`)
- `GET /api/recipes/my-recipes`: Lấy danh sách món ăn do user hiện tại đăng
- `GET /api/recipes/:id`: Lấy chi tiết món ăn (thông tin + các bước nấu + nguyên liệu)
- `POST /api/recipes`: Đăng món ăn mới (Body gồm `tenMonAn`, `maDanhMuc`, `cauChuyen`, `khauPhan`, `thoiGianNau`, `duongDanAnhChinh`, `cacBuoc[]`, `nguyenLieu[]`)
- `PUT /api/recipes/:id`: Sửa món ăn (Chỉ tác giả hoặc Admin)
- `DELETE /api/recipes/:id`: Xóa món ăn (Chỉ tác giả hoặc Admin)

### 3. Món ăn yêu thích / Bookmark (`/api/favorites`)
- `POST /api/favorites/toggle/:recipeId`: Lưu hoặc Bỏ lưu món ăn yêu thích
- `GET /api/favorites`: Lấy danh sách món ăn đã bookmark của tôi (`?page=1&pageSize=12`)

### 4. Danh mục món ăn (`/api/categories`)
- `GET /api/categories`: Lấy danh sách danh mục kèm số lượng món
- `GET /api/categories/:id`: Lấy chi tiết danh mục
- `POST /api/categories`: Thêm danh mục mới *(Admin)*
- `PUT /api/categories/:id`: Sửa danh mục *(Admin)*
- `DELETE /api/categories/:id`: Xóa danh mục *(Admin)*

### 5. Nguyên liệu & Từ đồng nghĩa (`/api/ingredients`)
- `GET /api/ingredients`: Lấy danh sách nguyên liệu (`?search=thit&type=Chinh`)
- `POST /api/ingredients`: Thêm mới nguyên liệu
- `PUT /api/ingredients/:id`: Cập nhật nguyên liệu *(Admin)*
- `DELETE /api/ingredients/:id`: Xóa nguyên liệu *(Admin)*
- `GET /api/ingredients/:id/synonyms`: Lấy danh sách từ đồng nghĩa
- `POST /api/ingredients/:id/synonyms`: Thêm từ đồng nghĩa *(Admin)*
- `DELETE /api/ingredients/synonyms/:synonymId`: Xóa từ đồng nghĩa *(Admin)*

### 6. Cào dữ liệu Cookpad (`/api/crawler`)
- `GET /api/crawler/search?q=thit kho`: Tìm kiếm công thức trên Cookpad
- `POST /api/crawler/preview`: Bóc tách thông tin từ link Cookpad để xem trước (`{ "url": "https://cookpad.com/vn/cong-thuc/..." }`)
- `POST /api/crawler/import`: Bóc tách và tự động lưu trực tiếp vào CSDL qua Stored Procedures (`{ "url": "...", "maDanhMuc": 1 }`)

### 7. Thống kê & Quản lý User (Admin) (`/api/stats`, `/api/users`)
- `GET /api/stats/overview`: Thống kê tổng quan hệ thống *(Admin)*
- `GET /api/users`: Danh sách người dùng phân trang *(Admin)*
- `GET /api/users/roles`: Danh sách vai trò *(Admin)*
- `PUT /api/users/:id/role`: Cập nhật vai trò tài khoản *(Admin)*
- `DELETE /api/users/:id`: Xóa tài khoản *(Admin)*

---

## 🕷 Tính năng cào dữ liệu Cookpad

Sử dụng Service `CookpadCrawlerService` kết hợp giữa `axios` và `cheerio`:
1. Gửi HTTP Request với User-Agent chuẩn tới link bài viết Cookpad.
2. Cheerio bóc tách tự động:
   - Tiêu đề món ăn
   - Ảnh đại diện chất lượng cao
   - Khẩu phần ăn & Thời gian nấu ước tính
   - Danh sách nguyên liệu và định lượng chi tiết
   - Các bước thực hiện tuần tự kèm hình ảnh từng bước (nếu có)
3. API `/api/crawler/import` tự động kích hoạt Stored Procedures `sp_ThemMonAn`, `sp_ThemBuocThucHien`, `sp_ThemHoacLayNguyenLieu` và `sp_ThemNguyenLieuMonAn` để lưu toàn bộ vào hệ thống trong nháy mắt!
