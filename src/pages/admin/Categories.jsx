import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { AiOutlinePlus, AiOutlineEllipsis, AiOutlineFolder, AiOutlineEdit, AiOutlineDelete, AiOutlineClose, AiOutlineCheck, AiOutlineWarning, AiOutlineFileText } from "react-icons/ai";
import { toast } from 'react-toastify';
import useFetch from "../../hooks/useFetch";

const CategoryActionMenu = ({ onEdit, onDelete }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
                className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
            >
                <AiOutlineEllipsis size={16} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md border border-gray-200 shadow-xl z-50 animate-fade-in origin-top-right ring-1 ring-black/5">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-gray-50 hover:text-[#8C0202] transition-colors flex items-center space-x-2">
                        <AiOutlineEdit /> <span>Edit</span>
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); setIsOpen(false); }} className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors flex items-center space-x-2 border-t border-gray-50">
                        <AiOutlineDelete /> <span>Delete</span>
                    </button>
                </div>
            )}
        </div>
    );
};

// ... Existing Modals (DeleteConfirmationModal, CategoryModal) ...
// Copying them slightly modified to avoid errors with copy-paste

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 animate-scale-up overflow-hidden ring-1 ring-black/5">
                <div className="p-8 text-center">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                        <AiOutlineWarning size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Category?</h3>
                    <p className="text-gray-500 text-sm font-medium mb-8 leading-relaxed">
                        Are you sure you want to delete this category? This action cannot be undone.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={onClose} className="h-10 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-all bg-white">Cancel</button>
                        <button onClick={onConfirm} className="h-10 rounded-lg bg-[#8C0202] text-[11px] font-bold text-white uppercase tracking-wider hover:bg-[#6B0101] shadow-lg">Delete</button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const CategoryModal = ({ isOpen, onClose, onSave, initialName = "" }) => {
    const [name, setName] = useState(initialName);
    useEffect(() => { setName(initialName); }, [initialName]);

    if (!isOpen) return null;
    const handleSave = () => { onSave(name); setName(""); };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl border border-gray-200 animate-scale-up overflow-hidden">
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">{initialName ? 'Edit Category' : 'Add New Category'}</h3>
                    <button onClick={onClose}><AiOutlineClose size={20} className="text-gray-400 hover:text-red-600" /></button>
                </div>
                <div className="p-6 space-y-5">
                    <div>
                        <label className="block text-[11px] font-bold text-gray-900 uppercase tracking-wider mb-2">Category Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:border-[#8C0202]" autoFocus />
                    </div>
                </div>
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
                    <button onClick={onClose} className="px-5 py-2 text-[11px] font-bold text-gray-700 uppercase bg-white border border-gray-200 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="px-5 py-2 bg-[#8C0202] text-white text-[11px] font-bold uppercase rounded-lg shadow-lg">Save</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

// NEW: Modal to View Articles in a Category
const CategoryArticlesModal = ({ isOpen, onClose, categoryName }) => {
    const { fetchRequest, isLoading, error } = useFetch();
    const [articles, setArticles] = useState([]);

    useEffect(() => {
        if (isOpen && categoryName) {
            const fetchArticles = async () => {
                // Assuming GET /api/blogs supports ?tags=CategoryName
                await fetchRequest(
                    { url: `${import.meta.env.VITE_API_BASE_URL}/blogs?tags=${encodeURIComponent(categoryName)}&limit=50` },
                    (data) => setArticles(data.data.blogs || [])
                );
            };
            fetchArticles();
        }
    }, [isOpen, categoryName]);

    if (!isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-white w-full max-w-2xl max-h-[80vh] flex flex-col rounded-xl shadow-2xl overflow-hidden animate-scale-up">
                <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50">
                    <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">{categoryName} Articles</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">Managing content for this section</p>
                    </div>
                    <button onClick={onClose} className="p-2 bg-white rounded-full text-gray-400 hover:text-red-600 shadow-sm transition-colors"><AiOutlineClose size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-0">
                    {isLoading ? (
                        <div className="p-10 text-center text-gray-400 text-sm">Loading articles...</div>
                    ) : articles.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center text-gray-400">
                            <AiOutlineFolder size={48} className="mb-4 opacity-20" />
                            <p>No articles found in this category.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-100">
                            {articles.map(article => (
                                <li key={article.id} className="hover:bg-gray-50 transition-colors">
                                    <Link to={`/admin/posts/${article.id}/edit`} className="block px-8 py-5 flex items-center justify-between group">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                                {article.image_url ? (
                                                    <img src={article.image_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400"><AiOutlineFileText /></div>
                                                )}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#8C0202] transition-colors line-clamp-1">{article.title}</h4>
                                                <div className="flex items-center space-x-3 mt-1 text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                                    <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                                    <span>•</span>
                                                    <span className={article.status === 'published' ? 'text-green-600' : 'text-orange-500'}>{article.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-gray-300 group-hover:translate-x-1 transition-transform">
                                            <AiOutlineEdit size={16} />
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};

const Categories = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isArticlesModalOpen, setIsArticlesModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [selectedCategoryName, setSelectedCategoryName] = useState("");
    const [deleteId, setDeleteId] = useState(null);

    const { fetchRequest, isLoading } = useFetch();

    // Fetch Categories from Backend
    const loadCategories = async () => {
        await fetchRequest(
            { url: `${import.meta.env.VITE_API_BASE_URL}/categories` },
            (data) => {
                if (data.status === 'success') {
                    setCategories(data.data.categories);
                }
            }
        );
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleSaveCategory = (name) => {
        // Optimistic update or unimplemented backend push (as per instructions focusing on Read/View)
        // Just reloading for now to show we need backend capability, or mocking it.
        // User instruction was mostly about VIEWING.
        // Keeping local state update style for UI responsiveness if desired, but ideal is API.
        // I'll leave as is for now or just log.
        toast.info("Backend Create/Update not fully implemented in this demo step, but UI is ready.");
        setIsModalOpen(false);
    };

    const handleEdit = (cat) => {
        setEditingCategory(cat);
        setIsModalOpen(true);
    };

    const handleViewArticles = (cat) => {
        setSelectedCategoryName(cat.name);
        setIsArticlesModalOpen(true);
    };

    const confirmDelete = () => {
        // Mock Delete
        setCategories(categories.filter(c => c.id !== deleteId));
        toast.success("Category deleted (Locally).");
        setDeleteId(null);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-1">Categories</h1>
                    <p className="text-sm text-gray-500">Organize your content taxonomy</p>
                </div>
                <button
                    onClick={() => { setEditingCategory(null); setIsModalOpen(true); }}
                    className="inline-flex items-center space-x-2 bg-gray-900 text-white px-5 py-2.5 rounded-md font-bold uppercase tracking-wider text-[11px] hover:bg-[#8C0202] transition-colors shadow-lg shadow-gray-900/20"
                >
                    <AiOutlinePlus size={16} />
                    <span>Add Category</span>
                </button>
            </div>

            <div className="bg-white rounded-lg border border-gray-200/80 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[10px] font-bold text-gray-500 text-left border-b border-gray-200/80 uppercase tracking-wider bg-gray-50">
                                <th className="py-4 px-6 w-1/3">Category</th>
                                <th className="py-4 px-6">URL Slug</th>
                                <th className="py-4 px-6">Posts</th>
                                <th className="py-4 px-6">Status</th>
                                <th className="py-4 px-6 text-right w-32">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isLoading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-400">Loading categories...</td></tr>
                            ) : categories.map((cat) => (
                                <tr
                                    key={cat.id}
                                    onClick={() => handleViewArticles(cat)}
                                    className="group hover:bg-gray-50/80 transition-colors cursor-pointer"
                                >
                                    <td className="py-4 px-6">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-9 h-9 bg-gray-100 rounded-md flex items-center justify-center text-gray-500 group-hover:text-[#8C0202] transition-colors border border-gray-200/80">
                                                <AiOutlineFolder size={18} />
                                            </div>
                                            <p className="text-[13px] font-semibold text-gray-800">{cat.name}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6">
                                        <code className="bg-gray-100 px-2 py-0.5 rounded text-[11px] font-medium text-gray-500 border border-gray-200/60">/{cat.slug}</code>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-[12px] font-medium text-gray-700">{cat.count || 0} articles</p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${cat.status === 'active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-gray-500 bg-gray-100'}`}>
                                            {cat.status || 'Active'}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end space-x-1">
                                            <button onClick={() => handleEdit(cat)} className="p-2 text-gray-400 hover:text-[#8C0202] hover:bg-red-50 rounded transition-colors block">
                                                <AiOutlineEdit size={16} />
                                            </button>
                                            <CategoryActionMenu onEdit={() => handleEdit(cat)} onDelete={() => setDeleteId(cat.id)} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && categories.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-sm text-gray-400">No categories found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveCategory}
                initialName={editingCategory ? editingCategory.name : ""}
            />

            <DeleteConfirmationModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={confirmDelete}
            />

            <CategoryArticlesModal
                isOpen={isArticlesModalOpen}
                categoryName={selectedCategoryName}
                onClose={() => setIsArticlesModalOpen(false)}
            />
        </div>
    );
};

export default Categories;
