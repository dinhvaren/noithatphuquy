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
            const { email, password, rememberMe } = req.body;

            // Tìm user theo email
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'email', message: 'Email không tồn tại' });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'password', message: 'Mật khẩu không chính xác' });
            }

            // Kiểm tra trạng thái tài khoản
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
                { expiresIn: rememberMe ? '30d' : '24h' } // Token hết hạn sau 30 ngày nếu ghi nhớ đăng nhập
            );

            // Lưu token vào cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 // 30 ngày hoặc 24 giờ
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
        res.render('pages/ChangePassword', { 
            page: { title: 'Đổi mật khẩu' },
            user: req.user 
        });
    }

    // Xử lý đổi mật khẩu
    async handleChangePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            const userId = req.user.id;

            // Kiểm tra mật khẩu mới và xác nhận mật khẩu
            if (newPassword !== confirmNewPassword) {
                return res.render('pages/ChangePassword', {
                    page: { title: 'Đổi mật khẩu' },
                    user: req.user,
                    error: 'Mật khẩu mới không khớp'
                });
            }

            // Tìm user trong database
            const user = await User.findById(userId);
            if (!user) {
                return res.render('pages/ChangePassword', {
                    page: { title: 'Đổi mật khẩu' },
                    user: req.user,
                    error: 'Không tìm thấy người dùng'
                });
            }

            // Kiểm tra mật khẩu hiện tại
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                return res.render('pages/ChangePassword', {
                    page: { title: 'Đổi mật khẩu' },
                    user: req.user,
                    error: 'Mật khẩu hiện tại không đúng'
                });
            }

            // Mã hóa mật khẩu mới
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(newPassword, salt);

            // Cập nhật mật khẩu mới
            user.password = hashedPassword;
            await user.save();

            // Render trang với thông báo thành công
            res.render('pages/ChangePassword', {
                page: { title: 'Đổi mật khẩu' },
                user: req.user,
                successMessage: 'Đổi mật khẩu thành công'
            });
        } catch (error) {
            console.error('Lỗi đổi mật khẩu:', error);
            res.render('pages/ChangePassword', {
                page: { title: 'Đổi mật khẩu' },
                user: req.user,
                error: 'Có lỗi xảy ra, vui lòng thử lại sau'
            });
        }
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
