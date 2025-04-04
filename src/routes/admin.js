const express = require('express');
const router = express.Router();
const {AdminController} = require('../app/controller/index');
const CheckPermission = require('../app/middlewares/CheckPermission');

// Routes không cần xác thực
router.get('/login', CheckPermission.checkNotAuthenticated, AdminController.login);
router.post('/login', CheckPermission.checkNotAuthenticated, AdminController.login);

// Áp dụng middleware xác thực cho tất cả các routes phía dưới
router.use(CheckPermission.verifyToken);
router.use(CheckPermission.checkAdmin);

// Routes cho danh mục
router.get('/categories/:id', AdminController.editCategoryModal);
router.put('/categories/:id/edit', AdminController.updateCategoryModal);
router.post('/categories/:id/edit', AdminController.updateCategoryModal);
router.post('/categories/create', AdminController.createCategoryModal);

// Routes cho sản phẩm
router.post('/products/create', AdminController.createProductModal);
router.get('/products/create', AdminController.createProductModal);
router.get('/products/:id', AdminController.editProductModal);
router.post('/products/:id/edit', AdminController.updateProductModal);
router.put('/products/:id/edit', AdminController.updateProductModal);
router.get('/products/:id/edit', AdminController.editProductModal);

// Routes cho người dùng
router.get('/users/:id', AdminController.editUserModal);
router.put('/users/:id/edit', AdminController.updateUserModal);
router.post('/users/:id/edit', AdminController.updateUserModal);
router.post('/users/:id', AdminController.deleteUser);
router.delete('/users/:id', AdminController.deleteUser);

// Route đăng xuất
router.post('/logout', AdminController.logout);

// Route trang chủ admin
router.get('/', AdminController.index);

module.exports = router;
