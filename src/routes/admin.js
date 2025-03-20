const express = require('express');
const router = express.Router();
const adminController = require('../app/controller/AdminController');

router.get('/', adminController.index);
router.get('/login', adminController.login);

module.exports = router;
