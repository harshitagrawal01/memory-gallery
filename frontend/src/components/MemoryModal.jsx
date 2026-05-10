import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const MemoryModal = ({ memory, onClose, onLike, onDelete }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(memory.comments || []);
  const [addingComment, setAddingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);

  const isOwner = user && memory.user?._id === user.id;
  const isLiked = user && memory.likedBy?.includes(user.id);

  const handleLike = async () => {
    if (!user) return toast.error('Please login to like!');
    setLikeLoading(true);
    try {
      const res = await axiosInstance.put(`/memories/${memory._id}/like`);
      onLike(memory._id, res.data.likes);
    } catch (error) {
      toast.error('Failed to like');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setAddingComment(true);
    try {
      const res = await axiosInstance.post(`/memories/${memory._id}/comment`, { text: comment });
      setComments([...comments, res.data.comment]);
      setComment('');
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setAddingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this memory?')) return;
    try {
      await axiosInstance.delete(`/memories/${memory._id}`);
      onDelete(memory._id);
      onClose();
      toast.success('Memory deleted!');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex shadow-2xl"
        onClick={e => e.stopPropagation()}
      >

        {/* LEFT — Image */}
        <div className="flex-1 relative bg-black">
          <img
            src={memory.imageUrl}
            alt={memory.caption}
            className="w-full h-full object-contain max-h-[90vh]"
          />
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition"
          >
            ✕
          </button>
        </div>

        {/* RIGHT — Details */}
        <div className="w-80 flex-shrink-0 flex flex-col">

          {/* User Info */}
          <div className="p-4 border-b border-[#E8DDD4] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C4956A] to-[#8B5E3C] flex items-center justify-center text-white font-bold text-sm">
                {memory.user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-[#2C1810] text-sm">{memory.user?.name}</p>
                <p className="text-[#8C7B6B] text-xs">
                  {new Date(memory.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            {isOwner && (
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-500 text-sm transition"
              >
                🗑️
              </button>
            )}
          </div>

          {/* Caption & Tags */}
          <div className="p-4 border-b border-[#E8DDD4]">
            <p className="text-[#2C1810] font-medium mb-3">{memory.caption}</p>
            <div className="flex flex-wrap gap-2">
              {memory.location && (
                <span className="text-xs text-[#8C7B6B] bg-[#FAF7F2] border border-[#E8DDD4] px-3 py-1 rounded-full">
                  📍 {memory.location}
                </span>
              )}
              {memory.activityName && (
                <span className="text-xs text-[#8C7B6B] bg-[#FAF7F2] border border-[#E8DDD4] px-3 py-1 rounded-full">
                  🏃 {memory.activityName}
                </span>
              )}
            </div>
          </div>

          {/* Like Button */}
          <div className="px-4 py-3 border-b border-[#E8DDD4]">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-2 text-sm font-medium transition-all hover:scale-105 ${
                isLiked ? 'text-red-500' : 'text-[#8C7B6B] hover:text-red-500'
              }`}
            >
              {isLiked ? '❤️' : '🤍'}
              <span>{memory.likes} {memory.likes === 1 ? 'like' : 'likes'}</span>
            </button>
          </div>

          {/* Comments List */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {comments.length === 0 ? (
              <p className="text-[#C4A882] text-sm text-center mt-4">
                No comments yet — be the first!
              </p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-[#E8DDD4] flex items-center justify-center text-[#8B5E3C] font-bold text-xs flex-shrink-0">
                    {c.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-[#FAF7F2] rounded-xl px-3 py-2 flex-1">
                    <span className="text-xs font-semibold text-[#8B5E3C]">
                      {c.user?.name}{' '}
                    </span>
                    <span className="text-sm text-[#2C1810]">{c.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          {user ? (
            <form
              onSubmit={handleComment}
              className="p-4 border-t border-[#E8DDD4] flex gap-2"
            >
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 border border-[#E8DDD4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] bg-[#FAF7F2] text-[#2C1810] placeholder-[#C4A882]"
              />
              <button
                type="submit"
                disabled={addingComment}
                className="bg-[#8B5E3C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7A4F2F] disabled:opacity-50 transition"
              >
                {addingComment ? '...' : 'Post'}
              </button>
            </form>
          ) : (
            <p className="p-4 text-center text-sm text-[#8C7B6B] border-t border-[#E8DDD4]">
              Login to comment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoryModal;