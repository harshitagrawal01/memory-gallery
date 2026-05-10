const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  createdAt: {
    type: Date,
    default: Date.now
  },
});

const memorySchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: true
  },

  imageKey: {
    type: String,
    required: true
  },

  caption: {
    type: String,
    required: true,
    trim: true,
    maxlength: 300
  },

  location: {
    type: String,
    default: "",
    trim: true
  },

  activityName: {
    type: String,
    default: "",
    trim: true
  },

  likes: {
    type: Number,
    default: 0
  },
  likedBy: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    default: []
  },

  comments: {
    type: [commentSchema],
    default: []
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }

}, {
  timestamps: true
});

memorySchema.index({ location: 1 });
memorySchema.index({ activityName: 1 });

module.exports = mongoose.model('Memory', memorySchema);