# Website Nội Thất Phú Quý

Website bán hàng nội thất cao cấp với đầy đủ tính năng cho cả người dùng và quản trị viên.

## Giao diện người dùng

### Trang chủ
![Trang chủ](/images/dashbroad.jpg)
- Banner slider giới thiệu
- Danh mục sản phẩm nổi bật
- Sản phẩm mới
- Sản phẩm khuyến mãi
- Video giới thiệu công ty

### Đăng nhập & Đăng ký
![Đăng nhập](/screenshots/login.png)
- Đăng nhập bằng email hoặc username
- Đăng ký tài khoản mới
- Quên mật khẩu
- Ghi nhớ đăng nhập

### Danh mục sản phẩm
![Danh mục](/images/products.jpg)
- Hiển thị theo danh mục
- Lọc theo giá, màu sắc, kích thước
- Sắp xếp sản phẩm
- Phân trang

### Chi tiết sản phẩm
![Chi tiết sản phẩm](/images/products-detail.jpg)
- Hình ảnh sản phẩm (zoom, slider)
- Thông tin chi tiết
- Thông số kỹ thuật
- Sản phẩm liên quan
- Đánh giá & bình luận

### Giỏ hàng & Thanh toán
![Giỏ hàng](/images/cart.jpg)
- Thêm/xóa sản phẩm
- Cập nhật số lượng
- Mã giảm giá
- Chọn phương thức thanh toán
- Thông tin giao hàng

### Trang cá nhân
![Trang cá nhân](/images/profile.jpg)
- Thông tin tài khoản
- Lịch sử đơn hàng
- Sản phẩm yêu thích
- Đổi mật khẩu

## Giao diện quản trị

### Dashboard
![Dashboard](/images/admin-dashbroad.jpg)
- Thống kê doanh thu
- Đơn hàng mới
- Sản phẩm bán chạy
- Khách hàng mới

### Quản lý sản phẩm
![Quản lý sản phẩm](/images/products-admin.jpg)
- Danh sách sản phẩm
- Thêm/sửa/xóa sản phẩm
- Upload nhiều hình ảnh
- SEO sản phẩm

### Quản lý đơn hàng
![Quản lý đơn hàng](/images/order-admin.jpg)
- Danh sách đơn hàng
- Chi tiết đơn hàng
- Cập nhật trạng thái
- In hóa đơn

### Quản lý người dùng
![Quản lý người dùng](/images/users-admin.jpg)
- Danh sách người dùng
- Thêm/sửa/xóa tài khoản
- Phân quyền
- Khóa/mở khóa tài khoản

### Quản lý bài viết
![Quản lý bài viết](/screenshots/admin-posts.png)
- Danh sách bài viết
- Thêm/sửa/xóa bài viết
- Upload hình ảnh
- SEO bài viết

## Công nghệ sử dụng

- **Frontend:**
  - HTML5, CSS3, JavaScript
  - Bootstrap 5
  - jQuery
  - Handlebars template engine
  
- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication
  
- **Cloud Services:**
  - Cloudinary (lưu trữ hình ảnh)

## Cài đặt

1. Clone repository:
```bash
git clone https://github.com/dinhvaren/nothatphuquy.git
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env và cấu hình các biến môi trường:
```env
PORT=3000
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Chạy ứng dụng:
```bash
npm start
```

## Tác giả

- Tên: Lương Nguyễn Ngọc Đình
- Email: dinhvaren@gmail.com
- GitHub: https://github.com/dinhvaren

## Giấy phép

MIT License - Xem file [LICENSE.md](LICENSE.md) để biết thêm chi tiết. 