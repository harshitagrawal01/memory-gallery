const Memory = require('../models/Memory');
const { s3 } = require('../config/s3');
const { DeleteObjectCommand } = require('@aws-sdk/client-s3');

const uploadMemory = async (req, res) => {
  try {

    const caption = req.body.caption?.trim();
    const location = req.body.location?.trim();
    const activityName = req.body.activityName?.trim();

    if (!req.file) {
      return res.status(400).json({
        message: 'Please upload an image'
      });
    }

    if (!caption) {
      return res.status(400).json({
        message: 'Caption is required'
      });
    }

    const memory = await Memory.create({
      imageUrl: req.file.location,
      imageKey: req.file.key,
      caption,
      location: location || "",
      activityName: activityName || "",
      user: req.user.id
    });

    const populatedMemory = await Memory.findById(memory._id)
      .populate('user', 'name profileImage');

    res.status(201).json({
      message: 'Memory uploaded successfully',
      memory: populatedMemory
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error',
      error: error.message
    });
  }
};

const getAllMemories = async (req, res) => {
  try {

    const limit = 20;

    const memories = await Memory.find()
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: memories.length,
      memories
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMyMemories = async (req, res) => {
  try {

    const memories = await Memory.find({ user: req.user.id })
      .populate('user', 'name profileImage')
      .populate('comments.user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10)

    res.status(200).json({
      success: true,
      count: memories.length,
      memories
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

const deleteMemory = async (req, res) => {
  try {

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        message: 'Memory not found'
      });
    }

    if (memory.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: 'Not authorized to delete this memory'
      });
    }

    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: memory.imageKey,
      })
    );

    await memory.deleteOne();

    res.status(200).json({
      message: 'Memory deleted successfully'
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

const addComment = async (req, res) => {
  try {

    const text = req.body.text?.trim();

    if (!text) {
      return res.status(400).json({
        message: 'Comment text is required'
      });
    }

    const memory = await Memory.findById(req.params.id);

    if (!memory) {
      return res.status(404).json({
        message: 'Memory not found'
      });
    }

    memory.comments.push({
      text,
      user: req.user.id,
    });

    await memory.save();

    await memory.populate(
      'comments.user',
      'name profileImage'
    );

    const newComment =
      memory.comments[memory.comments.length - 1];

    res.status(201).json({
      message: 'Comment added',
      comment: newComment
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

const searchMemories = async (req, res) => {
  try {

    const query = req.query.query?.trim();

    if (!query) {
      return res.status(400).json({
        message: 'Search query is required'
      });
    }

    const memories = await Memory.find({
      $or: [
        { location: { $regex: query, $options: 'i' } },
        { activityName: { $regex: query, $options: 'i' } },
        { caption: { $regex: query, $options: 'i' } },
      ]
    })
      .populate('user', 'name profileImage')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.status(200).json({
      success: true,
      count: memories.length,
      memories
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: 'Server error'
    });
  }
};

const likeMemory = async (req, res) => {
  try {
    const memory = await Memory.findById(req.params.id);
    if (!memory) {
      return res.status(404).json({ message: 'Memory not found' });
    }
    const alreadyLiked = memory.likedBy.includes(req.user.id);
    if (alreadyLiked) {
      memory.likedBy = memory.likedBy.filter(
        id => id.toString() !== req.user.id
      );
      memory.likes -= 1;
    } else {
      memory.likedBy.push(req.user.id);
      memory.likes += 1;
    }
    await memory.save();
    res.status(200).json({ 
      message: alreadyLiked ? 'Memory unliked' : 'Memory liked',
      likes: memory.likes 
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  uploadMemory,
  getAllMemories,
  getMyMemories,
  deleteMemory,
  likeMemory,
  addComment,
  searchMemories
};