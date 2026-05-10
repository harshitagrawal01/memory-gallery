const express = require('express');
const router = express.Router();
const { authUser } = require('../middlewares/authUser');
const { upload } = require('../config/s3');
const {
  uploadMemory,
  getAllMemories,
  getMyMemories,
  deleteMemory,
  likeMemory,
  addComment,
  searchMemories
} = require('../controllers/memoryController');

// Public routes
router.get('/', getAllMemories);
router.get('/search', searchMemories);

// Protected routes
router.post('/', authUser, upload.single('image'), uploadMemory);
router.get('/my', authUser, getMyMemories);
router.delete('/:id', authUser, deleteMemory);
router.put('/:id/like', authUser, likeMemory);
router.post('/:id/comment', authUser, addComment);

module.exports = router;