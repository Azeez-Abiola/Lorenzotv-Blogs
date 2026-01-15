import Navigation from "../../components/Navigation/Navigation";
import AllPosts from "../../components/AllPosts";
import { useCallback, useContext, useEffect, useState } from "react";
import useFetch from "../../hooks/useFetch";
import { AppContext } from "../../store/AppContext";
import Footer from "../../components/Footer/Footer";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaSearch, FaStar, FaApple, FaGooglePlay, FaTwitter, FaInstagram, FaLinkedin, FaFacebook, FaEnvelope } from "react-icons/fa";
import moment from "moment";
import ScrollReveal from "../../components/ScrollReveal/ScrollReveal";
import adminMobile from "../../assets/admin_mobile.png";

const Sidebar = ({ categories, categoryQuery, onCategoryClick }) => {
  const { setShowNewsletterModal } = useContext(AppContext);

  return (
    <aside className="space-y-12">
      {/* Recommended Topics */}
      <ScrollReveal direction="right" delay={100}>
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
          <h4 className="text-lg font-black text-gray-900 mb-6 tracking-tight">Recommended Topics</h4>
          <div className="space-y-4">
            {categories.slice(0, 6).map((cat) => {
              const name = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Category');
              return (
                <button
                  key={typeof cat === 'string' ? cat : cat.id}
                  onClick={() => onCategoryClick(name)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all border group
                  ${categoryQuery === name ? 'bg-[#8C0202] text-white border-[#8C0202]' : 'bg-gray-50 text-gray-600 border-transparent hover:border-[#8C0202]/20'}`}
                >
                  <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-3">
                    <span className="opacity-40">#</span> {name}
                  </span>
                  <span className={`text-[10px] font-black ${categoryQuery === name ? 'text-white/60' : 'text-gray-400'}`}>
                    {cat.count !== undefined ? `${cat.count} articles` : `${Math.floor(Math.random() * 200) + 50} articles`}
                  </span>
                </button>
              );
            })}
          </div>
          <button className="mt-6 text-[#8C0202] text-[10px] font-black uppercase tracking-[0.2em] hover:underline">See more topics</button>
        </div>
      </ScrollReveal>

      {/* Newsletter */}
      <ScrollReveal direction="right" delay={200}>
        <div className="bg-gray-950 rounded-2xl p-10 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="w-12 h-12 bg-[#8C0202] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-red-950/40">
              <FaEnvelope className="text-white text-xl" />
            </div>
            <h4 className="text-2xl font-black text-white mb-4 tracking-tight">Subscribe to Our Newsletter</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium">Get the latest insights, stories, and updates delivered straight to your inbox weekly.</p>
            <button
              onClick={() => setShowNewsletterModal(true)}
              className="w-full py-4 bg-[#8C0202] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-[#6b0202] transition-all hover:-translate-y-1 shadow-xl shadow-red-950/20 active:scale-95"
            >
              Get Started Now
            </button>
          </div>
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8C0202] opacity-20 blur-[60px] -mr-16 -mt-16 group-hover:opacity-30 transition-opacity"></div>
        </div>
      </ScrollReveal>
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

      if (titleQuery) urlObj.searchParams.append("query", titleQuery);
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
      <section className="relative h-[90vh] min-h-[700px] flex items-center justify-center overflow-hidden bg-gray-950 px-6 pt-20">
        <div className="absolute inset-0 grid-pattern opacity-[0.03]"></div>

        {/* Floating Avatars */}
        {avatars.map((av, i) => (
          <div
            key={i}
            className={`absolute ${av.anim} pointer-events-none z-0`}
            style={{
              top: av.top,
              left: av.left,
              right: av.right,
              bottom: av.bottom
            }}
          >
            <div className="w-10 h-10 md:w-16 md:h-16 rounded-full border-[3px] md:border-[6px] border-gray-950/50 backdrop-blur-sm overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <img src={av.img} className="w-full h-full object-cover" alt="" />
            </div>
          </div>
        ))}

        <div className="max-w-7xl mx-auto text-center relative z-10 animate-fade-in px-4">
          <ScrollReveal direction="bottom">
            <h1 className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tight leading-[0.95]">
              Discover Insights.<br />
              <span className="text-[#8C0202]">Fuel Your Curiosity</span>
            </h1>
            <p className="text-lg md:text-2xl text-gray-400 max-w-2xl mx-auto font-medium leading-relaxed mb-16 opacity-80">
              Dive into a world of insightful articles, expert opinions, and inspiring stories.
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
          </ScrollReveal>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="posts-section" className="max-w-7xl mx-auto py-32 px-6">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Post Column */}
          <div className="lg:w-[68%]">
            {/* Filter Pills */}
            <ScrollReveal direction="bottom">
              <div className="flex flex-nowrap md:flex-wrap gap-4 mb-20 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                <button
                  onClick={() => { navigate('/'); setPage(1); }}
                  className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                    ${!categoryQuery ? 'bg-gray-950 text-white shadow-xl shadow-gray-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                >
                  All
                </button>
                {categories.slice(0, 6).map((cat, i) => {
                  const name = typeof cat === 'string' ? cat : (cat.name || cat.slug);
                  return (
                    <button
                      key={name}
                      onClick={() => { navigate(`/?category=${name}`); setPage(1); }}
                      className={`px-10 py-4 rounded-full text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap
                        ${categoryQuery === name ? 'bg-gray-950 text-white shadow-xl shadow-gray-200' : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'}`}
                    >
                      {name}
                    </button>
                  );
                })}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="bottom" delay={100}>
              <AllPosts
                isLoading={isLoading}
                error={error}
                title="Article Post"
                page={page}
                onPageChange={handlePageChange}
                clearError={clearError}
              />
            </ScrollReveal>
          </div>

          {/* Sidebar Column */}
          <div className="lg:w-[32%]">
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
      <section className="bg-white py-32 border-t border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal direction="bottom">
            <div className="bg-gray-50 rounded-[48px] p-12 md:p-24 flex flex-col lg:flex-row items-center justify-between gap-16 overflow-hidden relative border border-gray-100 shadow-sm">
              <div className="max-w-2xl relative z-10">
                <span className="text-[11px] font-black text-[#8C0202] uppercase tracking-[0.5em] mb-6 block">• Experience Our App</span>
                <h2 className="text-4xl md:text-7xl font-black text-gray-950 mb-10 tracking-tight leading-[0.95]">
                  Read Anywhere <br /> and Anytime
                </h2>
                <p className="text-gray-500 text-lg font-medium leading-relaxed mb-16 opacity-70">
                  Manage your blog, track analytics, and stay connected with our powerful mobile dashboard. Experience the future of content management.
                </p>

                <div className="flex flex-wrap gap-6">
                  <button className="flex items-center bg-gray-950 text-white px-8 py-4 rounded-2xl hover:-translate-y-2 transition-all shadow-xl shadow-black/10 active:scale-95 group">
                    <FaGooglePlay className="text-3xl mr-4 text-[#8C0202]" />
                    <div className="text-left font-black">
                      <p className="text-[9px] opacity-40 uppercase tracking-widest leading-none mb-1 text-white">Get it on</p>
                      <p className="text-lg tracking-tight">Google Play</p>
                    </div>
                  </button>
                  <button className="flex items-center bg-gray-950 text-white px-8 py-4 rounded-2xl hover:-translate-y-2 transition-all shadow-xl shadow-black/10 active:scale-95 group">
                    <FaApple className="text-3xl mr-4" />
                    <div className="text-left font-black">
                      <p className="text-[9px] opacity-40 uppercase tracking-widest leading-none mb-1 text-white">Download on</p>
                      <p className="text-lg tracking-tight">App Store</p>
                    </div>
                  </button>
                </div>
              </div>

              <div className="relative lg:w-1/2 flex justify-center perspective-[1000px]">
                <div className="w-[500px] h-[500px] bg-[#8C0202] opacity-[0.03] blur-[120px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>

                {/* iPhone Mockup */}
                <ScrollReveal direction="right" delay={300} distance="100px">
                  <div className="phone-mockup rotate-[-5deg] hover:rotate-0 transition-transform duration-700">
                    <div className="iphone-notch"></div>
                    <div className="phone-mockup-inner bg-white">
                      <img
                        src={adminMobile}
                        alt="App Dashboard"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </ScrollReveal>

                {/* Secondary Decor */}
                <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gray-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-float"></div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
