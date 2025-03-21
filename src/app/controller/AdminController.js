class AdminController {
    index(req, res, next) {
        res.render('Admin', { page: { title: 'Trang Quản Lý' } });
    }
    login(req, res, next) {
        res.render('AdminLoginPage', { page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' } });
    }

    // Quản lý sản phẩm
    products(req, res, next) {
        res.render('AdminProducts', { page: { title: 'Quản lý sản phẩm' } });
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
        res.clearCookie('adminToken');
        res.redirect('/admin/login');
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
        const userId = req.params.id;
        res.render('modals/editUser', { layout: false, userId });
    }
}

module.exports = new AdminController();
