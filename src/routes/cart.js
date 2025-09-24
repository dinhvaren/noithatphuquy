const express = require('express');
const router = express.Router();
const {CartController} = require('../app/controller/index');

router.get('/', CartController.show);
router.post('/add', CartController.addToCart);
router.put('/update', CartController.updateQuantity);
router.delete('/remove', CartController.removeFromCart);
router.delete('/clear', CartController.clearCart);
router.get('/checkout', CartController.checkout);

module.exports = router;
