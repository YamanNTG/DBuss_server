const { createJWT, isTokenValid, attachCookiesToResponse } = require('./jwt');
const checkPermissions = require('./checkPermissions');
const createTokenUser = require('./createTokenUser');
const sendVerificationEmail = require('./sendVerificationEmail');

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  checkPermissions,
  createTokenUser,
  sendVerificationEmail,
};
