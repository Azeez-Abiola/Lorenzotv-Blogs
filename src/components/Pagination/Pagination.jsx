import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const Pagination = (props) => {
  const { totalPosts, onPageChange, page } = props;
  const postsPerPage = import.meta.env.VITE_POSTS_PER_PAGE || 6;

  const total_pages = Math.ceil(totalPosts / postsPerPage);

  const prevHandler = () => {
    if (page === 1) return;
    onPageChange(page - 1);
  };

  const nextHandler = () => {
    if (page === total_pages) return;
    onPageChange(page + 1);
  };

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (total_pages <= maxVisible) {
      // Show all pages
      for (let i = 1; i <= total_pages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (page > 3) {
        pages.push('...');
      }

      // Show pages around current
      const start = Math.max(2, page - 1);
      const end = Math.min(total_pages - 1, page + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (page < total_pages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(total_pages)) {
        pages.push(total_pages);
      }
    }

    return pages;
  };

  if (total_pages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={prevHandler}
        disabled={page === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all
          ${page === 1
            ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
            : 'border-gray-200 text-gray-600 hover:border-[#8C0202] hover:text-[#8C0202] hover:bg-red-50 bg-white'
          }`}
      >
        <FaChevronLeft size={12} />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-1">
        {getPageNumbers().map((pageNum, index) => (
          pageNum === '...' ? (
            <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm">
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all
                ${page === pageNum
                  ? 'bg-[#8C0202] text-white shadow-lg shadow-red-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-[#8C0202] hover:text-[#8C0202]'
                }`}
            >
              {pageNum}
            </button>
          )
        ))}
      </div>

      {/* Next Button */}
      <button
        onClick={nextHandler}
        disabled={page === total_pages || total_pages < 1}
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all
          ${page === total_pages || total_pages < 1
            ? 'border-gray-100 text-gray-300 cursor-not-allowed bg-gray-50'
            : 'border-gray-200 text-gray-600 hover:border-[#8C0202] hover:text-[#8C0202] hover:bg-red-50 bg-white'
          }`}
      >
        <FaChevronRight size={12} />
      </button>

      {/* Page Info */}
      <span className="ml-4 text-xs text-gray-400 font-medium">
        Page {page} of {total_pages}
      </span>
    </div>
  );
};

export default Pagination;
