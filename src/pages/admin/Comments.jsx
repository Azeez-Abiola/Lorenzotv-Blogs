import { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import useFetch from "../../hooks/useFetch";
import { AiOutlineMessage, AiOutlineCheck, AiOutlineClose, AiOutlineEllipsis, AiOutlineUser, AiOutlineWarning, AiOutlineQuestionCircle } from "react-icons/ai";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import { toast } from "react-toastify";

// --- Modals ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger', isLoading = false }) => {
    if (!isOpen) return null;
    const isDanger = type === 'danger';
    const Icon = isDanger ? AiOutlineWarning : AiOutlineQuestionCircle;
    const colorClass = isDanger ? 'bg-red-50 text-[#8C0202]' : 'bg-emerald-50 text-emerald-600';
    const btnClass = isDanger ? 'bg-[#8C0202] hover:bg-[#6B0101]' : 'bg-emerald-600 hover:bg-emerald-700';

    return createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-[#0A0A0A] w-full max-w-sm rounded-xl shadow-2xl border border-gray-200 dark:border-white/10 animate-scale-up overflow-hidden ring-1 ring-black/5 transition-colors">
                <div className="p-8 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 ${colorClass}`}>
                        <Icon size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-8 leading-relaxed">
                        {message}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            disabled={isLoading}
                            onClick={onClose}
                            className="h-10 rounded-lg border border-gray-200 dark:border-white/10 text-[11px] font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider hover:bg-gray-50 dark:hover:bg-white/5 transition-all bg-white dark:bg-transparent disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            disabled={isLoading}
                            onClick={onConfirm}
                            className={`h-10 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider transition-all shadow-lg flex items-center justify-center ${btnClass} disabled:opacity-50`}
                        >
                            {isLoading ? <LoadingSpinner size="sm" color="white" /> : 'Confirm'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
};

const Comments = () => {
    const [comments, setComments] = useState([]);
    const { fetchRequest, isLoading: loading } = useFetch();

    // Modal states
    const [selectedComment, setSelectedComment] = useState(null);
    const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchComments = useCallback(() => {
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/comments` }, (res) => {
            if (res.status === 'success') {
                setComments(res.data.comments || []);
            }
        });
    }, [fetchRequest]);

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    const handleApprove = () => {
        if (!selectedComment) return;
        setIsActionLoading(true);
        fetchRequest({
            url: `${import.meta.env.VITE_API_BASE_URL}/admin/comments/${selectedComment.id}`,
            method: 'PATCH',
            body: { status: 'approved' }
        }, (res) => {
            setIsActionLoading(false);
            setIsApproveModalOpen(false);
            setSelectedComment(null);
            toast.success("Comment approved!");
            fetchComments();
        });
    };

    const handleReject = () => {
        if (!selectedComment) return;
        setIsActionLoading(true);
        fetchRequest({
            url: `${import.meta.env.VITE_API_BASE_URL}/admin/comments/${selectedComment.id}`,
            method: 'DELETE'
        }, (res) => {
            setIsActionLoading(false);
            setIsDeleteModalOpen(false);
            setSelectedComment(null);
            toast.error("Comment deleted!");
            fetchComments();
        });
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Comments</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Manage user feedback and engagement</p>
                </div>
                <div className="flex items-center space-x-2 bg-white dark:bg-[#0A0A0A] px-4 py-2 rounded-md border border-gray-200/80 dark:border-white/10">
                    <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{comments.length}</span>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">Total</span>
                </div>
            </div>

            {loading && !comments.length ? (
                <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
            ) : (
                <div className="bg-white dark:bg-[#0A0A0A] rounded-lg border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-sm transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-500 dark:text-gray-400 text-left border-b border-gray-200/80 dark:border-white/10 uppercase tracking-wider bg-gray-50 dark:bg-white/[0.02]">
                                    <th className="py-4 px-6">Author</th>
                                    <th className="py-4 px-6">Comment</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6">Date</th>
                                    <th className="py-4 px-6 text-right">Moderate</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                                {comments.length > 0 ? comments.map((comment) => (
                                    <tr key={comment.id} className="group hover:bg-gray-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-9 h-9 bg-gray-100 dark:bg-white/5 rounded-md flex items-center justify-center text-gray-500 dark:text-gray-400 border border-gray-200/80 dark:border-white/10 uppercase font-bold text-[10px] shrink-0 overflow-hidden">
                                                    {comment.profiles?.avatar_url ? (
                                                        <img src={comment.profiles.avatar_url} className="w-full h-full object-cover" alt="" />
                                                    ) : (
                                                        comment.profiles?.username?.[0] || comment.author_name?.[0] || 'G'
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">{comment.profiles?.username || comment.author_name || "Guest User"}</p>
                                                    <p className="text-[10px] text-gray-400 line-clamp-1">{comment.blogs?.title}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-[280px]">
                                            <p className="text-[12px] text-gray-500 dark:text-gray-400 italic leading-relaxed line-clamp-2">"{comment.content}"</p>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${comment.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {comment.status || 'pending'}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{new Date(comment.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                {comment.status !== 'approved' && (
                                                    <button
                                                        onClick={() => { setSelectedComment(comment); setIsApproveModalOpen(true); }}
                                                        title="Approve"
                                                        className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                                                        <AiOutlineCheck size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => { setSelectedComment(comment); setIsDeleteModalOpen(true); }}
                                                    title="Disapprove/Delete"
                                                    className="w-8 h-8 bg-red-50 text-[#8C0202] rounded-md flex items-center justify-center hover:bg-[#8C0202] hover:text-white transition-colors">
                                                    <AiOutlineClose size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="5" className="py-16 text-center">
                                            <div className="flex flex-col items-center space-y-3">
                                                <div className="w-14 h-14 bg-gray-100 dark:bg-white/5 rounded-lg flex items-center justify-center text-gray-300 dark:text-gray-600"><AiOutlineMessage size={28} /></div>
                                                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">No comments found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Approval Modal */}
            <ConfirmationModal
                isOpen={isApproveModalOpen}
                onClose={() => { setIsApproveModalOpen(false); setSelectedComment(null); }}
                onConfirm={handleApprove}
                title="Approve Comment?"
                message={`Are you sure you want to approve this comment by ${selectedComment?.profiles?.username || selectedComment?.author_name || 'Guest'}? This will make it visible to everyone.`}
                type="success"
                isLoading={isActionLoading}
            />

            {/* Delete Modal */}
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => { setIsDeleteModalOpen(false); setSelectedComment(null); }}
                onConfirm={handleReject}
                title="Delete Comment?"
                message="Are you sure you want to delete this comment? This action cannot be undone."
                type="danger"
                isLoading={isActionLoading}
            />
        </div>
    );
};

export default Comments;
