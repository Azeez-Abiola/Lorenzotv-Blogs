import Navigation from "../../components/Navigation/Navigation";
import AllPosts from "../../components/AllPosts";
import { useCallback, useContext, useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { AppContext } from "../../store/AppContext";
import Footer from "../../components/Footer/Footer";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaSearch, FaStar, FaApple, FaGooglePlay, FaTwitter, FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import moment from "moment";

const Sidebar = ({ categories, categoryQuery, onCategoryClick }) => {
  const writers = [
    { name: "Guy Hawkins", role: "Storyteller", img: "https://i.pravatar.cc/150?u=guy" },
    { name: "Cameron Williamson", role: "Contributor", img: "https://i.pravatar.cc/150?u=cam" },
    { name: "Theresa Webb", role: "Lead Editor", img: "https://i.pravatar.cc/150?u=the" },
    { name: "Esther Howard", role: "Creative Lead", img: "https://i.pravatar.cc/150?u=est" },
  ];

  return (
    <aside className="space-y-12">
      {/* Recommended Topics */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
        <h4 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Recommended Topics</h4>
        <div className="space-y-4">
          {categories.slice(0, 6).map((cat) => {
            const name = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Category');
            return (
              <button
                key={typeof cat === 'string' ? cat : cat.id}
                onClick={() => onCategoryClick(name)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all border group
                ${categoryQuery === name ? 'bg-[#8C0202] text-white border-[#8C0202]' : 'bg-gray-50 text-gray-600 border-transparent hover:border-[#8C0202]/20'}`}
              >
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                  <span className="opacity-40">#</span> {name}
                </span>
                <span className={`text-[10px] font-black ${categoryQuery === name ? 'text-white/60' : 'text-gray-400'}`}>
                  {Math.floor(Math.random() * 200) + 50} articles
                </span>
              </button>
            );
          })}
        </div>
        <button className="mt-6 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.2em] hover:underline">See more topics</button>
      </div>

      {/* Inspired Writers */}
      <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm">
        <h4 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Inspired Writer</h4>
        <div className="space-y-6">
          {writers.map((writer, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img src={writer.img} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" alt="" />
                <div>
                  <p className="text-sm font-black text-gray-900">{writer.name}</p>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{writer.role}</p>
                </div>
              </div>
              <button className="px-5 py-2 bg-gray-950 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-[#8C0202] transition-colors active:scale-95">Follow</button>
            </div>
          ))}
        </div>
        <button className="mt-8 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.2em] hover:underline">See more suggestion</button>
      </div>

      {/* Premium Membership */}
      <div className="bg-gray-950 rounded-[32px] p-10 relative overflow-hidden group">
        <div className="relative z-10">
          <div className="w-12 h-12 bg-[#8C0202] rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-red-950/40">
            <FaStar className="text-white" />
          </div>
          <h4 className="text-2xl font-black text-white mb-4 tracking-tight">Become a Premium Member</h4>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">Unlock exclusive content, insightful articles, and ad-free reading by becoming a Premium Member.</p>
          <button className="w-full py-4 bg-[#8C0202] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-[#6b0202] transition-all active:scale-95">See All Plan</button>
        </div>
        {/* Background Decor */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#8C0202] opacity-20 blur-[60px] -mr-16 -mt-16"></div>
      </div>
    </aside>
  );
};

const Home = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const currPage = queryParams.get("page");
  const titleQuery = queryParams.get("query");
  const categoryQuery = queryParams.get("category");

  const [page, setPage] = useState(currPage ? +currPage : 1);
  const [searchValue, setSearchValue] = useState(titleQuery || "");
  const { isLoading, error, fetchRequest: fetchPosts, clearError } = useFetch();
  const { fetchRequest: fetchCategories } = useFetch();
  const { updateTotalPosts, updatePostsPerPage } = useContext(AppContext);
  const [categories, setCategories] = useState([]);

  const navigate = useNavigate();

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
      urlObj.searchParams.append("limit", "10");
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/?query=${searchValue}`);
    } else {
      navigate('/');
    }
    setPage(1);
    // Smooth scroll to posts section
    const postsSection = document.getElementById('posts-section');
    if (postsSection) postsSection.scrollIntoView({ behavior: 'smooth' });
  };

  const avatars = [
    { top: '20%', left: '10%', img: 'https://i.pravatar.cc/150?u=11', anim: 'animate-float' },
    { top: '15%', right: '10%', img: 'https://i.pravatar.cc/150?u=12', anim: 'animate-float-reverse' },
    { top: '45%', left: '5%', img: 'https://i.pravatar.cc/150?u=13', anim: 'animate-float-slow' },
    { bottom: '25%', left: '15%', img: 'https://i.pravatar.cc/150?u=14', anim: 'animate-float-slower' },
    { top: '35%', right: '5%', img: 'https://i.pravatar.cc/150?u=15', anim: 'animate-float' },
    { bottom: '20%', right: '12%', img: 'https://i.pravatar.cc/150?u=16', anim: 'animate-float-reverse' },
    { bottom: '35%', left: '45%', img: 'https://i.pravatar.cc/150?u=17', anim: 'animate-float-slow' },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navigation />

      {/* Hero Section */}
      <section className="relative h-[90vh] min-h-[750px] flex items-center justify-center overflow-hidden bg-gray-950 px-6 pt-20">
        <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

        {/* Floating Avatars */}
        {avatars.map((av, i) => (
          <div
            key={i}
            className={`absolute hidden lg:block ${av.anim} pointer-events-none`}
            style={{
              top: av.top,
              left: av.left,
              right: av.right,
              bottom: av.bottom
            }}
          >
            <div className="w-16 h-16 rounded-full border-[6px] border-gray-950/50 backdrop-blur-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <img src={av.img} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        ))}

        <div className="max-w-5xl mx-auto text-center relative z-10 animate-fade-in px-4">
          <h1 className="text-5xl md:text-8xl font-black text-white mb-10 tracking-[ -0.05em] leading-[0.95]">
            Discover Insights.<br />
            <span className="text-[#8C0202]">Fuel Your Curiosity</span>
          </h1>
          <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed mb-16 opacity-80">
            Dive into a world of insightful articles, expert opinions, and inspiring stories from the brightest minds.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <input
              type="text"
              placeholder="Search Article"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-full md:px-12 px-8 md:py-8 py-6 text-white text-lg outline-none focus:bg-white/10 focus:border-[#8C0202] transition-all pr-28 backdrop-blur-xl"
            />
            <button className="absolute right-4 top-4 bottom-4 md:px-10 px-6 bg-[#8C0202] rounded-full text-white flex items-center justify-center hover:bg-[#6b0202] transition-all active:scale-95 shadow-lg shadow-red-950/40">
              <FaSearch className="md:text-xl" />
            </button>
          </form>
        </div>

        {/* Abstract decor */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[120%] h-[300px] bg-gradient-to-t from-gray-950 to-transparent z-10"></div>
      </section>

      {/* Main Content Area */}
      <main id="posts-section" className="max-w-7xl mx-auto py-32 px-6">
        <div className="flex flex-col lg:flex-row gap-20">

          {/* Post Column */}
          <div className="lg:w-[65%]">
            {/* Filter Pills */}
            <div className="flex flex-nowrap md:flex-wrap gap-4 mb-20 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
              <button
                onClick={() => { navigate('/'); setPage(1); }}
                className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                  ${!categoryQuery ? 'bg-gray-950 text-white shadow-2xl shadow-black/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
              >
                All
              </button>
              {['Technology', 'Lifestyle', 'Education', 'Business', 'Innovation'].map(pill => (
                <button
                  key={pill}
                  onClick={() => { navigate(`/?category=${pill}`); setPage(1); }}
                  className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${categoryQuery === pill ? 'bg-gray-950 text-white shadow-2xl shadow-black/20' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                >
                  {pill}
                </button>
              ))}
            </div>

            <AllPosts
              isLoading={isLoading}
              error={error}
              title="Article Post"
              page={page}
              onPageChange={handlePageChange}
              clearError={clearError}
            />
          </div>

          {/* Sidebar Column */}
          <div className="lg:w-[35%]">
            <Sidebar
              categories={categories}
              categoryQuery={categoryQuery}
              onCategoryClick={(cat) => {
                navigate(`/?category=${cat}`);
                setPage(1);
              }}
            />
          </div>

        </div>
      </main>

      {/* Download Section */}
      <section className="bg-white py-32 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-50 rounded-[80px] p-12 md:p-28 flex flex-col lg:flex-row items-center justify-between gap-24 overflow-hidden relative border border-gray-100 shadow-sm">
            <div className="max-w-2xl relative z-10">
              <span className="text-[11px] font-black text-[#8C0202] uppercase tracking-[0.5em] mb-6 block drop-shadow-sm font-black">• Download Official App</span>
              <h2 className="text-5xl md:text-8xl font-black text-gray-950 mb-10 tracking-[-0.04em] leading-[0.9]">
                Read Anywhere <br /> and Anytime
              </h2>
              <p className="text-gray-500 text-xl font-medium leading-relaxed mb-16 opacity-70">
                Experience the next generation of storytelling. Sync your bookshelf, read offline, and get early access to exclusive features.
              </p>

              <div className="flex flex-wrap gap-8">
                <button className="flex items-center bg-gray-950 text-white px-10 py-5 rounded-[24px] hover:-translate-y-2 transition-all shadow-2xl shadow-black/20 active:scale-95 group">
                  <FaGooglePlay className="text-4xl mr-5 text-[#8C0202] group-hover:scale-110 transition-transform" />
                  <div className="text-left font-black">
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">Get it on</p>
                    <p className="text-xl tracking-tight">Google Play</p>
                  </div>
                </button>
                <button className="flex items-center bg-gray-950 text-white px-10 py-5 rounded-[24px] hover:-translate-y-2 transition-all shadow-2xl shadow-black/20 active:scale-95 group">
                  <FaApple className="text-4xl mr-5 text-gray-400 group-hover:scale-110 transition-transform" />
                  <div className="text-left font-black">
                    <p className="text-[10px] opacity-40 uppercase tracking-widest">Download on</p>
                    <p className="text-xl tracking-tight">App Store</p>
                  </div>
                </button>
              </div>
            </div>

            <div className="relative lg:w-1/2 flex justify-center">
              <div className="w-[600px] h-[600px] bg-[#8C0202] opacity-[0.03] blur-[150px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
              {/* Using a high quality device mockup URL since I can't serve local file easily */}
              <img
                src="https://framerusercontent.com/images/l4U6pP3XfXvXEqZtqK0P9mG8i0.png"
                alt="App Interface"
                className="relative z-10 w-full max-w-sm transform lg:rotate-[15deg] lg:translate-x-12 hover:rotate-0 transition-transform duration-1000"
              />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
