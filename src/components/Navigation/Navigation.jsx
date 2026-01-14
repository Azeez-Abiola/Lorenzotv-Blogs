import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { FaBars, FaTimes, FaChevronDown } from "react-icons/fa";
import logoWhite from "../../assets/logo_white.png";
import useFetch from "../../hooks/useFetch";

const Navigation = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [categories, setCategories] = useState([]);

  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '/posts';
  const { fetchRequest } = useFetch();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/categories` }, (res) => {
      if (res.status === 'success') setCategories(res.data.categories || []);
    });
  }, [fetchRequest]);

  const isTransparent = isHomePage && !scrolled;

  const navLinkClass = ({ isActive }) =>
    `text-[11px] font-black uppercase tracking-[0.2em] transition-all duration-300 hover:text-[#8C0202] 
    ${isActive ? "text-[#8C0202]" : (isTransparent ? "text-white/80" : "text-gray-600")}`;

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 
      ${!isTransparent ? "bg-white/90 backdrop-blur-xl border-b border-gray-100 py-4 shadow-sm" : "bg-transparent py-6"}`}>

      <div className="max-w-[1440px] mx-auto px-6 flex items-center justify-between">

        {/* Left: Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img
            className={`transition-all duration-500 object-contain ${!isTransparent ? "h-8 brightness-0" : "h-10"}`}
            src={logoWhite}
            alt="Lorenzo TV"
          />
        </Link>

        {/* Center: Nav Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          <NavLink to="/" className={navLinkClass}>Home</NavLink>
          <NavLink to="/founderseries" className={navLinkClass}>Founder's Series</NavLink>
          <NavLink to="/about" className={navLinkClass}>About Us</NavLink>

          <div
            className="relative group"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <button className={`${navLinkClass({ isActive: false })} flex items-center gap-2`}>
              Categories <FaChevronDown className={`text-[8px] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`absolute top-full left-0 w-48 pt-4 transition-all duration-300 ${isDropdownOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'}`}>
              <div className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                {categories.slice(0, 6).map((cat) => {
                  const name = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Category');
                  return (
                    <Link
                      key={name}
                      to={`/posts?category=${name}`}
                      className="block px-6 py-3 text-[10px] font-bold text-gray-600 hover:bg-gray-50 hover:text-[#8C0202] transition-colors uppercase tracking-wider"
                    >
                      {name}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </nav>

        {/* Right: Auth */}
        <div className="flex items-center space-x-8">
          <Link
            to="/login"
            className={`text-[11px] font-black uppercase tracking-[0.2em] transition-all hover:text-[#8C0202] hidden md:block
            ${isTransparent ? "text-white" : "text-gray-900"}`}
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="md:px-8 px-5 py-3 bg-[#8C0202] text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#6b0202] transition-all shadow-lg shadow-red-950/20 active:scale-95"
          >
            Get Started
          </Link>

          {/* Mobile Toggle */}
          <button
            className={`lg:hidden text-2xl focus:outline-none transition-colors ${isTransparent ? "text-white" : "text-gray-900"}`}
            onClick={() => setIsNavOpen(!isNavOpen)}
          >
            {isNavOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`fixed inset-0 bg-gray-950 z-[100] flex flex-col items-center justify-center p-12 transition-all duration-500 lg:hidden
        ${isNavOpen ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}`}>
        <button
          className="absolute top-8 right-8 text-white text-3xl"
          onClick={() => setIsNavOpen(false)}
        >
          <FaTimes />
        </button>
        <div className="flex flex-col items-center space-y-8">
          {['Home', 'Founder\'s Series', 'About Us'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase().replace('\'', '').replace(' ', '')}`}
              className="text-3xl font-black text-white hover:text-[#8C0202] transition-all tracking-tight"
              onClick={() => setIsNavOpen(false)}
            >
              {item}
            </Link>
          ))}
          <div className="w-12 h-1 bg-[#8C0202] my-4" />
          <Link
            to="/login"
            className="text-white text-lg font-bold"
            onClick={() => setIsNavOpen(false)}
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
