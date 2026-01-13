import { HiOutlineLocationMarker, HiOutlineMail } from "react-icons/hi";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaWhatsapp,
  FaAngleDoubleUp,
  FaLinkedin,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { CiMail, CiLocationOn } from "react-icons/ci";
import logoWhite from "../../assets/logo_white.png";

const FooterLinks = ({ title, links }) => (
  <div className="flex flex-col space-y-4">
    <h5 className="text-white text-lg font-black uppercase tracking-widest">{title}</h5>
    <ul className="space-y-2">
      {links.map((link, idx) => (
        <li key={idx}>
          <Link to={link.to} className="text-gray-500 hover:text-white transition-colors text-sm font-medium">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const navigate = useNavigate();

  const scrollToTopHandler = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Founder\'s Series', to: '/founderseries' },
    { label: 'Contact Us', to: '#' }
  ];

  const categories = [
    { label: 'Technology', to: '/posts?category=Technology' },
    { label: 'Lifestyle', to: '/posts?category=Lifestyle' },
    { label: 'Education', to: '/posts?category=Education' }
  ];

  const legal = [
    { label: 'Terms of Service', to: '#' },
    { label: 'Privacy Policy', to: '#' },
    { label: 'Cookie Policy', to: '#' }
  ];

  return (
    <footer className="bg-gray-950 text-white pt-24 pb-12 px-8 overflow-hidden relative">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 mb-20">

          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-8">
            <Link to="/" className="flex items-center group">
              <img className="h-10 object-contain" src={logoWhite} alt="Lorenzo TV" />
            </Link>
            <p className="text-gray-500 text-lg leading-relaxed max-w-sm">
              Discover stories that inspire and navigate the challenges of growth through the eyes of innovators.
            </p>
            <div className="flex items-center space-x-6">
              {[FaFacebookF, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp].map((Icon, idx) => (
                <Link key={idx} className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#8C0202] hover:text-white transition-all transform hover:-translate-y-1">
                  <Icon size={18} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <FooterLinks title="Explore" links={quickLinks} />
          <FooterLinks title="Categories" links={categories} />
          <FooterLinks title="Contact" links={[
            { label: 'ahmadbene13@gmail.com', to: '#' },
            { label: 'Bariga, Lagos Nigeria', to: '#' }
          ]} />
        </div>

        {/* Newsletter / CTA */}
        <div className="border-t border-white/5 pt-16 pb-20">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="text-center lg:text-left">
              <h4 className="text-3xl md:text-4xl font-black mb-4">Join our newsletter</h4>
              <p className="text-gray-500 font-medium">Get the latest insights delivered straight to your inbox.</p>
            </div>
            <form className="w-full max-w-md flex items-center gap-3">
              <input
                type="email"
                placeholder="Email address"
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-[#8C0202] transition-all"
              />
              <button className="bg-[#8C0202] hover:bg-[#6b0202] text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-red-950">
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-[11px] font-black uppercase tracking-[0.3em] text-gray-600">
          <p>© 2026 Lorenzo TV Blog • All Rights Reserved</p>
          <div className="flex items-center space-x-8">
            {['Privacy', 'Terms', 'Cookies'].map(item => (
              <Link key={item} className="hover:text-white transition-colors">{item}</Link>
            ))}
          </div>
          <button
            onClick={scrollToTopHandler}
            className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center hover:bg-white/10 transition-all border border-white/5 group"
          >
            <FaAngleDoubleUp size={16} className="text-gray-500 group-hover:text-[#8C0202] group-hover:-translate-y-1 transition-all" />
          </button>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8C0202] opacity-[0.03] rounded-full blur-[120px] pointer-events-none"></div>
    </footer>
  );
};

export default Footer;
