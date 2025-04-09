const express = require('express');
const router = express.Router();
const {AdminController, CategoryController, ProductController} = require('../app/controller/index');
const CheckPermission = require('../app/middlewares/CheckPermission');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2;

// Cấu hình Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5 // 5MB
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Chỉ chấp nhận file ảnh!'));
        }
    }
});

// Routes không cần xác thực
router.get('/login', CheckPermission.checkNotAuthenticated, AdminController.login);
router.post('/login', CheckPermission.checkNotAuthenticated, AdminController.login);

// Áp dụng middleware xác thực cho tất cả các routes phía dưới
router.use(CheckPermission.verifyToken);
router.use(CheckPermission.checkAdmin);

// Routes cho danh mục
router.get('/categories/:id', CategoryController.editCategoryModal);
router.put('/categories/:id/edit', CategoryController.updateCategoryModal);
router.post('/categories/:id/edit', CategoryController.updateCategoryModal);
router.post('/categories/create', CategoryController.createCategoryModal);
router.delete('/categories/:id', CategoryController.deleteCategoryModal);
router.post('/categories/:id', CategoryController.deleteCategoryModal);

// Routes cho sản phẩm
router.post('/products/create', upload.array('images', 5), ProductController.createProductModal);
router.get('/products/create', ProductController.createProductModal);
router.get('/products/:id', ProductController.editProductModal);
router.post('/products/:id/edit', upload.array('images', 5), ProductController.updateProductModal);
router.put('/products/:id/edit', upload.array('images', 5), ProductController.updateProductModal);
router.get('/products/:id/edit', ProductController.editProductModal);
router.delete('/products/:id', ProductController.deleteProductModal);
router.post('/products/:id', ProductController.deleteProductModal);

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
