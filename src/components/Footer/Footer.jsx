import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaAngleDoubleUp,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import logoWhite from "../../assets/logo_white.png";

const FooterLinks = ({ title, links }) => (
  <div className="flex flex-col space-y-6">
    <h5 className="text-white text-xs font-black uppercase tracking-[0.3em]">{title}</h5>
    <ul className="space-y-4">
      {links.map((link, idx) => (
        <li key={idx}>
          <Link to={link.to} className="text-gray-500 hover:text-[#8C0202] transition-colors text-sm font-bold tracking-tight">
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const scrollToTopHandler = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const menuLinks = [
    { label: 'Home', to: '/' },
    { label: 'About Us', to: '/about' },
    { label: 'Pricing', to: '#' }
  ];

  const categoryLinks = [
    { label: 'Programming', to: '/posts?category=Programming' },
    { label: 'Blockchain', to: '/posts?category=Blockchain' },
    { label: 'Data Science', to: '/posts?category=Data Science' },
    { label: 'User Experience', to: '/posts?category=User Experience' },
    { label: 'User Interface', to: '/posts?category=User Interface' }
  ];

  const followLinks = [
    { label: 'Instagram', to: '#' },
    { label: 'Facebook', to: '#' },
    { label: 'Medium', to: '#' },
    { label: 'LinkedIn', to: '#' },
    { label: 'Twitter', to: '#' }
  ];

  return (
    <footer className="bg-gray-950 text-white pt-32 pb-12 px-8 overflow-hidden relative border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-20 mb-32">

          {/* Brand Column */}
          <div className="lg:col-span-3 space-y-8">
            <Link to="/" className="flex items-center group">
              <img className="h-8 object-contain" src={logoWhite} alt="Lorenzo TV" />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed font-bold tracking-tight">
              Quality articles from talented writers on topics ranging from technology and culture to lifestyle.
            </p>
            <div className="flex items-center space-x-4">
              {[FaInstagram, FaFacebookF, FaTwitter].map((Icon, idx) => (
                <Link key={idx} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#8C0202] hover:text-white transition-all">
                  <Icon size={14} />
                </Link>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-2">
            <FooterLinks title="Categories" links={categoryLinks.slice(0, 5)} />
          </div>
          <div className="lg:col-span-2">
            <FooterLinks title="Menu" links={menuLinks} />
          </div>
          <div className="lg:col-span-2">
            <FooterLinks title="Follow us" links={followLinks} />
          </div>

          {/* Newsletter Column */}
          <div className="lg:col-span-3">
            <div className="bg-white/5 p-8 rounded-[32px] border border-white/5">
              <h5 className="text-white text-xs font-black uppercase tracking-[0.2em] mb-6 block">Get in Touch With Us!</h5>
              <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest mb-8 leading-relaxed">Get the latest news and information from us exclusively.</p>
              <form className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full bg-white text-gray-900 rounded-full px-6 py-4 text-xs font-bold outline-none pr-20"
                />
                <button className="absolute right-1.5 bg-gray-950 text-white px-5 py-3 rounded-full text-[9px] font-black uppercase tracking-widest hover:bg-[#8C0202] transition-colors">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/5 pt-12 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black uppercase tracking-[0.4em] text-gray-600">
          <p>© 2026 Lorenzo TV Media Blog • All Rights Reserved</p>
          <div className="flex items-center space-x-10">
            {['Terms of Service', 'Privacy Policy'].map(item => (
              <Link key={item} className="hover:text-white transition-colors">{item}</Link>
            ))}
          </div>
          <button
            onClick={scrollToTopHandler}
            className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-[#8C0202] hover:text-white transition-all border border-white/5 group"
          >
            <FaAngleDoubleUp size={14} className="group-hover:-translate-y-1 transition-all" />
          </button>
        </div>
      </div>

      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#8C0202] opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>
    </footer>
  );
};

export default Footer;
