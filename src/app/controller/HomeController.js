const {User} = require('../models/index');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // JWT để tạo token đăng nhập
require('dotenv').config();


class HomeController {
    // Hiển thị trang chủ
    dashboard(req, res, next) {
        res.render('pages/DashBoard', { page: { title: 'Trang chủ' } });
    }

    // Hiển thị trang chủ sau khi đăng nhập
    home(req, res, next) {

        res.render('pages/HomePage', { page: { title: 'Trang chủ' }, user: null });
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
                process.env.JWT_SECRET || '5bc5c982350cf02973489f6e33d7157d9d70659d36850479140e871ad8222edb',
                { expiresIn: '1h' }
            );

            // Lưu token vào cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 1 * 60 * 60 * 1000 // 1 giờ
            });

            // Chuyển hướng về trang chủ với thông báo thành công
            res.render('pages/HomePage', { 
                page: { title: 'Trang chủ' },
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    role: user.role
                },
                successMessage: 'Đăng nhập thành công!'
            });
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Xử lý đăng ký
    async signup(req, res, next) {
        try {
            const { username, signupEmail, signupPassword } = req.body;

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
                maxAge: 24 * 60 * 60 * 1000 // 1 giờ
            });

            // Chuyển hướng về trang chủ với thông báo thành công
            res.render('pages/HomePage', { 
                page: { title: 'Trang chủ' },
                user: {
                    id: newUser._id,
                    username: newUser.username,
                    email: newUser.email,
                    role: newUser.role
                },
                successMessage: 'Đăng ký tài khoản thành công!'
            });
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Hiển thị trang thông tin cá nhân
    profile(req, res, next) {
        res.render('pages/Profile', { page: { title: 'Thông tin cá nhân' }});

    }

    // Hiển thị trang danh sách đơn hàng
    orders(req, res, next) {
        res.render('pages/Orders', { page: { title: 'Danh sách đơn hàng' } });
    }
    
    
    // Hiển thị trang thiết kế nội thất
    interiorDesign(req, res, next) {
        res.render('pages/Interior-design', { page: { title: 'Thiết kế nội thất' } });
    }

    productDetails(req, res, next) {
        res.render('pages/ProductDetails', { page: { title: 'Chi tiết sản phẩm - Nội Thất Phú Quý' } });
    }

    // Hiển thị trang giỏ hàng
    cart(req, res, next) {
        res.render('pages/Cart', { page: { title: 'Giỏ hàng' } });
    }

    // Hiển thị trang danh sách yêu thích
    wishlist(req, res, next) {
        res.render('pages/Wishlist', { page: { title: 'Danh sách yêu thích' } });
    }

    // Hiển thị trang liên hệ
    contact(req, res, next) {
        res.render('pages/Contact', { page: { title: 'Liên hệ' } });
    }

    // Hiển thị trang tin tức
    news(req, res, next) {
        res.render('pages/News', { page: { title: 'Tin tức' } });
    }

    // Hiển thị trang giới thiệu
    about(req, res, next) {
        res.render('pages/About', { page: { title: 'Giới thiệu' } });
    }

    // Hiển thị trang sản phẩm
    products(req, res, next) {
        res.render('pages/Products', { page: { title: 'Sản phẩm' } });
    }

    // Hiển thị trang đổi mật khẩu
    changePassword(req, res, next) {
        res.render('ChangePassword', { page: { title: 'Đổi mật khẩu' } });
    }

    // Xử lý đăng xuất
    logout(req, res, next) {
        try {
            // Xóa token khỏi cookie
            res.clearCookie('token');
            res.redirect('/');
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

    // Kiểm tra username đã tồn tại
    async checkUsername(req, res) {
        try {
            const { username } = req.query;
            const existingUser = await User.findOne({ username });
            res.json({ exists: !!existingUser });
        } catch (error) {
            console.error('Lỗi kiểm tra username:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    }

    // Kiểm tra email đã tồn tại
    async checkEmail(req, res) {
        try {
            const { email } = req.query;
            const existingUser = await User.findOne({ email });
            res.json({ exists: !!existingUser });
        } catch (error) {
            console.error('Lỗi kiểm tra email:', error);
            res.status(500).json({ error: 'Lỗi server' });
        }
    }
}

module.exports = new HomeController();
