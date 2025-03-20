class AdminController {
    index(req, res, next) {
        res.render('Admin', { page: { title: 'Trang Quản Lý' } });
    }
    login(req, res, next) {
        res.render('AdminLoginPage', { page: { title: 'Đăng nhập quản trị | Nội Thất Phú Quý' } });
    }
}

module.exports = new AdminController();
