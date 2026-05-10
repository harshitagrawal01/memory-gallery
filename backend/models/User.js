const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^[\w.-]+@[\w.-]+\.\w{2,}$/,
        'Please enter a valid email address'
      ]
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    profileImage: {
      type: String,
      default: ""
    },
    profileImageKey: {
      type: String,
      default: ""
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);