const express = require('express');
const router = express.Router();
const { HomeController } = require('../app/controller/index');
const CheckPermission = require('../app/middlewares/CheckPermission');
const jwt = require('jsonwebtoken');
const {User }= require('../app/models/index');

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

// Routes yêu cầu đăng nhập
router.use('/profile', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/orders', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/wishlist', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/cart', CheckPermission.verifyToken, CheckPermission.checkUser);
router.use('/change-password', CheckPermission.verifyToken, CheckPermission.checkUser);

router.get('/profile', HomeController.profile);
router.get('/orders', HomeController.orders);
router.get('/wishlist', HomeController.wishlist);
router.get('/cart', HomeController.cart);
router.get('/change-password', HomeController.changePassword);
router.post('/change-password', HomeController.handleChangePassword);

// Route đăng xuất
router.get('/logout', CheckPermission.verifyToken, HomeController.logout);

// Route kiểm tra username và email
router.get('/check-username', HomeController.checkUsername);
router.get('/check-email', HomeController.checkEmail);

module.exports = router;
