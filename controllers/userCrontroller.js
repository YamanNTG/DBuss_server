const User = require('../models/User');
const { StatusCodes } = require('http-status-codes');
const CustomError = require('../errors');
const {
  checkPermissions,
  createTokenUser,
  attachCookiesToResponse,
} = require('../utils');

const getAllUsers = async (req, res) => {
  const users = await User.find({}).select('-password');
  res.status(StatusCodes.OK).json({ users });
};

const getSingleUser = async (req, res) => {
  const user = await User.findOne({ _id: req.params.id }).select('-password');
  if (!user) {
    throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
  }
  checkPermissions(req.user, user._id);
  res.status(StatusCodes.OK).json({ user });
};

const showCurrentUser = async (req, res) => {
  const { userId } = req.user;

  try {
    const currentUser = await User.findById(userId).select('-password');

    if (!currentUser) {
      throw new UnauthorizedError('Authentication Invalid');
    }

    // Only update lastActive if it's been more than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

    if (
      !currentUser.lastActive ||
      new Date(currentUser.lastActive) < fiveMinutesAgo
    ) {
      currentUser.lastActive = new Date();
      await currentUser.save();
    }

    res.status(StatusCodes.OK).json({ user: currentUser });
  } catch (error) {
    console.error('Error in showCurrentUser:', error);
    throw error;
  }
};

const updateUser = async (req, res) => {
  const { email, name, profileImage } = req.body;
  if (!email || !name || !profileImage) {
    throw new CustomError.BadRequestError('Please provide all values');
  }
  const user = await User.findOne({ _id: req.user.userId });

  user.email = email;
  user.name = name;
  user.profileImage = profileImage;

  user.save();

  const tokenUser = createTokenUser(user);
  attachCookiesToResponse({ res, user: tokenUser });
  res.status(StatusCodes.OK).json({ msg: 'Profile Updated Succesfully!' });
};

const updateUserPassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if ((!oldPassword, !newPassword)) {
    throw new CustomError.NotFoundError('Please provide both values');
  }
  const user = await User.findOne({ _id: req.user.userId });
  const isPasswordCorrect = await user.comparePassword(oldPassword);
  if (!isPasswordCorrect) {
    throw new CustomError.UnauthenticatedError('Invalid Credentials');
  }
  user.password = newPassword;
  user.save();
  res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated.' });
};

module.exports = {
  getAllUsers,
  getSingleUser,
  showCurrentUser,
  updateUser,
  updateUserPassword,
};
