const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const CustomError = require("../errors");
const { attachCookiesToResponse } = require("../utils");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  const isFirstAccount = (await User.countDocuments({})) === 0;
  const role = isFirstAccount ? "admin" : "driver";

  const user = await User.create({ name, email, password, role });
  const tokenUser = { name: user.name, userId: user.id, role: user.role };

  attachCookiesToResponse({ res, user: tokenUser });

  res.status(StatusCodes.CREATED).json({ user: tokenUser });
};

const login = async (req, res) => {
  const { password, email } = req.body;

  if (!password || !email) {
    throw new CustomError.BadRequestError("Please provide email and password");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new CustomError.UnauthenticatedError("Ivalid Credentials");
  }

  res.status(StatusCodes.OK).json({ user });
};

const logout = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "User logged out!" });
};

module.exports = { login, logout, register };
