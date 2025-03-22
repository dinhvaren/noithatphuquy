const express = require('express');
const router = express.Router();
const {AdminController} = require('../app/controller/index');

router.post('/products/create', AdminController.createProductModal);
router.get('/products/create', AdminController.createProductModal);

router.post('/categories/create', AdminController.createCategoryModal);
router.put('/categories/update/:id', AdminController.editCategoryModal);

router.post('/login', AdminController.login);
router.get('/login', AdminController.login);
router.get('/', AdminController.index);

module.exports = router;
