const express = require('express');
const router = express.Router();
const {AdminController} = require('../app/controller/index');

router.post('/login', AdminController.login);
router.get('/login', AdminController.login);
router.get('/', AdminController.index);

module.exports = router;
