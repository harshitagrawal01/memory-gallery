import { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import MemoryModal from '../components/MemoryModal';

const Profile = () => {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(null);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMyMemories = async () => {
      try {
        const res = await axiosInstance.get('/memories/my');
        setMemories(res.data.memories);
      } catch (error) {
        toast.error('Failed to fetch your memories');
      } finally {
        setLoading(false);
      }
    };
    fetchMyMemories();
  }, []);

  const handleDelete = (id) => {
    setMemories(memories.filter(m => m._id !== id));
  };

  const handleLike = async (memoryId) => {
    setLikeLoading(memoryId);
    try {
      const res = await axiosInstance.put(`/memories/${memoryId}/like`);
      setMemories(memories.map(m =>
        m._id === memoryId ? { ...m, likes: res.data.likes } : m
      ));
    } catch (error) {
      toast.error('Failed to like');
    } finally {
      setLikeLoading(null);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="text-[#8B5E3C] text-xl font-medium animate-pulse">
        Loading your memories...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex">

      {/* LEFT SIDEBAR — unchanged */}
      <div className="w-40 flex-shrink-0 bg-white border-r border-[#E8DDD4] sticky top-[57px] h-[calc(100vh-57px)] flex flex-col p-5">
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#C4956A] to-[#8B5E3C] flex items-center justify-center text-white font-bold text-2xl mb-3 shadow-md">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <p className="text-[#2C1810] font-bold text-sm text-center">{user?.name}</p>
          <p className="text-[#8C7B6B] text-xs text-center mt-0.5 truncate w-full">{user?.email}</p>
        </div>

        <div className="w-full h-px bg-[#E8DDD4] mb-4"></div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#FAF7F2] text-[#8B5E3C] font-semibold text-sm cursor-pointer">
            <span>📸</span> Memories
          </div>
        </div>
      </div>

      {/* MIDDLE — Instagram-style equal grid */}
      <div className="flex-1 px-6 py-6 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#2C1810]">My Memories</h2>
          <div className="w-12 h-1 bg-[#8B5E3C] rounded-full mt-1"></div>
        </div>

        {memories.length === 0 ? (
          <div className="text-center mt-20">
            <p className="text-6xl mb-4">📷</p>
            <p className="text-[#2C1810] text-xl font-semibold">No memories yet!</p>
            <p className="text-[#8C7B6B] mt-2">Upload your first memory to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5">
            {memories.map((memory) => (
              <div
                key={memory._id}
                className="relative aspect-square overflow-hidden cursor-pointer group"
                onClick={() => setSelectedMemory(memory)}
              >
                <img
                  src={memory.imageUrl}
                  alt={memory.caption}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-6">
                  <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                    <span>❤️</span> {memory.likes}
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-semibold text-sm">
                    <span>💬</span> {memory.comments.length}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT PANEL — unchanged */}
      <div className="w-52 flex-shrink-0 bg-white border-l border-[#E8DDD4] sticky top-[57px] h-[calc(100vh-57px)] p-6 overflow-y-auto">
        <p className="text-xs uppercase tracking-wider text-[#8C7B6B] font-semibold mb-4">Statistics</p>

        <div className="flex flex-col gap-2 mb-6">
          <div className="flex items-center justify-between py-2 border-b border-[#E8DDD4]">
            <span className="text-xs text-[#8C7B6B] flex items-center gap-1">📸 Memories</span>
            <span className="text-sm font-bold text-[#8B5E3C]">{memories.length}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-[#E8DDD4]">
            <span className="text-xs text-[#8C7B6B] flex items-center gap-1">❤️ Likes</span>
            <span className="text-sm font-bold text-[#8B5E3C]">
              {memories.reduce((acc, m) => acc + m.likes, 0)}
            </span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-xs text-[#8C7B6B] flex items-center gap-1">💬 Comments</span>
            <span className="text-sm font-bold text-[#8B5E3C]">
              {memories.reduce((acc, m) => acc + m.comments.length, 0)}
            </span>
          </div>
        </div>

        <div className="w-full h-px bg-[#E8DDD4] mb-4"></div>

        <p className="text-xs uppercase tracking-wider text-[#8C7B6B] font-semibold mb-3">Recent Locations</p>
        <div className="flex flex-col gap-2">
          {[...new Set(memories.filter(m => m.location).map(m => m.location))].slice(0, 4).map((loc, i) => (
            <div key={i} className="flex items-center gap-2 text-sm text-[#2C1810]">
              <span>📍</span>
              <span className="truncate text-xs">{loc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Modal — unchanged */}
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

export default Profile;
