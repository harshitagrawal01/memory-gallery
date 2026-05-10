import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';
import toast from 'react-hot-toast';

const Upload = () => {
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [activityName, setActivityName] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const navigate = useNavigate();

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    } else {
      toast.error('Please select an image file');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageChange(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) return toast.error('Please select an image');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('caption', caption);
      formData.append('location', location);
      formData.append('activityName', activityName);
      await axiosInstance.post('/memories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Memory uploaded successfully!');
      navigate('/');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "border border-[#E8DDD4] rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#8B5E3C] focus:border-[#8B5E3C] bg-[#FAF7F2] text-[#2C1810] placeholder-[#C4A882] w-full transition-all duration-200";

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center px-4 py-10">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-md border border-[#E8DDD4] p-8">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-[#2C1810]">Upload Memory</h1>
          <p className="text-[#8C7B6B] mt-2">Share a moment that matters</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-8">

            {/* LEFT — Image Upload/Preview */}
            <div
              className={`border-2 border-dashed rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 min-h-[350px] ${dragging
                  ? 'border-[#8B5E3C] bg-[#F0E6D9] scale-[1.01]'
                  : 'border-[#C4A882] hover:border-[#8B5E3C] hover:bg-[#F0E6D9] hover:scale-[1.01] bg-[#F5EDE4]'
                }`}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              {preview ? (
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              ) : (
                <div className="text-center p-6">
                  <p className="text-4xl mb-3">📸</p>
                  <p className="text-[#8B5E3C] font-semibold">Drag & Drop</p>
                  <p className="text-[#8C7B6B] text-sm mt-1">or click to browse</p>
                  <p className="text-[#C4A882] text-xs mt-3">JPG, PNG, WEBP up to 5MB</p>
                </div>
              )}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageChange(e.target.files[0])}
              />
            </div>

            {/* RIGHT — Form Fields */}
            <div className="flex flex-col gap-5 justify-center">

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#2C1810]">Caption *</label>
                <input
                  type="text"
                  placeholder="Describe this memory..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#2C1810]">Location <span className="text-[#8C7B6B]">(optional)</span></label>
                <input
                  type="text"
                  placeholder="Where was this?"
                  value={location}
                  onChange={e => setLocation(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#2C1810]">Activity <span className="text-[#8C7B6B]">(optional)</span></label>
                <input
                  type="text"
                  placeholder="What were you doing?"
                  value={activityName}
                  onChange={e => setActivityName(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Change image button */}
              {preview && (
                <button
                  type="button"
                  onClick={() => { setImage(null); setPreview(null); }}
                  className="text-sm text-[#8C7B6B] hover:text-[#8B5E3C] underline transition"
                >
                  Remove image
                </button>
              )}

              <button
                type="submit"
                disabled={loading}
                className="bg-[#8B5E3C] text-white py-3 rounded-lg font-semibold hover:bg-[#7A4F2F] hover:scale-[1.03] hover:shadow-md active:scale-[0.98] disabled:opacity-50 transition-all duration-200 w-full mt-2"
              >
                {loading ? 'Uploading...' : '📸 Upload Memory'}
              </button>

            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Upload;