const express = require('express');
const router = express.Router();
const homeController = require('../app/controller/HomeController');

router.post('/login', homeController.login)
router.post('/signup', homeController.signup)
router.get('/', homeController.home);

module.exports = router;
