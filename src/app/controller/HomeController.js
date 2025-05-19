const {User} = require('../models/index');
const bcrypt = require('bcryptjs'); // Thư viện mã hóa mật khẩu
const jwt = require('jsonwebtoken'); // JWT để tạo token đăng nhập
require('dotenv').config();


class HomeController {
    // Hiển thị trang chủ
    async dashboard(req, res, next) {
        try {
            // Kiểm tra token từ cookie
            const token = req.cookies?.token;
            if (token) {
                // Verify token
                const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
                const user = await User.findById(decoded.id);
                
                if (user && user.isActive) {
                    // Nếu là admin, chuyển về trang admin
                    if (user.role === 'admin') {
                        return res.redirect('/admin');
                    }
                    // Nếu là user thường, chuyển về homepage
                    return res.redirect('/homepage');
                }
            }
            // Nếu chưa đăng nhập, hiển thị trang dashboard
            res.render('pages/DashBoard', { page: { title: 'Trang chủ' } });
        } catch (error) {
            // Nếu có lỗi xác thực token, hiển thị trang dashboard
            res.render('pages/DashBoard', { page: { title: 'Trang chủ' } });
        }
    }

    // Hiển thị trang chủ sau khi đăng nhập
    home(req, res, next) {
        // Nếu chưa đăng nhập, chuyển hướng về dashboard
        if (!req.user) {
            return res.redirect('/');
        }
        // Nếu đã đăng nhập, hiển thị trang homepage với thông tin user
        res.render('pages/HomePage', { 
            page: { title: 'Trang chủ' }, 
            user: req.user 
        });
    }

    // Xử lý đăng nhập
    async login(req, res, next) {
        try {
            // Nếu là GET request, hiển thị form đăng nhập
            if (req.method === 'GET') {
                return res.render('pages/Login', {
                    layout: false,
                    page: { title: 'Đăng nhập' }
                });
            }

            console.log('Request headers:', req.headers);
            console.log('Request body:', req.body);

            const { email, password, rememberMe } = req.body;
            
            // Kiểm tra dữ liệu đầu vào
            if (!email || !password) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Vui lòng nhập đầy đủ thông tin đăng nhập và mật khẩu' 
                });
            }
            
            // Log để debug
            console.log('Dữ liệu nhận được:', { 
                email,
                hasPassword: !!password,
                body: req.body 
            });

            // Tìm user theo email hoặc username
            const user = await User.findOne({
                $or: [
                    { email: email.toLowerCase() },
                    { username: email }
                ]
            });

            console.log('Tìm thấy user:', user);
            
            if (!user) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Email hoặc tên đăng nhập không tồn tại' 
                });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Mật khẩu không chính xác' 
                });
            }

            // Kiểm tra trạng thái tài khoản
            if (!user.isActive) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Tài khoản của bạn đã bị khóa' 
                });
            }

            // Kiểm tra và cập nhật avatar mặc định nếu chưa có
            if (!user.avatar) {
                user.avatar = '/img/user/avatar.jpg';
                await user.save();
            }

            // Tạo token JWT
            const token = jwt.sign(
                { 
                    id: user._id,
                    username: user.username,
                    role: user.role
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: rememberMe ? '30d' : '24h' }
            );

            // Lưu token vào cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000
            });

            // Trả về thông báo thành công
            res.json({
                success: true,
                message: 'Đăng nhập thành công',
                redirect: req.session?.returnTo || '/homepage'
            });

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi server, vui lòng thử lại sau' 
            });
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
                fullName: username,
                role: 'user',
                isActive: true,
                avatar: '/img/user/avatar.jpg'
            });

            await newUser.save();

            // Tạo token JWT
            const token = jwt.sign(
                { 
                    id: newUser._id,
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
                maxAge: 24 * 60 * 60 * 1000
            });

            // Chuyển hướng về trang homepage
            return res.redirect('/homepage');
            
        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }
    
    // Hiển thị trang thiết kế nội thất
    interiorDesign(req, res, next) {
        try {
            // Nếu đã đăng nhập, hiển thị trang với thông tin user
            if (req.user) {
                return res.render('pages/Interior-design', { 
                    page: { title: 'Thiết kế nội thất' },
                    user: req.user
                });
            }
            // Nếu chưa đăng nhập, hiển thị trang không có thông tin user
            res.render('pages/Interior-design', { 
                page: { title: 'Thiết kế nội thất' }
            });
        } catch (error) {
            console.error('Lỗi hiển thị trang thiết kế:', error);
            next(error);
        }
    }

    productDetails(req, res, next) {
        res.render('pages/ProductDetails', { page: { title: 'Chi tiết sản phẩm - Nội Thất Phú Quý' } });
    }

    // Hiển thị trang giỏ hàng
    cart(req, res, next) {
        res.render('pages/Cart', { page: { title: 'Giỏ hàng' } });
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