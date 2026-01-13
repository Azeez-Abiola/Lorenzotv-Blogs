import { useEffect, useState, useCallback } from "react";
import { Link, useOutletContext, useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import useFetch from "../../hooks/useFetch";
import { AiOutlineEdit, AiOutlineDelete, AiOutlineEye, AiOutlinePlus, AiOutlineCheckCircle, AiOutlineFileText, AiOutlineClose, AiOutlineQuestionCircle, AiOutlineWarning } from "react-icons/ai";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import moment from "moment";
import { toast } from "react-toastify";

// --- Modals ---

const PreviewPostModal = ({ isOpen, onClose, post }) => {
    if (!isOpen || !post) return null;
    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-scale-up">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-white z-10">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Preview</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Viewing content as it appears</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 transition-colors">
                        <AiOutlineClose size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-12 bg-[#F9FAFB]">
                    <article className="max-w-2xl mx-auto bg-white p-12 shadow-sm rounded-xl border border-gray-100 min-h-full">
                        {post.image_url && (
                            <img src={post.image_url} alt="" className="w-full h-64 object-cover rounded-xl mb-8" />
                        )}
                        <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight">{post.title}</h1>
                        <div className="flex items-center space-x-4 mb-8">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-[10px] font-bold uppercase tracking-wider rounded-full">{post.tags?.[0] || 'Uncategorized'}</span>
                            <span className="text-xs text-gray-400 font-medium">{moment(post.created_at).format('MMM D, YYYY')}</span>
                        </div>
                        <div className="prose prose-lg text-gray-700 leading-relaxed" dangerouslySetInnerHTML={{ __html: post.content }} />
                    </article>
                </div>
            </div>
        </div>,
        document.body
    );
};

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
    if (!isOpen) return null;
    const isDanger = type === 'danger';
    const Icon = isDanger ? AiOutlineWarning : AiOutlineQuestionCircle;
    const colorClass = isDanger ? 'bg-red-50 text-[#8C0202]' : 'bg-blue-50 text-blue-600';
    const btnClass = isDanger ? 'bg-[#8C0202] hover:bg-[#6B0101]' : 'bg-gray-900 hover:bg-gray-800';

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 animate-scale-up overflow-hidden ring-1 ring-black/5">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${colorClass}`}>
                        <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                        {message}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onClose} className="h-10 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-all bg-white">
                            Cancel
                        </button>
                        <button onClick={onConfirm} className={`h-10 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider transition-all shadow-lg ${btnClass}`}>
                            Confirm
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

// --- Main Component ---

