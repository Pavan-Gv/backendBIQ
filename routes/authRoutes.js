const express = require('express');
const authController = require('../Controllers/authController');

const router = express.Router();

router.post('/login', authController.login);
router.post('/signup', authController.signup);
// router.get('/logout', authController.logout); // Assuming you have a logout function

module.exports = router;