const express = require('express');
const router = express.Router();
const { HomeController, UserController } = require('../app/controller/index');
const CheckPermission = require('../app/middlewares/CheckPermission');
const jwt = require('jsonwebtoken');
const { User }= require('../app/models/index');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
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

// Middleware kiểm tra user cho các route công khai
const attachUser = async (req, res, next) => {
    try {
        const token = req.cookies?.token;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
            const user = await User.findById(decoded.id);
            if (user && user.isActive) {
                req.user = user;
            }
        }
        next();
    } catch (error) {
        next();
    }
};

// Routes công khai - không cần đăng nhập
router.get('/', HomeController.dashboard);

// Routes yêu cầu đăng nhập
router.get('/homepage', CheckPermission.verifyToken, HomeController.home);

// Routes công khai với kiểm tra user
router.get('/products', attachUser, HomeController.products);
router.get('/product-details', attachUser, HomeController.productDetails);
router.get('/interior-design', attachUser, HomeController.interiorDesign);
router.get('/contact', attachUser, HomeController.contact);
router.get('/about', attachUser, HomeController.about);
router.get('/news', attachUser, HomeController.news);

// Routes xác thực - không yêu cầu đăng nhập
router.get('/login', CheckPermission.checkNotAuthenticated, HomeController.login);
router.post('/login', CheckPermission.checkNotAuthenticated, HomeController.login);
router.get('/signup', CheckPermission.checkNotAuthenticated, HomeController.signup);
router.post('/signup', CheckPermission.checkNotAuthenticated, HomeController.signup);

// Routes yêu cầu đăng nhập - User Controller
router.use('/profile', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/orders', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/wishlist', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/cart', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/change-password', CheckPermission.verifyToken, CheckPermission.checkUser);

router.get('/profile', UserController.profile);
router.post('/profile/update', upload.single('avatar'), UserController.updateProfile);
router.get('/orders', UserController.orders);
router.get('/wishlist', UserController.wishlist);
router.get('/cart', HomeController.cart);
router.get('/change-password', UserController.changePassword);
router.post('/change-password', UserController.handleChangePassword);

// Route đăng xuất
router.get('/logout', CheckPermission.verifyToken, HomeController.logout);

// Route kiểm tra username và email
router.get('/check-username', HomeController.checkUsername);
router.get('/check-email', HomeController.checkEmail);

module.exports = router;
