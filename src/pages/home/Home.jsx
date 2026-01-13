import Navigation from "../../components/Navigation/Navigation";
import AllPosts from "../../components/AllPosts";
import { useCallback, useContext, useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { AppContext } from "../../store/AppContext";
import Footer from "../../components/Footer/Footer";
import { useLocation } from "react-router-dom";

const Home = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currPage = queryParams.get("page");
  const titleQuery = queryParams.get("query");
  const categoryQuery = queryParams.get("category");

  const [page, setPage] = useState(currPage ? +currPage : 1);
  const { isLoading, error, fetchRequest: fetchPosts, clearError } = useFetch();
  const { fetchRequest: fetchCategories } = useFetch(); // Separate hook for categories
  const { updateTotalPosts, updatePostsPerPage } = useContext(AppContext);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories({ url: `${import.meta.env.VITE_API_BASE_URL}/categories` }, (res) => {
      if (res.status === 'success') setCategories(res.data.categories || []);
    });
  }, [fetchCategories]);

  const handlePageChange = function (page) {
    setPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePagePosts = useCallback(
    function (page) {
      const getUserPosts = (responseBody) => {
        updateTotalPosts(responseBody.results);
        updatePostsPerPage(responseBody.data.blogs);
      };

      const urlObj = new URL(`${import.meta.env.VITE_API_BASE_URL}/blogs`);
      urlObj.searchParams.append("limit", "9");
      urlObj.searchParams.append("page", page);

      if (titleQuery) urlObj.searchParams.append("title", titleQuery);
      if (categoryQuery && categoryQuery !== "All") urlObj.searchParams.append("tags", categoryQuery);

      fetchPosts({ url: urlObj.toString() }, getUserPosts);
    },
    [updatePostsPerPage, updateTotalPosts, fetchPosts, categoryQuery, titleQuery]
  );

  useEffect(() => {
    handlePagePosts(page);
  }, [handlePagePosts, page]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] transition-colors duration-500">
      <Navigation />

      {/* Hero Section - Dark Premium Version */}
      <section className="relative pt-48 pb-32 px-8 overflow-hidden bg-gray-950">
        <div className="max-w-7xl mx-auto text-center relative z-10 animate-fade-in">
          <div className="inline-block px-4 py-1.5 bg-[#8C0202]/10 border border-[#8C0202]/20 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.3em] rounded-lg mb-8">
            Established 2026
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-tight">
            The Art of <span className="text-[#8C0202]">Storytelling.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed opacity-0 animate-fade-in [animation-delay:200ms] [animation-fill-mode:forwards]">
            Exploring the intersection of innovation, life, and the people who make it happen.
          </p>

          <div className="mt-16 flex flex-wrap justify-center gap-4 opacity-0 animate-fade-in [animation-delay:400ms] [animation-fill-mode:forwards]">
            {categories.length > 0 ? categories.slice(0, 6).map((cat) => {
              const categoryName = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Category');
              return (
                <button
                  key={typeof cat === 'string' ? cat : cat.id}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('category', categoryName);
                    window.history.pushState({}, '', url);
                    handlePagePosts(1);
                    // Force re-render/nav? Actually calling handlePagePosts might not update URL in browser bar seamlessly if not using navigate.
                    // But pushState works.
                    // Wait, modifying state 'page' to 1 triggers useEffect?
                    // No, handlePagePosts is called but doesn't set page state (it takes page arg).
                    // I should call setPage(1).
                    setPage(1);
                  }}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border
                  ${categoryQuery === categoryName
                      ? 'bg-[#8C0202] text-white border-[#8C0202] shadow-2xl shadow-red-950'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-[#8C0202] hover:text-white backdrop-blur-md'}`}
                >
                  {categoryName}
                </button>
              );
            }) : (
              <p className="text-gray-500 text-xs">Loading topics...</p>
            )}
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('category');
                window.history.pushState({}, '', url);
                setPage(1);
              }}
              className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all duration-300 border
                  ${!categoryQuery
                  ? 'bg-[#8C0202] text-white border-[#8C0202]'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:border-[#8C0202] hover:text-white'}`}
            >
              All
            </button>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-[-10%] w-[800px] h-[800px] bg-[#8C0202] opacity-[0.05] rounded-full blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-red-900 opacity-[0.03] rounded-full blur-[150px] pointer-events-none"></div>
      </section>

      <main className="max-w-7xl mx-auto py-32">
        <AllPosts
          isLoading={isLoading}
          error={error}
          title={categoryQuery ? `${categoryQuery} Highlights` : "Latest Features"}
          page={page}
          onPageChange={handlePageChange}
          clearError={clearError}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Home;
