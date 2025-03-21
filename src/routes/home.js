const express = require('express');
const router = express.Router();
const {HomeController} = require('../app/controller/index');

router.get('/interior-design', HomeController.interiorDesign);
router.get('/homepage', HomeController.home);
router.get('/product-details', HomeController.productDetails);
router.get('/', HomeController.dashboard);

module.exports = router;
