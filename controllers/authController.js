const User = require('../models/User');
const Token = require('../models/Token');
const InviteToken = require('../models/InviteToken');

const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  attachCookiesToResponse,
  createTokenUser,
  sendVerificationEmail,
  sendResetPasswordEmail,
  sendRegisterInviteEmail,
  createHash,
} = require('../utils');
const crypto = require('crypto');

const registerInvite = async (req, res) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new CustomError.BadRequestError('Please provide email');
  }
  alreadyExist = await User.findOne({ email });
  if (alreadyExist) {
    throw new CustomError.BadRequestError(
      'User already exists, provide different email'
    );
  }

  const registerVerificationToken = crypto.randomBytes(40).toString('hex'); //create buffer and turn in into string with 2 hexidecimal

  const inviteToken = await InviteToken.create({
    registerVerificationToken,
    email,
    name,
  });

  const origin = 'https://buss-front.netlify.app';
  // const origin = 'http://localhost:5173';

  await sendRegisterInviteEmail({
    name: inviteToken.name,
    email: inviteToken.email,
    registerToken: inviteToken.registerVerificationToken,
    origin,
  });

  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Register invite sent',
  });
};

const verifyRegisterToken = async (req, res) => {
  const { inviteToken, email } = req.body;

  const token = await InviteToken.findOne({ email });
  if (!token) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }
  if (
    token.registerVerificationToken !== inviteToken ||
    token.email !== email
  ) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  res.status(StatusCodes.OK).json({ msg: 'Verify token valid' });
};

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? 'admin' : 'driver';

  const verificationToken = crypto.randomBytes(40).toString('hex'); //create buffer and turn in into string with 2 hexidecimal

  const user = await User.create({
    name,
    email,
    password,
    role,
    verificationToken,
  });

  const registerToken = await InviteToken.findOne({ email });

  const origin = 'https://buss-front.netlify.app';
  // const origin = 'http://localhost:5173';

  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken: user.verificationToken,
    origin,
  });
  if (registerToken) {
    await InviteToken.deleteOne({ _id: registerToken._id });
  }
  res.status(StatusCodes.CREATED).json({
    msg: 'Success! Please check your email to verify account',
  });
};

const verifyEmail = async (req, res) => {
  const { verificationToken, email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }
  if (user.verificationToken !== verificationToken) {
    throw new CustomError.UnauthenticatedError('Verification failed');
  }

  (user.isVerified = true), (user.verified = Date.now());
  user.verificationToken = '';
  await user.save();
  res
    .status(StatusCodes.OK)
    .json({ msg: 'Email Verified', isVerified: user.isVerified });
};

const login = async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    throw new CustomError.BadRequestError('Please provide email and password');
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError('Ivalid Credentials');
  }

  const isPasswordCorrect = await user.comparePassword(password);

  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Ivalid Credentials');
  }
  if (!user.isVerified) {
    throw new CustomError.UnauthenticatedError('Please verify your email');
  }

  const tokenUser = createTokenUser(user);

  //create refresh token
  let refreshToken = '';
  //check for existing token

  const existingToken = await Token.findOne({ user: user._id });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new CustomError.UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });

    res
      .status(StatusCodes.OK)
      .json({ user: tokenUser, isVerified: user.isVerified });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');

  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: user._id };

  await Token.create(userToken);
  attachCookiesToResponse({ res, user: tokenUser, refreshToken });

  res
    .status(StatusCodes.OK)
    .json({ user: tokenUser, isVerified: user.isVerified });
};

const logout = async (req, res) => {
  await Token.findOneAndDelete({ user: req.user.userId });

  res.cookie('accessToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie('refreshToken', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: 'User logged out!' });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new CustomError.BadRequestError('Please provide valid email');
  }
  const user = await User.findOne({ email });
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString('hex');
    // send email
    const origin = 'https://buss-front.netlify.app';
    // const origin = 'http://localhost:5173';
    await sendResetPasswordEmail({
      name: user.name,
      email: user.email,
      passwordToken,
      origin,
    });
    const tenMinutes = 1000 * 60 * 10;
    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    user.passwordToken = createHash(passwordToken);
    user.passwordTokenExpirationDate = passwordTokenExpirationDate;
    user.save();
  }

  res
    .status(StatusCodes.OK)
    .json({ msg: 'Please verify your email for reset password link' });
};

const resetPassword = async (req, res) => {
  const { passwordToken, email, password } = req.body;
  console.log(req.body);

  if (!passwordToken || !email || !password) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ email });

  if (user) {
    const currentDate = new Date();
    if (
      user.passwordToken === createHash(passwordToken) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;

      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: 'Password reset Succesfully' });
};

module.exports = {
  login,
  logout,
  register,
  verifyEmail,
  forgotPassword,
  resetPassword,
  registerInvite,
  verifyRegisterToken,
};
