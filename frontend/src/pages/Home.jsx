import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MemoryModal from '../components/MemoryModal';

const BentoCard = ({ memory, size = 'normal', onLike, likeLoading, user, onClick }) => {
  const isLiked = user && memory.likedBy?.includes(user.id);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden group cursor-pointer shadow-md hover:shadow-xl transition-all duration-300 ${
        size === 'large' ? 'row-span-2' :
        size === 'wide' ? 'col-span-2' :
        size === 'big' ? 'col-span-2 row-span-2' : ''
      }`}
      onClick={onClick}
    >
      <img
        src={memory.imageUrl}
        alt={memory.caption}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        style={{ minHeight: size === 'big' ? '400px' : size === 'large' ? '300px' : '200px' }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-[#C4956A] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {memory.user?.name?.charAt(0).toUpperCase()}
          </div>
          <span className="text-white/70 text-xs">{memory.user?.name}</span>
        </div>
        <p className={`text-white font-semibold leading-snug mb-2 ${size === 'big' ? 'text-xl' : 'text-sm'}`}>
          {memory.caption}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          {memory.location && (
            <span className="text-xs text-white/70 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
              📍 {memory.location}
            </span>
          )}
          {memory.activityName && size !== 'normal' && (
            <span className="text-xs text-white/70 bg-white/15 backdrop-blur-sm px-2 py-0.5 rounded-full">
              🏃 {memory.activityName}
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onLike(memory._id); }}
            disabled={likeLoading === memory._id}
            className={`ml-auto flex items-center gap-1 text-xs transition-all hover:scale-110 ${
              isLiked ? 'text-red-400' : 'text-white/70 hover:text-red-400'
            }`}
          >
            {isLiked ? '❤️' : '🤍'} {memory.likes}
          </button>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const [likeLoading, setLikeLoading] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/memories');
      setMemories(res.data.memories);
    } catch (error) {
      toast.error('Failed to fetch memories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!search.trim()) return fetchMemories();
    setSearching(true);
    try {
      const res = await axiosInstance.get(`/api/memories/search?query=${search}`);
      setMemories(res.data.memories);
    } catch (error) {
      toast.error('Search failed');
    } finally {
      setSearching(false);
    }
  };

  const handleLike = async (memoryId) => {
    if (!user) return toast.error('Please login to like!');
    setLikeLoading(memoryId);
    try {
      const res = await axiosInstance.put(`/api/memories/${memoryId}/like`);
      setMemories(memories.map(m =>
        m._id === memoryId ? { ...m, likes: res.data.likes } : m
      ));
    } catch (error) {
      toast.error('Failed to like');
    } finally {
      setLikeLoading(null);
    }
  };

  const getBentoSize = (index) => {
    const pattern = index % 7;
    if (pattern === 0) return 'big';
    if (pattern === 3) return 'large';
    if (pattern === 5) return 'wide';
    return 'normal';
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-[#8B5E3C] text-xl font-medium animate-pulse">
        Loading memories...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2]">

      {/* Search + Post */}
      <div className="px-8 pt-6 pb-4 flex items-center gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-lg">
          <input
            type="text"
            placeholder="Search by location, activity, caption..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 border border-[#E8DDD4] rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] bg-white text-[#2C1810] placeholder-[#C4A882] text-sm transition-all"
          />
          <button
            type="submit"
            disabled={searching}
            className="bg-[#8B5E3C] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#7A4F2F] disabled:opacity-50 transition text-sm"
          >
            {searching ? '...' : 'Search'}
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); fetchMemories(); }}
              className="text-[#8C7B6B] hover:text-[#8B5E3C] px-2 text-sm"
            >✕</button>
          )}
        </form>
        <button
          onClick={() => navigate('/upload')}
          className="bg-[#8B5E3C] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#7A4F2F] transition text-sm whitespace-nowrap"
        >
          + Post Memory
        </button>
      </div>

      {/* Bento Grid */}
      <div className="px-8 pb-10">
        {memories.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-6xl mb-4">📭</p>
            <p className="text-[#2C1810] text-xl font-semibold">No memories found</p>
            <p className="text-[#8C7B6B] mt-2">Be the first to share a memory!</p>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-4 auto-rows-[200px]">
            {memories.map((memory, index) => (
              <BentoCard
                key={memory._id}
                memory={memory}
                size={getBentoSize(index)}
                onLike={handleLike}
                likeLoading={likeLoading}
                user={user}
                onClick={() => setSelectedMemory(memory)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedMemory && (
        <MemoryModal
          memory={selectedMemory}
          onClose={() => setSelectedMemory(null)}
          onLike={(id, likes) => {
            setMemories(memories.map(m => m._id === id ? { ...m, likes } : m));
            setSelectedMemory(prev => ({ ...prev, likes }));
          }}
          onDelete={(id) => {
            setMemories(memories.filter(m => m._id !== id));
            setSelectedMemory(null);
          }}
        />
      )}
    </div>
  );
};

export default Home;