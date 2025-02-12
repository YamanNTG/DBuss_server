const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide Title'],
      maxlength: [100, "Title can't be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, 'Please provide description'],
      maxlength: [2000, 'Description can not be more than 2000 characters'],
    },
    image: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('News', NewsSchema);
