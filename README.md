# Website Nội Thất Phú Quý

Website bán nội thất cao cấp được xây dựng bằng Node.js, Express và MongoDB.

## Tính Năng Chính

### 1. Phần Người Dùng
- **Trang Chủ**
  - Slider banner giới thiệu
  - Video giới thiệu về công ty
  - Danh sách sản phẩm nổi bật
  - Danh mục sản phẩm
  - Thông tin liên hệ

- **Sản Phẩm**
  - Hiển thị sản phẩm theo danh mục
  - Tìm kiếm và lọc sản phẩm
  - Chi tiết sản phẩm (hình ảnh, giá, mô tả, thông số kỹ thuật)
  - Thêm vào giỏ hàng
  - Yêu thích sản phẩm

- **Tài Khoản**
  - Đăng ký/Đăng nhập
  - Quản lý thông tin cá nhân
  - Xem lịch sử đơn hàng
  - Danh sách sản phẩm yêu thích

### 2. Phần Quản Trị
- **Quản Lý Người Dùng**
  - Thêm/sửa/xóa người dùng
  - Phân quyền (Admin, Nhân viên, Khách hàng)
  - Khóa/mở khóa tài khoản

- **Quản Lý Sản Phẩm**
  - Thêm/sửa/xóa sản phẩm
  - Upload nhiều hình ảnh
  - Quản lý thông tin chi tiết và giá
  - Sắp xếp và phân loại sản phẩm

- **Quản Lý Danh Mục**
  - Thêm/sửa/xóa danh mục
  - Sắp xếp thứ tự hiển thị

## Công Nghệ Sử Dụng

### Frontend
- HTML5, CSS3, JavaScript
- Bootstrap 5
- Handlebars (HBS)
- jQuery
- Swiper.js (slider)

### Backend
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (upload file)
- Bcrypt (mã hóa mật khẩu)

## Cài Đặt và Chạy

1. **Yêu Cầu Hệ Thống**
   - Node.js (v14 trở lên)
   - MongoDB
   - npm hoặc yarn

2. **Cài Đặt**
   ```bash
   # Clone repository
   git clone [repository-url]

   # Di chuyển vào thư mục dự án
   cd NoiThatPhuQuy

   # Cài đặt dependencies
   npm install
   ```

3. **Cấu Hình**
   - Tạo file `.env` với các thông tin:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/noithatphuquy
   JWT_SECRET=your_jwt_secret
   ```

4. **Chạy Ứng Dụng**
   ```bash
   # Chế độ development
   npm run dev

   # Chế độ production
   npm start
   ```

## Cấu Trúc Thư Mục

```
NoiThatPhuQuy/
├── src/
│   ├── app/
│   │   ├── controllers/
│   │   ├── middlewares/
│   │   ├── models/
│   │   └── utils/
│   ├── config/
│   ├── public/
│   │   ├── css/
│   │   ├── js/
│   │   └── img/
│   ├── resources/
│   │   └── views/
│   └── routes/
├── .env
├── package.json
└── README.md
```

## Tác Giả
- Tên: [Tên tác giả]
- Email: [Email liên hệ]
- Website: [Website công ty]

## Giấy Phép
[Loại giấy phép] - Xem file [LICENSE.md](LICENSE.md) để biết thêm chi tiết. 