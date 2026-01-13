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
  const isHomePage = location.pathname === '/';
  const { fetchRequest } = useFetch();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/categories` }, (res) => {
      if (res.status === 'success') setCategories(res.data.categories || []);
    });
  }, [fetchRequest]);

  useEffect(() => {
    if (isNavOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isNavOpen]);

  // Determine styles based on scroll state AND page location
  const isTransparent = isHomePage && !scrolled;

  const navLinkClass = ({ isActive }) =>
    `relative text-sm font-bold transition-all duration-300 flex items-center group py-2 tracking-wide uppercase
    ${isActive ? "text-[#8C0202]" : (!isTransparent ? "text-gray-700 hover:text-[#8C0202]" : "text-gray-300 hover:text-[#8C0202]")}`;

  const linkUnderline = (isActive) => (
    <span className={`absolute bottom-0 left-0 h-[2px] bg-[#8C0202] transition-all duration-300 rounded-full
      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`} />
  );

  return (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 px-8 md:px-16 
      ${!isTransparent ? "bg-white shadow-xl py-4" : "bg-transparent py-8"}`}>

      <div className="max-w-[1400px] mx-auto flex items-center justify-between">
        <Link to="/" className="z-50 flex items-center group">
          {/* Use logoWhite for dark backgrounds, but maybe we need a dark logo for white background? 
              Assuming logoWhite is visible on dark. On white background it might be invisible if it's purely white. 
              Ideally we'd switch logos. But if logo is just "LorenzoTV" text as shown in code below, the image might be an icon. 
              Line 43: logoWhite. 
              If the logo is white, and background is white... invisible.
              I will assume we stick to text coloring for now, or filter the logo. 
              Adding brightness-0 (black) for light mode if it's an image.
          */}
          <img
            className={`transition-all duration-500 object-contain ${scrolled ? "h-10 brightness-0 invert-0" : (isTransparent ? "h-14" : "h-10 brightness-0")}`}
            src={logoWhite}
            alt="Lorenzo TV"
          />
          <span className={`ml-4 font-black text-xl tracking-[0.2em] uppercase transition-colors duration-500 
            ${!isTransparent ? "text-gray-900" : "text-white"}`}>
            Lorenzo<span className="text-[#8C0202]">TV</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-14">
          <NavLink to="/" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span className={`relative ${isTransparent && !isActive ? "text-white" : ""}`}>
                  Home
                  {linkUnderline(isActive)}
                </span>
              </>
            )}
          </NavLink>
          <NavLink to="/founderseries" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span className={`relative ${isTransparent && !isActive ? "text-white" : ""}`}>
                  Founder's Series
                  {linkUnderline(isActive)}
                </span>
              </>
            )}
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            {({ isActive }) => (
              <>
                <span className={`relative ${isTransparent && !isActive ? "text-white" : ""}`}>
                  About Us
                  {linkUnderline(isActive)}
                </span>
              </>
            )}
          </NavLink>

          <div
            className="relative group cursor-pointer py-4"
            onMouseEnter={() => setIsDropdownOpen(true)}
            onMouseLeave={() => setIsDropdownOpen(false)}
          >
            <span className={`text-sm font-bold transition-colors flex items-center tracking-wide uppercase
                ${!isTransparent ? "text-gray-700" : "text-white group-hover:text-red-200"}`}>
              Categories <FaChevronDown className={`ml-2 text-[10px] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </span>

            <div className={`absolute top-full right-0 w-64 pt-4 transform transition-all duration-300 origin-top
                  ${isDropdownOpen ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}>

              <div className="bg-white shadow-[0_30px_60px_rgba(0,0,0,0.15)] rounded-2xl py-6 border border-gray-100">
                <div className="px-8 pb-3 mb-3 border-b border-gray-50">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Explore</p>
                </div>
                {categories.length > 0 ? categories.slice(0, 5).map((cat) => {
                  const categoryName = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Category');
                  return (
                    <Link
                      key={typeof cat === 'string' ? cat : cat.id}
                      to={`/posts?category=${categoryName}`}
                      className="block px-8 py-3 hover:bg-red-50 hover:text-[#8C0202] text-sm text-gray-700 transition-all font-bold group/item"
                    >
                      <span className="flex items-center justify-between">
                        {categoryName}
                        <span className="opacity-0 -translate-x-2 transition-all group-hover/item:opacity-100 group-hover/item:translate-x-0">→</span>
                      </span>
                    </Link>
                  );
                }) : (
                  <p className="px-8 py-3 text-xs text-gray-400">Loading...</p>
                )}
                <div className="mt-3 pt-4 border-t border-gray-50 px-8">
                  <Link
                    to="/posts"
                    className="block w-full py-3 bg-gray-900 text-white rounded-xl text-center text-[10px] font-black uppercase tracking-widest hover:bg-[#8C0202] transition-all shadow-lg hover:shadow-red-200"
                  >
                    Discover All
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <button className={`md:hidden text-2xl z-50 focus:outline-none p-3 rounded-2xl active:scale-95 transition-all shadow-sm
          ${!isTransparent ? "text-gray-900 bg-gray-50" : "text-white bg-white/10 backdrop-blur-md"}`}
          onClick={() => setIsNavOpen(!isNavOpen)}>
          {isNavOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-gray-900 z-40 flex flex-col items-center justify-center p-12 transition-all duration-700 md:hidden
        ${isNavOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full"}`}>
        <div className="flex flex-col items-center space-y-10 w-full">
          {['Home', 'Founder\'s Series', 'About Us'].map((item) => (
            <NavLink
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase().replace('\'', '').replace(' ', '')}`}
              className="text-4xl font-black text-white hover:text-[#8C0202] transition-all tracking-tighter"
              onClick={() => setIsNavOpen(false)}
            >
              {item}
            </NavLink>
          ))}

          <div className="w-20 h-[2px] bg-[#8C0202] my-6" />

          <div className="grid grid-cols-2 gap-4 w-full">
            {categories.length > 0 ? categories.slice(0, 6).map((cat) => {
              const categoryName = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Category');
              return (
                <Link
                  key={typeof cat === 'string' ? cat : cat.id}
                  to={`/posts?category=${categoryName}`}
                  className="px-6 py-5 bg-white/5 border border-white/10 rounded-2xl text-center text-xs font-black uppercase tracking-widest text-white active:bg-[#8C0202] transition-all"
                  onClick={() => setIsNavOpen(false)}
                >
                  {categoryName}
                </Link>
              );
            }) : <p className="text-white text-xs">Loading categories...</p>}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
