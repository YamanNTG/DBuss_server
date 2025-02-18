const express = require('express');
const router = express.Router();

const { authenticateUser } = require('../middleware/authentication');

const {
  login,
  logout,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  registerInvite,
  verifyRegisterToken,
} = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);
router.delete('/logout', authenticateUser, logout);
router.post('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/register-invite', registerInvite);
router.post('/register-token', verifyRegisterToken);

module.exports = router;
