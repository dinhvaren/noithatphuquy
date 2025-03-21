const express = require('express');
const router = express.Router();
const {AdminController} = require('../app/controller/index');

router.get('/', AdminController.index);
router.get('/login', AdminController.login);

module.exports = router;
