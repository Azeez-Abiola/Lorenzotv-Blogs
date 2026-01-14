import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const title = isPublish ? "Publish Story?" : "Save Draft?";
  const message = isPublish
    ? "Are you sure you want to publish this story? It will become visible to your audience immediately."
    : "Save your current progress as a draft? You can continue editing later.";
  const buttonColor = isPublish ? "bg-[#8C0202] hover:bg-[#6B0101]" : "bg-gray-800 hover:bg-gray-900";

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
      <div className="relative bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 animate-scale-up overflow-hidden ring-1 ring-black/5 dark:ring-white/5">
        <div className="p-8 text-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${isPublish ? 'bg-red-50 dark:bg-red-500/10 text-[#8C0202]' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-400'}`}>
            <AiOutlineQuestionCircle size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 leading-relaxed">
            {message}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="h-10 rounded-lg border border-gray-200 dark:border-white/10 text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-white/5 transition-all bg-white dark:bg-transparent disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`h-10 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider transition-all shadow-lg ${buttonColor} disabled:opacity-50 flex items-center justify-center`}
            >
              {isLoading ? 'Processing...' : (isPublish ? 'Publish Now' : 'Save Draft')}
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
        className="flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest text-[#1C1D36] dark:text-white hover:text-red-500 transition-colors bg-gray-50 dark:bg-white/5 px-4 py-2 rounded-lg"
      >
        <span>{selected}</span>
        <AiOutlineDown size={12} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-[#0A0A0A] rounded-xl shadow-xl border border-gray-100 dark:border-white/10 py-2 z-50 animate-fade-in-up">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest transition-colors
                ${selected === option ? 'bg-red-50 dark:bg-red-500/10 text-[#8C0202]' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const AddPost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("Technology");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(true);

  // Confirmation state
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null); // 'draft' or 'published'

  const { fetchRequest, isLoading, error } = useFetch();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const categories = ["Technology", "Lifestyle", "Design", "Business", "Founder's Series"];

  // DRAFT PERSISTENCE: Load from localStorage on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem("draftPost");
    if (savedDraft) {
      try {
        const { title: sTitle, content: sContent, tags: sTags } = JSON.parse(savedDraft);
        if (sTitle) setTitle(sTitle);
        if (sContent) setContent(sContent);
        if (sTags) setTags(sTags);
      } catch (e) {
        console.error("Failed to parse draft", e);
      }
    }
  }, []);

  // DRAFT PERSISTENCE: Save to localStorage on change
  useEffect(() => {
    // Debounce or save on every change
    const draft = { title, content, tags };
    localStorage.setItem("draftPost", JSON.stringify(draft));
  }, [title, content, tags]);

  // Handle errors from useFetch
  useEffect(() => {
    if (error && error.hasError) {
      toast.error(error.message || "Failed to save post.");
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

  const isFormValid = title.trim().length > 0 &&
    content.replace(/(<([^>]+)>)/gi, "").trim().length > 0 &&
    (imagePreview !== "" || image !== null);

  const initiateSubmit = (status) => {
    if (!isFormValid) {
      toast.error("Please fill in all fields (Title, Content, and Image) before saving.");
      return;
    }
    setPendingAction(status);
    setIsConfirmOpen(true);
  };

  const confirmSubmit = async () => {
    if (!pendingAction) return;

    // Get token from cookie
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

    try {
      token = decodeURIComponent(token);
    } catch (e) {
      console.error("Token decoding failed", e);
    }

    // Calculate reading time
    const textContent = content.replace(/(<([^>]+)>)/gi, "");
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200) + " Min Read";

    const postData = {
      title,
      content,
      tags: [tags], // Send as array
      image_url: imagePreview || "",
      status: pendingAction,
      reading_time: readingTime
    };

    const handleResponse = (response) => {
      toast.success(pendingAction === 'draft' ? "Draft saved successfully!" : "Story published successfully!");
      // Clear draft on success
      localStorage.removeItem("draftPost");
      navigate("/admin/posts");
    };

    await fetchRequest(
      {
        url: `${import.meta.env.VITE_API_BASE_URL}/blogs`,
        method: "POST",
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

  return (
    <div className="w-full bg-white dark:bg-black flex flex-col animate-fade-in font-sans transition-colors duration-300">
      {/* Top Header */}
      <header className="py-8 flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center space-x-6">
          <button onClick={() => navigate(-1)} className="p-3 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl hover:text-red-500 hover:shadow-lg transition-all text-gray-400 dark:text-gray-500">
            <AiOutlineArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight tracking-tighter">Draft New Story</h1>
            <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">Crafting ideas into reality.</p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-white dark:bg-white/5 p-2 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm">
          <button
            onClick={() => setShowPreview(true)}
            disabled={!isFormValid}
            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2
              ${isFormValid ? 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5' : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
          >
            <AiOutlineEye size={16} />
            <span>Review</span>
          </button>
          <button
            onClick={() => initiateSubmit('draft')}
            disabled={isLoading || !isFormValid}
            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2
              ${isFormValid && !isLoading ? 'bg-gray-50 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/20' : 'bg-gray-50 dark:bg-white/5 text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
          >
            <AiOutlineSave size={16} />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => initiateSubmit('published')}
            disabled={isLoading || !isFormValid}
            className={`px-6 py-3 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-3 shadow-xl
              ${isFormValid && !isLoading ? 'bg-[#8C0202] text-white shadow-red-900/20 hover:-translate-y-0.5' : 'bg-gray-200 dark:bg-white/5 text-gray-400 dark:text-gray-600 cursor-not-allowed shadow-transparent'}`}
          >
            <AiOutlineSend size={16} />
            <span>{isLoading ? 'Publishing...' : 'Publish'}</span>
          </button>
        </div>
      </header>

      {/* Main Editor Section */}
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Left: Input Area */}
        <div className="flex-1 space-y-8">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-white/10 p-8 shadow-sm space-y-8 transition-colors">
            {/* Image Upload Area */}
            <div
              onClick={() => fileInputRef.current.click()}
              className={`relative w-full h-64 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center overflow-hidden
                        ${imagePreview ? 'border-transparent' : 'border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20 hover:bg-gray-50 dark:hover:bg-white/5'}`}
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
                  <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-xl mx-auto flex items-center justify-center text-gray-300 dark:text-gray-600 font-bold border dark:border-white/10">
                    <AiOutlineCloudUpload size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900 dark:text-white">Upload Featured Image</p>
                    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mt-1">Optimal size: 1600 x 900px</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <input
                className="w-full text-4xl md:text-5xl font-black text-[#1C1D36] dark:text-white bg-transparent border-none outline-none placeholder:text-gray-200 dark:placeholder:text-gray-700 p-0 focus:ring-0 tracking-tighter"
                placeholder="Untitled Article"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <div className="flex items-center space-x-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 dark:text-gray-600">Category:</span>
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
                placeholder="Once upon a time..."
                className="h-auto pb-10 quill-custom"
              />
            </div>
          </div>
        </div>

        {/* Right Sidebar: Meta Settings */}
        <div className="w-full xl:w-80 flex flex-col space-y-6">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-white/10 p-8 shadow-sm space-y-8 transition-colors">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-[#1C1D36] dark:text-white">Post Settings</h3>

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">SEO Description</label>
                <textarea
                  className="w-full h-32 bg-[#F0F2F5]/50 dark:bg-white/5 border-none rounded-lg p-5 text-sm font-medium text-gray-700 dark:text-gray-300 outline-none focus:bg-white dark:focus:bg-[#0A0A0A] focus:shadow-lg focus:shadow-black/5 transition-all resize-none border dark:border-white/5"
                  placeholder="Write a brief excerpt for search results..."
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-gray-500">Publishing Options</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-white/5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border dark:border-white/5">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#8C0202] focus:ring-[#8C0202] accent-[#8C0202] dark:bg-black" defaultChecked />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Allow Comments</span>
                  </label>
                  <label className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-white/5 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border dark:border-white/5">
                    <input type="checkbox" className="w-4 h-4 rounded text-[#8C0202] focus:ring-[#8C0202] accent-[#8C0202] dark:bg-black" defaultChecked />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Display Reading Time</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Overlay */}
        {showPreview && (
          <div className="fixed inset-0 bg-[#F0F2F5] dark:bg-black z-[200] overflow-y-auto p-4 lg:p-24 flex justify-center animate-fade-in transition-colors duration-300">
            <button
              onClick={() => setShowPreview(false)}
              className="fixed top-8 right-8 w-12 h-12 bg-white dark:bg-[#0A0A0A] text-gray-900 dark:text-white rounded-full flex items-center justify-center shadow-2xl border dark:border-white/10 hover:scale-110 transition-transform z-[210]"
            >
              <AiOutlineClose size={20} />
            </button>

            <div className="max-w-4xl w-full bg-white dark:bg-[#0A0A0A] rounded-2xl shadow-2xl p-8 lg:p-24 space-y-12 overflow-hidden min-h-screen border dark:border-white/10 transition-colors">
              {imagePreview && (
                <img src={imagePreview} className="w-full aspect-video object-cover rounded-xl shadow-2xl" alt="" />
              )}
              <div className="space-y-6">
                <h1 className="text-4xl lg:text-6xl font-black text-[#1C1D36] dark:text-white tracking-tighter leading-tight lg:leading-none">{title || "Your Epic Story"}</h1>
                <div className="flex items-center space-x-4">
                  <span className="px-4 py-2 bg-[#FFD770] rounded-lg text-[10px] font-black uppercase tracking-widest text-[#1C1D36]">{tags}</span>
                  <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 uppercase tracking-widest">5 min read</span>
                </div>
              </div>
              <div
                className="prose prose-xl dark:prose-invert max-w-none text-gray-800 dark:text-gray-200 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: content || "<p className='text-gray-300 dark:text-gray-700 text-center py-20 italic'>Your content will appear here...</p>" }}
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
            color: inherit;
            line-height: 1.8;
            padding: 0;
        }
        .dark .quill-custom .ql-editor.ql-blank::before {
            color: #4b5563;
        }
        .quill-custom .ql-toolbar.ql-snow {
            border: none;
            background: transparent;
            position: sticky;
            top: 0;
            z-index: 10;
            padding: 10px 0;
            border-bottom: 2px solid #f3f4f6;
            margin-bottom: 40px;
            transition: all 0.3s;
        }
        .dark .quill-custom .ql-toolbar.ql-snow {
            border-bottom-color: rgba(255,255,255,0.05);
            background: #0A0A0A;
        }
        .dark .ql-snow .ql-stroke {
            stroke: #9ca3af;
        }
        .dark .ql-snow .ql-fill {
            fill: #9ca3af;
        }
        .dark .ql-snow .ql-picker {
            color: #9ca3af;
        }
        .quill-custom .ql-container.ql-snow {
            border: none;
        }
      `}</style>
      </div>
    </div>
  );
};

export default AddPost;
