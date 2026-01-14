import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../../store/AppContext";
import useFetch from "../../hooks/useFetch";
import {
    AiOutlineDashboard,
    AiOutlineFileText,
    AiOutlineFolder,
    AiOutlineMessage,
    AiOutlineSetting,
    AiOutlineSearch,
    AiOutlineMenu,
    AiOutlineLogout,
    AiOutlineUser,
    AiOutlinePlus,
    AiOutlineInfoCircle,
    AiOutlineBarChart
} from "react-icons/ai";
import { IoChevronDownOutline, IoChevronForwardOutline, IoNotificationsOutline, IoMoonOutline, IoSunnyOutline } from "react-icons/io5";
import logoWhite from "../../assets/logo_white.png";
import moment from "moment";

const AdminLayout = () => {
    const { updateLoggedInState, loggedInUser } = useContext(AppContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const notificationRef = useRef(null);
    const { fetchRequest } = useFetch();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem('adminDarkMode') === 'true';
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('adminDarkMode', isDarkMode);
    }, [isDarkMode]);

    // Data State
    const [categories, setCategories] = useState([]);
    const [notifications, setNotifications] = useState([]);

    // Search State
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim().length > 1) {
                fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/global-search?q=${searchTerm}` }, (res) => {
                    if (res.status === 'success') {
                        setSearchResults(res.data.results || []);
                        setShowSearchResults(true);
                    }
                });
            } else {
                setSearchResults([]);
                setShowSearchResults(false);
            }
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, fetchRequest]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsNotificationOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Fetch Sidebar Data & Notifications
    useEffect(() => {
        const loadData = async () => {
            // Fetch Categories
            await fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/categories` }, (res) => {
                if (res.status === 'success') {
                    setCategories(res.data.categories);
                }
            });

            // Fetch Notifications
            await fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/notifications` }, (res) => {
                if (res.status === 'success') {
                    setNotifications(res.data.notifications || []);
                }
            });
        };
        loadData();
    }, [fetchRequest]);


    const logoutHandler = () => {
        document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        localStorage.removeItem("loggedInUser");
        updateLoggedInState(false);
        navigate("/login");
    };

    const categoryChildren = [
        ...categories.map(cat => {
            const categoryName = typeof cat === 'string' ? cat : (cat.name || cat.slug || 'Category');
            return {
                path: `/admin/posts?category=${encodeURIComponent(categoryName)}`,
                label: categoryName
            };
        }),
        { path: "/admin/categories", label: "Add New", isButton: true }
    ];

    const newCommentsCount = notifications.filter(n => n.type === 'comment' && !n.is_read).length;

    const navItems = [
        { path: "/admin", label: "Dashboard", icon: <AiOutlineDashboard /> },
        { path: "/admin/posts", label: "Posts", icon: <AiOutlineFileText /> },
        {
            path: "/admin/analytics",
            label: "Analytics",
            icon: <AiOutlineBarChart />
        },
        {
            path: "/admin/categories",
            label: "Categories",
            icon: <AiOutlineFolder />,
            hasDropdown: true,
            children: categoryChildren
        },
        { path: "/admin/comments", label: "Comments", icon: <AiOutlineMessage />, badge: newCommentsCount > 0 ? newCommentsCount : null },
    ];

    const systemItems = [
        { path: "/admin/profile", label: "Settings", icon: <AiOutlineSetting /> },
    ];

    const closeSidebar = () => setIsSidebarOpen(false);
    const isActive = (path) => location.pathname === path;

    const unreadCount = notifications.filter(n => !n.is_read).length;

    return (
        <div className={`flex h-screen overflow-hidden font-sans ${isDarkMode ? 'dark bg-black' : 'bg-[#F5F5F7]'}`}>
            {/* Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fade-in"
                    onClick={closeSidebar}
                ></div>
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-80 bg-[#0C0C0C] flex flex-col h-full z-50 transition-transform duration-300 ease-in-out
                md:relative md:translate-x-0 border-r border-white/5
                ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}
            `}>
                <div className="p-6 border-b border-white/[0.06] flex justify-center">
                    <Link to="/" className="flex items-center group">
                        <img className="h-8 object-contain opacity-90 group-hover:opacity-100 transition-opacity" src={logoWhite} alt="Lorenzo TV" />
                    </Link>
                </div>

                <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto custom-scrollbar pt-6">
                    {navItems.map((item) => (
                        <div key={item.label}>
                            {item.hasDropdown ? (
                                <>
                                    <button
                                        onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
                                        className={`w-full flex items-center justify-between px-3 py-3 rounded-md transition-all duration-200 group
                                             ${isActive(item.path) || isCategoriesOpen
                                                ? "text-white bg-white/[0.06]"
                                                : "text-gray-500 hover:text-white hover:bg-white/[0.04]"}`}
                                    >
                                        <div className="flex items-center space-x-3">
                                            <span className={`text-lg ${isActive(item.path) || isCategoriesOpen ? 'text-[#8C0202]' : ''}`}>{item.icon}</span>
                                            <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                                        </div>
                                        <span className="text-gray-600">
                                            {isCategoriesOpen ? <IoChevronDownOutline size={14} /> : <IoChevronForwardOutline size={14} />}
                                        </span>
                                    </button>
                                    {isCategoriesOpen && (
                                        <div className="ml-9 mt-1 space-y-1 animate-slide-down border-l border-white/10 pl-2">
                                            {item.children.map((child, idx) => (
                                                <Link
                                                    key={idx}
                                                    to={child.path}
                                                    onClick={closeSidebar}
                                                    className={`flex items-center space-x-2 py-2 px-2 text-[12px] font-medium transition-colors rounded
                                                        ${child.isButton ? 'text-white bg-[#8C0202]/80 hover:bg-[#8C0202] justify-center text-center mt-2 mx-1' :
                                                            isActive(child.path) ? 'text-[#8C0202] bg-white/[0.04]' : 'text-gray-500 hover:text-white hover:bg-white/[0.02]'}`}
                                                >
                                                    {child.isButton && <AiOutlinePlus size={12} className="mr-1" />}
                                                    {child.label}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <Link
                                    to={item.path}
                                    onClick={closeSidebar}
                                    className={`flex items-center justify-between px-3 py-3 rounded-md transition-all duration-200 group
                                         ${isActive(item.path)
                                            ? "bg-[#8C0202] text-white shadow-lg shadow-red-900/10"
                                            : "text-gray-500 hover:text-white hover:bg-white/[0.04]"}`}
                                >
                                    <div className="flex items-center space-x-3">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                                    </div>
                                    {item.badge && (
                                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive(item.path) ? 'bg-white text-[#8C0202]' : 'bg-[#8C0202] text-white'}`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            )}
                        </div>
                    ))}

                    <div className="pt-8">
                        <p className="px-3 text-[10px] font-bold text-gray-600 uppercase tracking-[0.15em] mb-2">System</p>
                        {systemItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={closeSidebar}
                                className={`flex items-center space-x-3 px-3 py-3 rounded-md transition-all duration-200 group
                                     ${isActive(item.path)
                                        ? "bg-white/[0.08] text-white"
                                        : "text-gray-500 hover:text-white hover:bg-white/[0.04]"}`}
                            >
                                <span className="text-lg">{item.icon}</span>
                                <span className="text-[13px] font-medium tracking-wide">{item.label}</span>
                            </Link>
                        ))}
                    </div>
                </nav>

                <div className="p-4 border-t border-white/[0.06]">
                    <button
                        onClick={() => setIsLogoutModalOpen(true)}
                        className="flex items-center space-x-3 text-gray-500 hover:text-[#8C0202] transition-colors w-full px-3 py-2.5 uppercase text-[10px] font-bold tracking-widest rounded hover:bg-white/[0.04]"
                    >
                        <AiOutlineLogout size={16} />
                        <span>Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
                {/* Header */}
                <header className="h-[64px] px-8 flex items-center justify-between bg-white dark:bg-black border-b border-gray-200/60 dark:border-white/10 shrink-0 sticky top-0 z-30 transition-colors duration-300">
                    <div className="flex items-center space-x-4">
                        <button
                            className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            onClick={() => setIsSidebarOpen(true)}
                        >
                            <AiOutlineMenu size={20} />
                        </button>
                        <div className="hidden md:block">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">Admin Dashboard</h2>
                        </div>
                    </div>

                    <div className="flex items-center space-x-6">
                        <div className="relative hidden md:block w-64">
                            <div className="flex bg-gray-50 dark:bg-white/5 rounded-lg px-3 h-9 items-center border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                                <AiOutlineSearch className="text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    className="bg-transparent border-none outline-none text-[13px] font-medium text-gray-800 dark:text-white w-full ml-2 placeholder:text-gray-400"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onFocus={() => { if (searchTerm.length > 1 && searchResults.length > 0) setShowSearchResults(true); }}
                                    onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                                />
                            </div>

                            {/* Search Results Dropdown */}
                            {showSearchResults && searchResults.length > 0 && (
                                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 overflow-hidden animate-slide-down">
                                    <div className="p-3 bg-gray-50 border-b border-gray-100/50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Search Results</p>
                                    </div>
                                    <div className="max-h-[300px] overflow-y-auto">
                                        {searchResults.map((result) => (
                                            <button
                                                key={result.id + result.type}
                                                onClick={() => { navigate(result.link); setShowSearchResults(false); }}
                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-50 last:border-none flex items-start space-x-3 group"
                                            >
                                                <div className="mt-0.5 text-gray-400 group-hover:text-[#8C0202]">
                                                    {result.type === 'post' && <AiOutlineFileText />}
                                                    {result.type === 'comment' && <AiOutlineMessage />}
                                                    {result.type === 'user' && <AiOutlineUser />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-gray-800 line-clamp-1">{result.label}</p>
                                                    <span className="text-[10px] text-gray-400 capitalize">{result.type}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Dark Mode Toggle */}
                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-all hover:text-[#8C0202]"
                                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                            >
                                {isDarkMode ? <IoSunnyOutline size={20} /> : <IoMoonOutline size={20} />}
                            </button>

                            <div className="relative" ref={notificationRef}>
                                <button
                                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all relative
                                        ${isNotificationOpen ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white' : 'bg-white dark:bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'}`}
                                >
                                    <IoNotificationsOutline size={22} />
                                    {unreadCount > 0 && <span className="absolute top-1.5 right-2 w-2 h-2 bg-[#8C0202] rounded-full ring-2 ring-white dark:ring-black"></span>}
                                </button>

                                {isNotificationOpen && (
                                    <div className="absolute right-0 mt-3 w-96 bg-white rounded-xl border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] z-50 animate-slide-down overflow-hidden">
                                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                                            <h3 className="text-[13px] font-bold text-gray-900">Notifications</h3>
                                            <button className="text-[11px] font-semibold text-[#8C0202] hover:underline">Mark all read</button>
                                        </div>
                                        <div className="max-h-[320px] overflow-y-auto">
                                            {notifications.map((n) => (
                                                <div key={n.id} className={`p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer flex items-start space-x-3 ${!n.is_read ? 'bg-blue-50/10' : ''}`}>
                                                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 shrink-0 mt-0.5">
                                                        <AiOutlineInfoCircle size={14} />
                                                    </div>
                                                    <div className="space-y-1 min-w-0">
                                                        <p className={`text-[12px] ${!n.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'} leading-snug`}>{n.message}</p>
                                                        <p className="text-[10px] font-medium text-gray-400">{moment(n.created_at).fromNow()}</p>
                                                    </div>
                                                    {!n.is_read && <div className="w-1.5 h-1.5 bg-[#8C0202] rounded-full mt-2 shrink-0"></div>}
                                                </div>
                                            ))}
                                            {notifications.length === 0 && (
                                                <div className="p-8 text-center text-gray-400 text-xs">No notifications.</div>
                                            )}
                                        </div>
                                        <div className="p-2 border-t border-gray-50 bg-gray-50/30">
                                            <button className="w-full py-2 text-[11px] font-bold text-gray-700 hover:text-[#8C0202] transition-colors rounded hover:bg-gray-100">
                                                View All Activity
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="h-6 w-px bg-gray-200 dark:bg-white/10"></div>

                            <div className="flex items-center space-x-3 cursor-pointer group">
                                <div className="w-9 h-9 bg-[#8C0202] text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm ring-2 ring-transparent group-hover:ring-[#8C0202]/20 transition-all">
                                    {loggedInUser?.username?.[0] || 'A'}
                                </div>
                                <div className="hidden sm:block text-left">
                                    <p className="text-[12px] font-bold text-gray-900 dark:text-white leading-none mb-0.5">{loggedInUser?.username || 'Admin User'}</p>
                                    <p className="text-[10px] font-medium text-gray-400 leading-none">Super Admin</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto px-8 py-6 custom-scrollbar bg-[#FAFAFA] dark:bg-black transition-colors duration-300">
                    <Outlet context={{ searchTerm, isDarkMode }} />
                </div>
            </main>

            {/* Logout Confirmation Modal */}
            {isLogoutModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsLogoutModalOpen(false)}></div>
                    <div className="relative bg-white w-full max-w-sm rounded-lg p-8 shadow-2xl animate-scale-up border border-gray-200">
                        <div className="w-16 h-16 bg-red-50 rounded-lg flex items-center justify-center text-[#8C0202] mx-auto mb-6">
                            <AiOutlineLogout size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Sign Out?</h3>
                        <p className="text-gray-500 text-center text-sm font-medium mb-8 leading-relaxed">
                            Are you sure you want to end your session?
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setIsLogoutModalOpen(false)}
                                className="h-10 rounded-md border border-gray-200 text-[11px] font-bold text-gray-700 uppercase tracking-wider hover:bg-gray-50 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={logoutHandler}
                                className="h-10 rounded-md bg-[#8C0202] text-[11px] font-bold text-white uppercase tracking-wider hover:bg-[#6B0101] transition-all"
                            >
                                Sign Out
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminLayout;
