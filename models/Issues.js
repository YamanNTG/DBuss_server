const mongoose = require('mongoose');

const IssuesSchema = new mongoose.Schema(
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
    location: {
      lat: {
        type: Number,
        required: [true, 'Latitude is required'],
        default: 53.3498, // Default Dublin latitude
      },
      lng: {
        type: Number,
        required: [true, 'Longitude is required'],
        default: -6.2603, // Default Dublin longitude
      },
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved'],
      default: 'open',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Issues', IssuesSchema);
