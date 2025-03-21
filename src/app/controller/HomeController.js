const {User} = require('../models/index');
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
    async login(req, res, next) {
        try {
            const { email, password } = req.body;
            
            // Tìm user theo email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ message: 'Email không tồn tại' });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ message: 'Mật khẩu không chính xác' });
            }

            // Kiểm tra tài khoản có bị khóa không
            if (!user.isActive) {
                return res.status(403).json({ message: 'Tài khoản của bạn đã bị khóa' });
            }

            // Tạo token JWT
            const token = jwt.sign(
                { 
                    userId: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Lưu token vào cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 giờ
            });

            res.status(200).json({ 
                message: 'Đăng nhập thành công',
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Xử lý đăng ký
    async signup(req, res, next) {
        try {
            const { username, signupEmail, signupPassword, confirmPassword } = req.body;

            // Kiểm tra mật khẩu xác nhận
            if (signupPassword !== confirmPassword) {
                return res.status(400).json({ message: 'Mật khẩu xác nhận không khớp' });
            }

            // Kiểm tra email đã tồn tại chưa
            const existingEmail = await User.findOne({ email: signupEmail });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email đã được sử dụng' });
            }

            // Kiểm tra username đã tồn tại chưa
            const existingUsername = await User.findOne({ username });
            if (existingUsername) {
                return res.status(400).json({ message: 'Tên người dùng đã được sử dụng' });
            }

            // Mã hóa mật khẩu
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(signupPassword, salt);

            // Tạo user mới
            const newUser = new User({
                username,
                email: signupEmail,
                password: hashedPassword,
                fullName: username, // Mặc định fullName bằng username
                role: 'user',
                isActive: true
            });

            await newUser.save();

            // Tạo token JWT
            const token = jwt.sign(
                { 
                    userId: newUser._id,
                    username: newUser.username,
                    role: newUser.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Lưu token vào cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 giờ
            });

            res.status(201).json({ 
                message: 'Đăng ký thành công',
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                }
            });
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

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
        try {
            // Xóa token khỏi cookie
            res.clearCookie('token');
            res.status(200).json({ message: 'Đăng xuất thành công' });
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Kiểm tra trạng thái đăng nhập
    checkAuth(req, res, next) {
        try {
            const token = req.cookies.token;
            if (!token) {
                return res.status(401).json({ message: 'Chưa đăng nhập' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            res.status(200).json({ 
                message: 'Đã đăng nhập',
                user: {
                    id: decoded.userId,
                    username: decoded.username,
                    role: decoded.role
                }
            });
        } catch (error) {
            res.status(401).json({ message: 'Token không hợp lệ' });
        }
    }
}

module.exports = new HomeController();
