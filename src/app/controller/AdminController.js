const {User} = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminController {
    index(req, res, next) {
        res.render('Admin', { page: { title: 'Quản trị | Nội Thất Phú Quý' } });
    }

    // Xử lý hiển thị trang đăng nhập và xử lý đăng nhập
    async login(req, res, next) {
        // Nếu là GET request, hiển thị trang đăng nhập
        if (req.method === 'GET') {
            res.render('AdminLoginPage', { page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' } });
            return;
        }

        // Nếu là POST request, xử lý đăng nhập
        try {
            const { username, password } = req.body;
            
            // Tìm user theo username
            const user = await User.findOne({ username });
            
            if (!user) {
                return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
            }

            // Kiểm tra mật khẩu
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
            }

            // Kiểm tra role admin
            if (user.role !== 'admin') {
                return res.status(403).json({ message: 'Bạn không có quyền truy cập trang quản trị' });
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
                { expiresIn: '24h' }
            );

            // Lưu token vào cookie
            res.cookie('adminToken', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 24 * 60 * 60 * 1000 // 24 giờ
            });

            res.status(200).json({ 
                message: 'Đăng nhập thành công',
                user: {
                    id: user._id,
                    username: user.username,
                    role: user.role
                }
            });
        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Quản lý sản phẩm
    async products(req, res, next) {
        res.render('AdminProducts', { page: { title: 'Quản lý sản phẩm' }, products });
    }

    // Quản lý danh mục
    categories(req, res, next) {
        res.render('AdminCategories', { page: { title: 'Quản lý danh mục' } });
    }

    // Quản lý đơn hàng
    orders(req, res, next) {
        res.render('AdminOrders', { page: { title: 'Quản lý đơn hàng' } });
    }

    // Quản lý người dùng
    users(req, res, next) {

    
        res.render('AdminUsers', { page: { title: 'Quản lý người dùng' } });
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
    logout(req, res, next) {
        try {
            // Xóa token khỏi cookie
            res.clearCookie('adminToken');
            res.status(200).json({ message: 'Đăng xuất thành công' });
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Modal thêm mới sản phẩm
    createProductModal(req, res, next) {
        res.render('modals/createProduct', { layout: false });
    }

    // Modal chỉnh sửa sản phẩm
    editProductModal(req, res, next) {
        const productId = req.params.id;
        res.render('modals/editProduct', { layout: false, productId });
    }

    // Modal xem chi tiết sản phẩm
    viewProductModal(req, res, next) {
        const productId = req.params.id;
        res.render('modals/viewProduct', { layout: false, productId });
    }

    // Modal thêm mới danh mục
    createCategoryModal(req, res, next) {
        res.render('modals/createCategory', { layout: false });
    }

    // Modal chỉnh sửa danh mục
    editCategoryModal(req, res, next) {
        const categoryId = req.params.id;
        res.render('modals/editCategory', { layout: false, categoryId });
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

    // Modal xem chi tiết người dùng
    viewUserModal(req, res, next) {
        const userId = req.params.id;
        res.render('modals/viewUser', { layout: false, userId });
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
        .catch(next);
    }
}

module.exports = new AdminController();
