const mongoose = require("mongoose");
const validator = require("validator"); // will use for eamil checking
const bcrypt = require("bcryptjs");
const { required } = require("joi");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "plese provide name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "moderator", "user"],
  },
});

module.exports = mongoose.model("User", UserSchema);
