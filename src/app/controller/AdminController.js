const { User, Category, Product, CategoryParent } = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const cloudinaryService = require('../services/cloudinaryService');
const slugify = require('slugify');

class AdminController {
    // Trang chủ admin
    async index(req, res, next) {
        try {
            // Lấy dữ liệu từ database
            const [users, categories, products, parentCategoriesArray] = await Promise.all([
                User.find().lean(),
                Category.find().lean(),
                Product.find().lean(),
                CategoryParent.find().lean()
            ]);

            // Chuyển đổi mảng parentCategories thành object với key là ID
            const parentCategories = {};
            parentCategoriesArray.forEach(category => {
                parentCategories[category._id] = category;
            });

            // Log để kiểm tra
            console.log('Parent Categories:', parentCategories);
            console.log('Categories:', categories);

            res.render('admin/Admin', {
                page: { title: 'Quản trị website' },
                users,
                categories,
                products,
                parentCategories,
                user: req.user
            });
        } catch (error) {
            next(error);
        }
    }

    // Xử lý hiển thị trang đăng nhập và xử lý đăng nhập
    async login(req, res, next) {
        try {
            // Nếu là GET request, hiển thị trang đăng nhập
            if (req.method === 'GET') {
                return res.render('admin/AdminLoginPage', { 
                    page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' } 
                });
            }

            // Nếu là POST request, xử lý đăng nhập
            const { username, password } = req.body;

            // Tìm user theo username
            const user = await User.findOne({ username });

            if (!user) {
                return res.render('admin/AdminLoginPage', {
                    page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' },
                    error: 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.render('admin/AdminLoginPage', {
                    page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' },
                    error: 'Tên đăng nhập hoặc mật khẩu không chính xác'
                });
            }

            // Kiểm tra role admin
            if (user.role !== 'admin') {
                return res.render('admin/AdminLoginPage', {
                    page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' },
                    error: 'Bạn không có quyền truy cập trang quản trị'
                });
            }

            // Kiểm tra trạng thái tài khoản
            if (!user.isActive) {
                return res.render('admin/AdminLoginPage', {
                    page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' },
                    error: 'Tài khoản của bạn đã bị khóa'
                });
            }

            // Tạo token JWT
            const token = jwt.sign(
                {
                    id: user._id,
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

            // Chuyển hướng đến trang admin
            return res.redirect('/admin');

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            return res.render('admin/AdminLoginPage', {
                page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' },
                error: 'Lỗi server, vui lòng thử lại sau'
            });
        }
    }

    // Thống kê
    statistics(req, res, next) {
        res.render('AdminStatistics', { page: { title: 'Thống kê' } });
    }

    // Cài đặt hệ thống
    settings(req, res, next) {
        res.render('AdminSettings', { page: { title: 'Cài đặt hệ thống' } });
    }

    // Đăng xuất admin
    logout(req, res) {
        res.clearCookie('token');
        req.session.destroy();
        res.redirect('/admin/login');
    }

    // Modal xem chi tiết đơn hàng
    viewOrderModal(req, res, next) {
        const orderId = req.params.id;
        res.render('modals/viewOrder', { layout: false, orderId });
    }

    // Modal cập nhật trạng thái đơn hàng
    updateOrderStatusModal(req, res, next) {
        const orderId = req.params.id;
        res.render('modals/updateOrderStatus', { layout: false, orderId });
    }

    // Modal chỉnh sửa thông tin người dùng
    editUserModal(req, res, next) {
        User.findById(req.params.id).lean()
            .then(user => {
                if (!user) {
                    return res.status(404).send('User not found');
                }
                res.render('modals/editUser', { layout: false, user });
            })
    }

    updateUserModal(req, res, next) {
        const { username, email, role, status, password } = req.body;
        const updateData = {
            username: username,
            email: email,
            role: role,
            isActive: status === 'active',
        };
        
        // Chỉ cập nhật password nếu có nhập mới
        if (password && password.trim() !== '') {
            updateData.password = password;
        }

        User.updateOne({_id: req.params.id}, updateData)
            .then(user => {
                res.redirect('back');
            })
            .catch(next);
    }

    // Xử lý xóa người dùng
    async deleteUser(req, res, next) {
        try {
            const userId = req.params.id;
            
            // Kiểm tra xem user có tồn tại không
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'Không tìm thấy người dùng' });
            }

            // Không cho phép xóa tài khoản admin
            if (user.role === 'admin') {
                return res.status(403).json({ message: 'Không thể xóa tài khoản admin' });
            }

            // Xóa user
            await User.findByIdAndDelete(userId);

            // Chuyển hướng về trang quản lý người dùng
            res.redirect('back');
        } catch (error) {
            console.error('Lỗi xóa người dùng:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }
}

module.exports = new AdminController();
