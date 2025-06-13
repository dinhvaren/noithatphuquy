const { User } = require('../models/index');
const jwt = require('jsonwebtoken');

class CheckPermission {
    // Middleware kiểm tra đăng nhập
    async verifyToken(req, res, next) {
        try {
            // Bỏ qua kiểm tra cho các trang login
            if (req.originalUrl === '/admin/login' || req.originalUrl === '/login') {
                return next();
            }

            // Lấy token từ cookie hoặc header
            const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];
            
            if (!token) {
                // Lưu URL hiện tại để redirect sau khi đăng nhập
                if (req.session) {
                    req.session.returnTo = req.originalUrl;
                }
                // Phân biệt chuyển hướng cho admin và user
                return res.redirect(req.originalUrl.startsWith('/admin') ? '/admin/login' : '/');
            }

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            
            // Tìm user từ database
            const user = await User.findById(decoded.id);
            if (!user || !user.isActive) {
                // Phân biệt chuyển hướng cho admin và user
                return res.redirect(req.originalUrl.startsWith('/admin') ? '/admin/login' : '/');
            }

            // Lưu thông tin user vào request
            req.user = user;
            next();
        } catch (error) {
            console.error('Auth error:', error);
            // Phân biệt chuyển hướng cho admin và user
            return res.redirect(req.originalUrl.startsWith('/admin') ? '/admin/login' : '/');
        }
    }

    // Middleware kiểm tra quyền admin
    checkAdmin(req, res, next) {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).render('error/403', {
                layout: false,
                error: 'Bạn không có quyền truy cập trang này'
            });
        }
        next();
    }

    // Middleware kiểm tra quyền user
    checkUser(req, res, next) {
        if (!req.user || req.user.role !== 'user') {
            return res.status(403).render('error/403', {
                layout: false,
                error: 'Bạn không có quyền truy cập trang này'
            });
        }
        next();
    }

    // Middleware kiểm tra đã đăng nhập chưa (cho các trang login/register)
    async checkNotAuthenticated(req, res, next) {
        // Chỉ kiểm tra cho trang login
        if (req.originalUrl !== '/admin/login' && req.originalUrl !== '/login') {
            return next();
        }

        try {
            const token = req.cookies?.token;
            if (!token) {
                return next();
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.id);
            
            if (user && user.isActive) {
                // Chỉ chuyển hướng nếu user có role phù hợp
                if (req.originalUrl === '/admin/login' && user.role === 'admin') {
                    return res.redirect('/admin');
                }
                if (req.originalUrl === '/login' && user.role === 'user') {
                    return res.redirect('/homepage');
                }
            }

            // Nếu token không hợp lệ hoặc user không phù hợp, xóa token và tiếp tục
            res.clearCookie('token');
            return next();
        } catch (error) {
            // Nếu có lỗi xác thực token, xóa token và tiếp tục
            res.clearCookie('token');
            return next();
        }
    }
}

module.exports = new CheckPermission();