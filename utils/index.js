const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const checkPermissions = require('./checkPermissions');
const createTokenUser = require('./createTokenUser');
const sendVerificationEmail = require('./sendVerificationEmail');
const { sendEmailEth, sendEmail } = require('./sendEmail');
const sendResetPasswordEmail = require('./sendResetPasswordEmail');
const createHash = require('../utils/createHash');
module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  checkPermissions,
  createTokenUser,
  sendVerificationEmail,
  sendEmailEth,
  sendEmail,
  sendResetPasswordEmail,
  createHash,
};
