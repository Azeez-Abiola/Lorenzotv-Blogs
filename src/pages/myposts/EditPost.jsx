import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createPortal } from "react-dom";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import useFetch from "../../hooks/useFetch";
import { toast } from "react-toastify";
import {
  AiOutlineArrowLeft,
  AiOutlineCloudUpload,
  AiOutlineEye,
  AiOutlineSave,
  AiOutlineSend,
  AiOutlineClose,
  AiOutlineQuestionCircle,
  AiOutlineDown
} from "react-icons/ai";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const ActionConfirmationModal = ({ isOpen, onClose, onConfirm, actionType, isLoading }) => {
  if (!isOpen) return null;

  const isPublish = actionType === 'published';
  const title = isPublish ? "Update & Publish?" : "Save Draft Changes?";
  const message = isPublish
    ? "Are you sure you want to update and publish this story? Changes will be live immediately."
    : "Save your changes as a draft? You can continue editing later.";
  const buttonColor = isPublish ? "bg-[#8C0202] hover:bg-[#6B0101]" : "bg-gray-800 hover:bg-gray-900";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 animate-scale-up overflow-hidden ring-1 ring-black/5">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPublish ? 'bg-red-50 text-[#8C0202]' : 'bg-gray-50 text-gray-700'}`}>
            <AiOutlineQuestionCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
            {message}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="h-10 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-all bg-white disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`h-10 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider transition-all shadow-lg ${buttonColor} disabled:opacity-50 flex items-center justify-center`}
            >
              {isLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

const CustomDropdown = ({ selected, options, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#1C1D36] hover:text-red-500 transition-colors bg-gray-50 px-4 py-2 rounded-lg"
      >
        <span>{selected}</span>
        <AiOutlineDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-fade-in-up">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors
                ${selected === option ? 'bg-red-50 text-[#8C0202]' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EditPost = () => {
  const { postId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("Technology");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);
  const [originalStatus, setOriginalStatus] = useState("published");

  // Confirmation state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  const { fetchRequest, isLoading, error } = useFetch();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const categories = ["Technology", "Lifestyle", "Design", "Business", "Founder's Series"];

  // Fetch Post Logic
  const fetchPostDetails = useCallback(() => {
    const handleResponse = (response) => {
      if (response.status === 'success') {
        const post = response.data.blog;
        setTitle(post.title || "");
        setContent(post.content || "");
        // Handle tags: ensure we extract the first tag string
        const loadedTag = Array.isArray(post.tags) ? post.tags[0] : post.tags;
        setTags(loadedTag || "Technology");
        setImagePreview(post.image_url || "");
        setOriginalStatus(post.status || "published");
      }
    };
    fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/blogs/${postId}` }, handleResponse);
  }, [fetchRequest, postId]);

  useEffect(() => {
    fetchPostDetails();
  }, [fetchPostDetails]);

  // Handle errors from useFetch
  useEffect(() => {
    if (error && error.hasError) {
      toast.error(error.message || "Failed to update post.");
      setIsConfirmOpen(false);
    }
  }, [error]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = title.trim().length > 0 && content.replace(/(<([^>]+)>)/gi, "").trim().length > 0;

  const initiateSubmit = (status) => {
    if (!isFormValid) {
      toast.error("Please fill in Title and Content.");
      return;
    }
    setPendingAction(status);
    setIsConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!pendingAction) return;

    // Get token
    const getCookie = (name) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(';').shift();
      return null;
    };
    let token = getCookie('jwt');

    if (!token) {
      toast.error("Authentication expired. Please log in again.");
      return;
    }

    try { token = decodeURIComponent(token); } catch (e) { }

    // Calculate reading time
    const textContent = content.replace(/(<([^>]+)>)/gi, "");
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200) + " Min Read";

    const postData = {
      title,
      content,
      tags: [tags],
      image_url: imagePreview || "",
      status: pendingAction,
      reading_time: readingTime
    };

    const handleResponse = (response) => {
      toast.success("Story updated successfully!");
      // No navigation needed if just saving draft, but clearer to navigate back to list or stay
      navigate("/admin/posts");
    };

    await fetchRequest(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/blogs/${postId}`,
        method: "PATCH", // Using PATCH
        body: postData,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      },
      handleResponse
    );
    setIsConfirmOpen(false);
  };

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  if (!isFullScreen) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <button onClick={() => setIsFullScreen(true)} className="px-8 py-4 bg-[#1C1D36] text-white rounded-2xl font-black uppercase tracking-widest text-xs">
          Enter Full Screen Editor
        </button>
      </div>
    );
  }

  // If loading initially
  if (isLoading && !title && !content) {
    return <div className="p-20 flex justify-center"><LoadingSpinner type="full" /></div>
  }

  return (
    <div className="w-full bg-white flex flex-col animate-fade-in font-sans">
      {/* Top Header */}
      <header className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white border border-gray-100 rounded-xl hover:text-red-500 hover:shadow-lg transition-all text-gray-400">
            <AiOutlineArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">Edit Story</h1>
            <p className="text-gray-400 font-medium text-sm">Refine your masterpiece.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2
              ${isFormValid ? 'text-gray-600 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}`}
          >
            <AiOutlineEye size={16} />
            <span>Review</span>
          </button>
          <button
            onClick={() => initiateSubmit('draft')}
            disabled={isLoading || !isFormValid}
            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2
              ${isFormValid && !isLoading ? 'bg-gray-50 text-gray-900 hover:bg-gray-100' : 'bg-gray-50 text-gray-300 cursor-not-allowed'}`}
          >
            <AiOutlineSave size={16} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => initiateSubmit('published')}
            disabled={isLoading || !isFormValid}
            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-3 shadow-xl
              ${isFormValid && !isLoading ? 'bg-[#8C0202] text-white shadow-red-900/20 hover:-translate-y-0.5' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-transparent'}`}
          >
            <AiOutlineSend size={16} />
            <span>{isLoading ? 'Updating...' : 'Update & Publish'}</span>
          </button>
        </div>
      </header>

      {/* Main Editor Section */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left: Input Area */}
        <div className="flex-1 space-y-8">
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm space-y-8">
            {/* Image Upload Area */}
            <div
              onClick={() => fileInputRef.current.click()}
              className={`relative w-full h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                        ${imagePreview ? 'border-transparent' : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/*"
              />
              {imagePreview ? (
                <>
                  <img src={imagePreview} className="w-full h-full object-cover" alt="Cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white space-x-3 backdrop-blur-sm">
                    <AiOutlineCloudUpload size={24} />
                    <span className="font-black uppercase tracking-widest text-xs">Change Cover Image</span>
                  </div>
                </>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl mx-auto flex items-center justify-center text-gray-300">
                    <AiOutlineCloudUpload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Upload Featured Image</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Optimal size: 1600 x 900px</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <input
                className="w-full text-4xl md:text-5xl font-black text-[#1C1D36] border-none outline-none placeholder:text-gray-200 p-0 focus:ring-0 tracking-tighter"
                placeholder="Story Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300">Category:</span>
                <CustomDropdown
                  selected={tags}
                  options={categories}
                  onChange={setTags}
                />
              </div>
            </div>

            <div className="prose prose-lg max-w-none">
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                placeholder="Start writing..."
                className="h-auto pb-10 quill-custom"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Meta Settings */}
        <div className="w-full xl:w-80 flex flex-col space-y-6">
          <div className="bg-white rounded-xl border border-gray-100 p-8 shadow-sm space-y-8">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#1C1D36]">Post Settings</h3>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Post ID</p>
              <p className="text-sm font-black text-[#1C1D36]">#{postId}</p>
            </div>
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Current Status</p>
              <p className={`text-sm font-black uppercase tracking-wide ${originalStatus === 'published' ? 'text-emerald-600' : 'text-amber-500'}`}>{originalStatus}</p>
            </div>
          </div>
        </div>

        {/* Live Preview Overlay */}
        {showPreview && (
          <div className="fixed inset-0 bg-[#F0F2F5] z-[200] overflow-y-auto p-12 lg:p-24 flex justify-center animate-fade-in">
            <button
              onClick={() => setShowPreview(false)}
              className="fixed top-12 right-12 w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl shadow-black/10 hover:scale-110 transition-transform"
            >
              <AiOutlineClose size={24} />
            </button>

            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl p-16 lg:p-24 space-y-12 overflow-hidden min-h-screen">
              {imagePreview && (
                <img src={imagePreview} className="w-full aspect-video object-cover rounded-xl" alt="" />
              )}
              <div className="space-y-6">
                <h1 className="text-6xl font-black text-[#1C1D36] tracking-tighter leading-none">{title}</h1>
                <div className="flex items-center space-x-4">
                  <span className="px-4 py-2 bg-[#FFD770] rounded-lg text-[10px] font-black uppercase tracking-widest text-[#1C1D36]">{tags}</span>
                </div>
              </div>
              <div
                className="prose prose-xl max-w-none text-gray-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </div>
        )}

        <ActionConfirmationModal
          isOpen={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={confirmSubmit}
          actionType={pendingAction}
          isLoading={isLoading}
        />

        {/* Custom Styles for Quill */}
        <style>{`
        .quill-custom .ql-editor {
            min-height: 500px;
            font-size: 1.15rem;
            color: #1a1a1a;
            line-height: 1.8;
            padding: 0;
        }
        .quill-custom .ql-toolbar.ql-snow {
            border: none;
            background: white;
            position: sticky;
            top: 0;
            z-index: 10;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
            margin-bottom: 40px;
        }
        .quill-custom .ql-container.ql-snow {
            border: none;
        }
      `}</style>
      </div>
    </div>
  );
};

export default EditPost;
