const User = require("../models/User");

const register = async (req, res) => {
  res.send("User registered");
};

const login = async (req, res) => {
  res.send("User logged in");
};

const logout = async (req, res) => {
  res.send("User logged out");
};

module.exports = { login, logout, register };
