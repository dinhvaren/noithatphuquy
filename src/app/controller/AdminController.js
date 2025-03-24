const { User, Category, Product } = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminController {
    index(req, res, next) {
        Promise.all([
            User.find().lean(),
            Category.find().lean(),
            Product.find().lean()
        ])
            .then(([users, categories, products]) => {
                res.render('Admin', {
                    page: { title: 'Quản trị website' },
                    users: users,
                    categories: categories,
                    products: products
                });
            })
            .catch(next);
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
                maxAge: 1 * 60 * 60 * 1000 // 1 giờ
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
            res.redirect('/admin/login');
        } catch (error) {
            console.error('Lỗi đăng xuất:', error);
            res.status(500).json({ message: 'Lỗi server, vui lòng thử lại sau' });
        }
    }

    // Modal thêm sản phẩm mới
    async createProductModal(req, res, next) {
        try {
            const {
                name,
                price,
                salePrice,
                category,
                description,
                isActive,
                specifications
            } = req.body;

            console.log('Received data:', req.body);

            // Kiểm tra dữ liệu bắt buộc
            if (!name || !price || !category || !description) {
                return res.status(400).json({ message: 'Vui lòng nhập đầy đủ thông tin' });
            }

            // Xử lý hình ảnh
            let images = [];
            if (req.files && req.files.length > 0) {
                images = req.files.map(file => file.path);
            }

            // Tạo mã sản phẩm tự động
            const code = 'SP' + Date.now().toString().slice(-6);

            // Tạo object specifications
            const productSpecifications = {
                material: specifications?.material || '',
                color: specifications?.color || '',
                size: {
                    length: specifications?.['size[length]'] || 0,
                    width: specifications?.['size[width]'] || 0,
                    height: specifications?.['size[height]'] || 0
                },
                warranty: specifications?.warranty || 0
            };

            console.log('Product specifications:', productSpecifications);

            // Tìm category theo name
            const categoryDoc = await Category.findOne({ name: category });
            if (!categoryDoc) {
                return res.status(400).json({ message: 'Danh mục không tồn tại' });
            }

            // Tạo sản phẩm mới
            const product = new Product({
                name,
                code,
                price: parseFloat(price),
                salePrice: salePrice ? parseFloat(salePrice) : null,
                categoryId: categoryDoc._id, // Sử dụng ID của category tìm được
                description,
                images,
                isActive: isActive === 'true',
                specifications: productSpecifications
            });

            console.log('Product to save:', product);

            // Lưu sản phẩm
            const savedProduct = await product.save();
            console.log('Sản phẩm đã được thêm:', savedProduct);

            // Chuyển hướng về trang danh sách sản phẩm
            res.redirect('back');
        } catch (error) {
            console.error('Lỗi thêm sản phẩm:', error);
            // Nếu có lỗi validation, trả về thông báo lỗi chi tiết
            if (error.name === 'ValidationError') {
                return res.status(400).json({
                    message: 'Dữ liệu không hợp lệ',
                    errors: Object.values(error.errors).map(err => err.message)
                });
            }
            res.status(500).json({
                message: 'Lỗi server, vui lòng thử lại sau',
                error: error.message
            });
        }
    }

    // Modal chỉnh sửa sản phẩm
    editProductModal(req, res, next) {
        const productId = req.params._id;
        console.log(productId);
        res.render('modals/editProduct', { layout: false, productId });
    }

    // Modal xem chi tiết sản phẩm
    viewProductModal(req, res, next) {
        const productId = req.params.id;
        res.render('modals/viewProduct', { layout: false, productId });
    }

    // Modal thêm mới danh mục
    async createCategoryModal(req, res, next) {
        try {
            const name = req.body.name;
            const description = req.body.description;
            console.log('Received data:', { name, description });

            if (!name) {
                return res.status(400).json({ message: 'Tên danh mục không được để trống' });
            }

            const category = new Category({
                name,
                description,
                isActive: true
            });

            await category.save();
            console.log('Category saved:', category);

            res.render('modals/addCategory', {
                layout: false,
                message: 'Thêm danh mục thành công'
            });
        } catch (error) {
            console.error('Error creating category:', error);
            res.status(500).json({
                message: 'Lỗi khi tạo danh mục',
                error: error.message
            });
        }
    }


    // Modal chỉnh sửa danh mục
    editCategoryModal(req, res, next) {
        Category.findById(req.params.id).lean()
        .then((category) => {
            if (!category) {
                return res.status(404).send('Category not found');
            }
            res.render('modals/editCategory', { layout: true, category });
        })
        .catch(next);
    }

    updateCategoryModal(req, res, next) {
        Category.updateOne({_id: req.params.id}, req.body).lean()
        .then(() => {
            res.redirect('back', {
                message: 'Cập nhật danh mục thành công',
                layout: false,
            });
        })
        .catch(next);
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
        User.updateOne(req.params.id).lean()
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
