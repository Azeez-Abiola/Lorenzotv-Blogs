import { useContext } from "react";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import Pagination from "../Pagination/Pagination";
import { AppContext } from "../../store/AppContext";
import Modal from "../Modal/Modal";
import { useNavigate, Link } from "react-router-dom";
import moment from "moment";
import { AiOutlineArrowRight, AiOutlineClockCircle } from "react-icons/ai";
import { FaHeart, FaComment } from "react-icons/fa";

const PostItem = ({ post }) => {
  return (
    <Link to={`/posts/${post.id}`} className="group block mb-16 last:mb-0">
      <div className="flex flex-col md:flex-row gap-10 items-start">
        {/* Image Container */}
        <div className="w-full md:w-[45%] aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 shadow-lg shadow-black/5">
          <img
            src={post.image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-5 py-4">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-[#8C0202] uppercase tracking-[0.2em]">
              {moment(post.created_at).format('MMM D, YYYY')}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">
              {Array.isArray(post.tags) ? post.tags[0] : (post.tags || "General")}
            </span>
          </div>

          <h3 className="text-2xl md:text-3xl font-black text-gray-900 group-hover:text-[#8C0202] transition-colors leading-[1.2] tracking-tight">
            {post.title}
          </h3>

          <p className="text-gray-500 text-sm md:text-base line-clamp-2 leading-relaxed font-medium">
            {post.content}
          </p>

          <div className="pt-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                <img
                  src={`https://ui-avatars.com/api/?name=${post.author_name || 'Admin'}&background=random`}
                  alt={post.author_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-xs font-bold text-gray-900">{post.author_name || "Admin"}</span>
            </div>

            <div className="flex items-center gap-6 text-gray-400">
              <span className="flex items-center gap-1.5 text-[10px] font-bold">
                <FaHeart className="text-[#8C0202]" />
                {post.views > 1000 ? `${(post.views / 1000).toFixed(1)}k` : (post.views || 0)}
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold">
                <FaComment />
                {post.comment_count > 1000 ? `${(post.comment_count / 1000).toFixed(1)}k` : (post.comment_count || 0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

import { PostCardSkeleton } from "../Skeletons/Skeletons";

const PostItemSkeleton = () => (
  <div className="flex flex-col md:flex-row gap-10 items-start animate-pulse mb-16 last:mb-0">
    <div className="w-full md:w-[45%] aspect-[4/3] rounded-2xl bg-gray-200 shadow-lg shadow-black/5"></div>
    <div className="flex-1 space-y-5 py-4 w-full">
      <div className="flex items-center gap-4">
        <div className="h-2 w-20 bg-gray-200 rounded"></div>
        <div className="w-1 h-1 bg-gray-200 rounded-full"></div>
        <div className="h-2 w-24 bg-gray-200 rounded"></div>
      </div>
      <div className="h-8 w-full bg-gray-200 rounded-lg"></div>
      <div className="h-8 w-3/4 bg-gray-200 rounded-lg"></div>
      <div className="space-y-2 mt-4">
        <div className="h-4 w-full bg-gray-100 rounded"></div>
        <div className="h-4 w-5/6 bg-gray-100 rounded"></div>
      </div>
      <div className="pt-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gray-200"></div>
          <div className="h-3 w-20 bg-gray-200 rounded"></div>
        </div>
        <div className="flex items-center gap-6">
          <div className="h-3 w-8 bg-gray-200 rounded"></div>
          <div className="h-3 w-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  </div>
);

const AllPosts = ({
  title,
  isLoading,
  error,
  onPageChange,
  page,
  clearError,
}) => {
  const { totalPosts, postsPerPage } = useContext(AppContext);
  const navigate = useNavigate();

  function closeModal() {
    clearError();
    navigate(-1);
  }

  return error.hasError ? (
    <div className="px-6 max-w-7xl mx-auto">
      <Modal
        showModal={error.hasError}
        closeModal={closeModal}
        message={error.message}
      />
    </div>
  ) : (
    <div className="max-w-7xl mx-auto px-6">
      <div className="mb-14">
        <h2 className="text-4xl font-black text-gray-950 tracking-tighter mb-4">{title}</h2>
        <p className="text-gray-500 font-medium">Insights and stories that matter to you. Discover our latest publications.</p>
      </div>

      {isLoading ? (
        <div className="space-y-12 mb-16">
          <PostItemSkeleton />
          <PostItemSkeleton />
          <PostItemSkeleton />
        </div>
      ) : (
        <>
          {!postsPerPage.length ? (
            <div className="py-20 text-center bg-white rounded-[32px] border-2 border-dashed border-gray-100">
              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No articles found</p>
            </div>
          ) : (
            <div className="space-y-12 mb-16">
              {postsPerPage.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}

      {postsPerPage.length > 0 && (
        <div className="flex justify-center md:justify-start pt-12">
          <Pagination
            totalPosts={totalPosts}
            onPageChange={onPageChange}
            page={page}
          />
        </div>
      )}
    </div>
  );
};

export default AllPosts;
