const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // JWT để tạo token đăng nhập
const mongoose = require('mongoose'); // Thêm mongoose để tạo ObjectId

class HomeController {

    dashboard(req, res, next) {
        res.render('DashBoard', { page: { title: 'Trang chủ' } });
    }

    // Hiển thị trang chủ
    home(req, res, next) {
        res.render('HomePage', { page: { title: 'Trang chủ' } });
    }

    // Xử lý đăng nhập
    // login(req, res, next) {
    //     const { email, password } = req.body;
    //     res.send('Đăng nhập thành công');
    // }

    // // Xử lý đăng ký
    // signup(req, res, next) {
    //     const { name, email, phone, password, confirm_password, address } = req.body;

    //     if (password !== confirm_password) {
    //         return res.status(400).json({ message: 'Mật khẩu không khớp' });
    //     }
    //     res.send('Đăng ký thành công');
    // }

    // Hiển thị trang thiết kế nội thất
    interiorDesign(req, res, next) {
        res.render('Interior-design', { page: { title: 'Thiết kế nội thất' } });
    }

    productDetails(req, res, next) {
        res.render('ProductDetails', { page: { title: 'Chi tiết sản phẩm - Nội Thất Phú Quý' } });
    }

    // Hiển thị trang giỏ hàng
    cart(req, res, next) {
        res.render('Cart', { page: { title: 'Giỏ hàng' } });
    }

    // Hiển thị trang danh sách yêu thích
    wishlist(req, res, next) {
        res.render('Wishlist', { page: { title: 'Danh sách yêu thích' } });
    }

    // Hiển thị trang liên hệ
    contact(req, res, next) {
        res.render('Contact', { page: { title: 'Liên hệ' } });
    }

    // Hiển thị trang tin tức
    news(req, res, next) {
        res.render('News', { page: { title: 'Tin tức' } });
    }

    // Hiển thị trang giới thiệu
    about(req, res, next) {
        res.render('About', { page: { title: 'Giới thiệu' } });
    }

    // Xử lý đăng xuất
    logout(req, res, next) {
        res.clearCookie('token');
        res.redirect('/');
    }
}

module.exports = new HomeController();
