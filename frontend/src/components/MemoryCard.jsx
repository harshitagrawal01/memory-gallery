import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const MemoryCard = ({ memory, onDelete, onLike }) => {
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState(memory.comments || []);
  const [addingComment, setAddingComment] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [hovered, setHovered] = useState(false);

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
    if (!window.confirm('Are you sure you want to delete this memory?')) return;
    try {
      await axiosInstance.delete(`/memories/${memory._id}`);
      onDelete(memory._id);
      toast.success('Memory deleted!');
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all duration-300"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowComments(false); }}
    >
      {/* Image */}
      <img
        src={memory.imageUrl}
        alt={memory.caption}
        className="w-full h-auto block" // Removed fixed height to allow Masonry to work
        loading="lazy" // Standard browser optimization
      />

      {/* Always visible gradient + info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4">

        {/* User info */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-full bg-[#E8DDD4] flex items-center justify-center text-[#8B5E3C] font-bold text-xs">
            {memory.user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-white text-xs font-semibold">
            {memory.user?.name}
          </span>
        </div>

        {/* Caption */}
        <p className="text-white text-sm font-medium leading-snug mb-2">
          {memory.caption}
        </p>

        {/* Location & Activity */}
        <div className="flex flex-wrap gap-2 mb-2">
          {memory.location && (
            <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              📍 {memory.location}
            </span>
          )}
          {memory.activityName && (
            <span className="text-xs text-white/80 bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded-full">
              🏃 {memory.activityName}
            </span>
          )}
        </div>

        {/* Like, Comment, Date */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={likeLoading}
            className={`flex items-center gap-1 text-sm font-medium transition-all duration-200 hover:scale-110 ${isLiked ? 'text-red-400' : 'text-white/80 hover:text-red-400'
              }`}
          >
            {isLiked ? '❤️' : '🤍'} {memory.likes}
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 text-sm font-medium text-white/80 hover:text-white transition-all duration-200"
          >
            💬 {comments.length}
          </button>

          <span className="ml-auto text-xs text-white/60">
            {new Date(memory.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>

          {/* Delete button */}
          {isOwner && (
            <button
              onClick={handleDelete}
              className="text-xs text-red-400 hover:text-red-300 transition"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Comments Section — appears on hover */}
      {showComments && (
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm p-4 flex flex-col justify-end">
          <div className="flex flex-col gap-2 max-h-48 overflow-y-auto mb-3">
            {comments.length === 0 ? (
              <p className="text-white/60 text-sm text-center">No comments yet!</p>
            ) : (
              comments.map((c, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="w-6 h-6 rounded-full bg-[#E8DDD4] flex items-center justify-center text-[#8B5E3C] font-bold text-xs flex-shrink-0">
                    {c.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-1.5 flex-1">
                    <span className="text-xs font-semibold text-[#C4956A]">{c.user?.name} </span>
                    <span className="text-sm text-white">{c.text}</span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Add Comment */}
          {user && (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#C4956A]"
              />
              <button
                type="submit"
                disabled={addingComment}
                className="bg-[#8B5E3C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#7A4F2F] disabled:opacity-50 transition"
              >
                {addingComment ? '...' : 'Post'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default MemoryCard;