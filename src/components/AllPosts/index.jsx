import { useContext } from "react";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import Pagination from "../Pagination/Pagination";
import { AppContext } from "../../store/AppContext";
import Modal from "../Modal/Modal";
import { useNavigate, Link } from "react-router-dom";
import moment from "moment";
import { AiOutlineArrowRight, AiOutlineClockCircle } from "react-icons/ai";

const PostItem = ({ post }) => {
  return (
    <Link to={`/posts/${post.id}`} className="group flex flex-col h-full">
      <div className="minimal-card flex-1 overflow-hidden flex flex-col">
        {/* Image Container */}
        <div className="relative h-56 overflow-hidden bg-gray-100">
          <img
            src={post.image_url || 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=2070&auto=format&fit=crop'}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-lg text-[10px] font-bold text-[#8C0202] uppercase tracking-wider shadow-sm border border-white/20">
              {Array.isArray(post.tags) ? post.tags[0] : (post.tags || "General")}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-3 space-x-3">
            <span className="flex items-center"><AiOutlineClockCircle className="mr-1 text-xs" /> {moment(post.created_at).format('MMM D, YYYY')}</span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span>{post.author_name || "Admin"}</span>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#8C0202] transition-colors leading-tight">
            {post.title}
          </h3>

          <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
            {post.content}
          </p>

          <div className="flex items-center text-[#8C0202] text-xs font-bold uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
            Read Article <AiOutlineArrowRight className="ml-2 text-sm" />
          </div>
        </div>
      </div>
    </Link>
  );
};

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
    <div className="px-6">
      <div className="mb-12 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
          <div className="w-12 h-1 bg-[#8C0202] mt-2 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-500 font-medium">
          Showing <span className="text-gray-900 font-bold">{postsPerPage.length}</span> of {totalPosts} posts
        </p>
      </div>

      {isLoading && !postsPerPage.length ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner className="" type="full" />
        </div>
      ) : (
        <>
          {!postsPerPage.length ? (
            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">No articles found in this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {postsPerPage.map((post) => (
                <PostItem key={post.id} post={post} />
              ))}
            </div>
          )}
        </>
      )}

      {postsPerPage.length > 0 && (
        <div className="flex justify-center pt-8 border-t border-gray-100">
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
