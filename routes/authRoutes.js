const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authentication');

const {
  login,
  logout,
  register,
  verifyEmail,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.delete('/logout', authenticateUser, logout);
router.post('/verify-email', verifyEmail);

module.exports = router;
