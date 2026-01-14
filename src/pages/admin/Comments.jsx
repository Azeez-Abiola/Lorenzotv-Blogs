import { useEffect, useState, useCallback } from "react";
import useFetch from "../../hooks/useFetch";
import { AiOutlineMessage, AiOutlineCheck, AiOutlineClose, AiOutlineEllipsis, AiOutlineUser } from "react-icons/ai";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

const Comments = () => {
    const [comments, setComments] = useState([]);
    const { fetchRequest, loading } = useFetch();

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

            {loading ? (
                <div className="flex justify-center items-center h-64"><LoadingSpinner /></div>
            ) : (
                <div className="bg-white dark:bg-[#0A0A0A] rounded-lg border border-gray-200/80 dark:border-white/10 overflow-hidden shadow-sm transition-colors">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-500 dark:text-gray-400 text-left border-b border-gray-200/80 dark:border-white/10 uppercase tracking-wider bg-gray-50 dark:bg-white/[0.02]">
                                    <th className="py-4 px-6">Author</th>
                                    <th className="py-4 px-6">Comment</th>
                                    <th className="py-4 px-6">On Article</th>
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
                                                        comment.profiles?.username?.[0] || 'G'
                                                    )}
                                                </div>
                                                <p className="text-[13px] font-semibold text-gray-800 dark:text-gray-200">{comment.profiles?.username || "Guest User"}</p>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 max-w-[280px]">
                                            <p className="text-[12px] text-gray-500 dark:text-gray-400 italic leading-relaxed line-clamp-2">"{comment.content}"</p>
                                        </td>
                                        <td className="py-4 px-6">
                                            <p className="text-[11px] font-medium text-gray-700 dark:text-gray-300 line-clamp-1 max-w-[180px]">{comment.blogs?.title || "Deleted Post"}</p>
                                        </td>
                                        <td className="py-4 px-6 whitespace-nowrap">
                                            <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{new Date(comment.created_at).toLocaleDateString()}</p>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end space-x-1.5">
                                                <button className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-md flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors">
                                                    <AiOutlineCheck size={16} />
                                                </button>
                                                <button className="w-8 h-8 bg-red-50 text-[#8C0202] rounded-md flex items-center justify-center hover:bg-[#8C0202] hover:text-white transition-colors">
                                                    <AiOutlineClose size={16} />
                                                </button>
                                                <button className="w-8 h-8 bg-gray-100 text-gray-500 rounded-md flex items-center justify-center hover:bg-gray-800 hover:text-white transition-colors">
                                                    <AiOutlineEllipsis size={16} />
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
        </div>
    );
};

export default Comments;
