const express = require('express');
const router = express.Router();
const {CartController} = require('../app/controller/index');

router.get('/checkout', CartController.checkout);

module.exports = router;
