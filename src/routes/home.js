const express = require('express');
const router = express.Router();
const {HomeController} = require('../app/controller/index');

router.post('/signup', HomeController.signup);
router.get('/interior-design', HomeController.interiorDesign);
router.get('/product-details', HomeController.productDetails);
router.get('/homepage', HomeController.home);
router.get('/', HomeController.dashboard);

module.exports = router;
