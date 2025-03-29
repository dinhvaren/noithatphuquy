const express = require('express');
const router = express.Router();
const { HomeController } = require('../app/controller/index');

// Routes không cần đăng nhập
router.get('/', HomeController.dashboard);
router.get('/homepage', HomeController.home);
router.get('/products', HomeController.products);
router.get('/product-details', HomeController.productDetails);
router.get('/interior-design', HomeController.interiorDesign);
router.get('/contact', HomeController.contact);
router.get('/about', HomeController.about);
router.get('/news', HomeController.news);

// Routes xác thực
router.post('/signup', HomeController.signup);
router.post('/login', HomeController.login);
router.get('/logout', HomeController.logout);

// Routes cần đăng nhập
router.get('/profile', HomeController.profile);
router.get('/orders', HomeController.orders);
router.get('/wishlist', HomeController.wishlist);
router.get('/cart', HomeController.cart);
router.get('/change-password', HomeController.changePassword);
router.post('/change-password', HomeController.handleChangePassword);

// Route kiểm tra username và email
router.get('/check-username', HomeController.checkUsername);
router.get('/check-email', HomeController.checkEmail);

module.exports = router;
