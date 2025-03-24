const express = require('express');
const router = express.Router();
const {HomeController} = require('../app/controller/index');

router.post('/signup', HomeController.signup);
router.get('/interior-design', HomeController.interiorDesign);
router.get('/profile', HomeController.profile);
router.get('/orders', HomeController.orders);
router.get('/wishlist', HomeController.wishlist);
router.get('/change-password', HomeController.changePassword);
router.get('/products', HomeController.products);
router.get('/product-details', HomeController.productDetails);
router.get('/homepage', HomeController.home);
router.get('/', HomeController.dashboard);

module.exports = router;
