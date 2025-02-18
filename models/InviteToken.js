const mongoose = require('mongoose');
const validator = require('validator');

const InviteSchema = new mongoose.Schema({
  registerVerificationToken: {
    type: String,
  },
  name: {
    type: String,
    required: [true, 'plese provide name'],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Please provide email'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide valid email',
    },
  },
});

UserSchema.pre('remove', async function (next) {
  await this.model('Review').deleteMany({ product: this._id });
});

module.exports = mongoose.model('InviteToken', InviteSchema);
