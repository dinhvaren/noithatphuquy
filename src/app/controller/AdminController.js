const { User, Category, Product } = require('../models/index');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AdminController {
    // Trang chủ admin
    async index(req, res, next) {
        try {
            const [users, categories, products] = await Promise.all([
                User.find().lean(),
                Category.find().lean(),
                Product.find().lean()
            ]);

            res.render('admin/Admin', {
                page: { title: 'Quản trị website' },
                users,
                categories,
                products,
                user: req.user // Thêm thông tin user đang đăng nhập
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
   async editProductModal(req, res, next) {
        try {
            const productId = req.params.id;
            const product = await Product.findById(productId)
                .populate('categoryId')
                .lean();

            if (!product) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Không tìm thấy sản phẩm' 
                });
            }

            // Chuyển đổi categoryId thành tên category
            product.category = product.categoryId.name;
            delete product.categoryId;

            res.json({
                success: true,
                data: product
            });
        } catch (error) {
            console.error('Lỗi khi lấy thông tin sản phẩm:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Lỗi server, vui lòng thử lại sau' 
            });
        }
    }

    updateProductModal(req, res, next) {
        const { name, price, salePrice, category, description, isActive, specifications } = req.body;
        const updateData = {
            name,
            price,
            salePrice: salePrice || undefined,
            category,
            description,
            isActive: isActive === 'true',
            specifications,
        };

        // Xử lý hình ảnh nếu có
        if (req.files && req.files.images) {
            const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
            const imageUrls = images.map(file => '/uploads/' + file.filename);
            updateData.images = imageUrls;
        }
        
        Product.updateOne({ _id: req.params.id }, updateData)
        .then(() => {
            res.redirect('back');
        })
        .catch(next);
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
                console.log('Name is required');
                return res.redirect('back');
            }

            const category = new Category({
                name,
                description,
                isActive: true
            });

            console.log('Category object before save:', category);
            const savedCategory = await category.save();
            console.log('Category saved successfully:', savedCategory);

            res.redirect('back');
        } catch (error) {
            console.error('Error creating category:', error);
            res.redirect('back');
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
        const { name, description, isActive } = req.body;
        
        Category.updateOne(
            { _id: req.params.id },
            { 
                name,
                description,
                isActive: isActive === 'true'
            }
        )
        .then(() => {
            res.redirect('back');
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