const ManagePosts = () => {
    const [posts, setPosts] = useState([]);
    const [activeTab, setActiveTab] = useState("all");

    // Modal States
    const [previewPost, setPreviewPost] = useState(null);
    const [deleteId, setDeleteId] = useState(null);
    const [editId, setEditId] = useState(null);

    const { searchTerm } = useOutletContext();
    const { isLoading, error, fetchRequest } = useFetch();
    const navigate = useNavigate();

    const fetchAllPosts = useCallback(() => {
        const handleResponse = (response) => {
            setPosts(response.data.blogs || []);
        };
        // Explicitly asking for status=all to see drafts as admin
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/blogs?limit=100&status=all` }, handleResponse);
    }, [fetchRequest]);

    useEffect(() => {
        fetchAllPosts();
    }, [fetchAllPosts]);

    // -- Handlers --

    const handleDelete = async () => {
        if (!deleteId) return;
        const deleteResponse = () => {
            toast.success("Post deleted successfully!");
            fetchAllPosts();
            setDeleteId(null);
        };

        // Auth token logic
        const getCookie = (name) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
            return null;
        };
        let token = getCookie('jwt');
        if (token) {
            try { token = decodeURIComponent(token); } catch (e) { }
        }

        await fetchRequest({
            url: `${import.meta.env.VITE_API_BASE_URL}/blogs/${deleteId}`,
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        }, deleteResponse);
    };

    const handleEditConfirm = () => {
        if (editId) {
            navigate(`/admin/posts/${editId}/edit`);
            setEditId(null);
        }
    };

    // -- Filtering --

    const getFilteredPosts = () => {
        let filtered = posts;

        // 1. Filter by Status (Tabs)
        if (activeTab === 'published') {
            filtered = filtered.filter(post => post.status === 'published');
        } else if (activeTab === 'draft') {
            filtered = filtered.filter(post => post.status === 'draft');
        }

        // 2. Filter by Search Term
        if (searchTerm) {
            filtered = filtered.filter(post =>
                post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (Array.isArray(post.tags) ? post.tags.join(' ') : post.tags || '').toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        return filtered;
    };

    const displayPosts = getFilteredPosts();

    const tabs = [
        { id: 'all', label: 'All Posts' },
        { id: 'published', label: 'Published' },
        { id: 'draft', label: 'Drafts' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-1">Posts</h1>
                    <p className="text-sm text-gray-500">Managing {posts.length} stories</p>
                </div>
                <Link to="/admin/create-post" className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#8C0202] text-white rounded-md font-bold uppercase tracking-wider text-[11px] hover:bg-[#6B0101] transition-colors shadow-lg shadow-red-900/10">
                    <AiOutlinePlus size={16} />
                    <span>New Post</span>
                </Link>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center space-x-1 border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-3 text-[11px] font-bold uppercase tracking-wider transition-colors relative
                            ${activeTab === tab.id ? 'text-[#8C0202]' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab.label}
                        {activeTab === tab.id && (
                            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#8C0202]"></div>
                        )}
                    </button>
                ))}
            </div>

            {isLoading && !posts.length ? (
                <div className="flex justify-center py-20"><LoadingSpinner type="full" /></div>
            ) : (
                <div className="bg-white rounded-lg border border-gray-200/80 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-200/80">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Title</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Category</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500">Created</th>
                                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-gray-500 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {displayPosts.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                                            No posts found in this view.
                                        </td>
                                    </tr>
                                ) : (
                                    displayPosts.map((post) => (
                                        <tr key={post.id} className="hover:bg-gray-50/80 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className="w-10 h-10 rounded overflow-hidden bg-gray-100 border border-gray-200/80 shrink-0">
                                                        <img src={post.image_url || 'https://via.placeholder.com/150'} alt="" className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[13px] font-semibold text-gray-800 truncate max-w-[200px]">{post.title}</p>
                                                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide mt-0.5">#{post.id}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold uppercase tracking-wide rounded border border-gray-200">
                                                    {Array.isArray(post.tags) ? post.tags[0] : (post.tags || "General")}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center space-x-1.5">
                                                    {post.status === 'published' ? (
                                                        <>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                                            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wide">Published</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                                                            <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wide">Draft</span>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-[11px] font-medium text-gray-500">
                                                {moment(post.created_at).format('MMM D, YYYY h:mm A')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-end space-x-1">
                                                    <button onClick={() => setPreviewPost(post)} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors" title="Preview">
                                                        <AiOutlineEye size={16} />
                                                    </button>
                                                    <button onClick={() => setEditId(post.id)} className="p-2 text-gray-400 hover:text-emerald-500 hover:bg-emerald-50 rounded transition-colors" title="Edit">
                                                        <AiOutlineEdit size={16} />
                                                    </button>
                                                    <button onClick={() => setDeleteId(post.id)} className="p-2 text-gray-400 hover:text-[#8C0202] hover:bg-red-50 rounded transition-colors" title="Delete">
                                                        <AiOutlineDelete size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Modals */}
            <PreviewPostModal
                isOpen={!!previewPost}
                post={previewPost}
                onClose={() => setPreviewPost(null)}
            />

            <ConfirmationModal
                isOpen={!!deleteId}
                title="Delete Post?"
                message="Are you sure you want to delete this post? This action cannot be undone."
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                type="danger"
            />

            <ConfirmationModal
                isOpen={!!editId}
                title="Edit Post?"
                message="Do you want to open this post for editing?"
                onClose={() => setEditId(null)}
                onConfirm={handleEditConfirm}
                type="info"
            />
        </div>
    );
};

export default ManagePosts;
