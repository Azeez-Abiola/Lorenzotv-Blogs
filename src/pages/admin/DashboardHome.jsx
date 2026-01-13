import { useEffect, useState, useCallback, useRef } from "react";
import useFetch from "../../hooks/useFetch";
import { AppContext } from "../../store/AppContext";
import {
    AiOutlineFileText,
    AiOutlineFolder,
    AiOutlinePicture,
    AiOutlineMessage,
    AiOutlineArrowUp,
    AiOutlineArrowDown,
    AiOutlineEllipsis,
    AiOutlineEye
} from "react-icons/ai";
import { IoChevronDownOutline } from "react-icons/io5";
import { useOutletContext, Link } from "react-router-dom";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";
import moment from "moment";

const MetricCard = ({ title, value, icon, trend, trendValue, iconBg }) => (
    <div className="bg-white p-5 rounded-lg border border-gray-200/80 flex flex-col space-y-4 hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300 group">
        <div className="flex items-center justify-between">
            <div className={`w-11 h-11 ${iconBg} rounded-md flex items-center justify-center text-[#8C0202] text-xl border border-gray-100`}>
                {icon}
            </div>
            <div className={`flex items-center space-x-1 text-[11px] font-bold ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                {trend === 'up' ? <AiOutlineArrowUp size={12} /> : <AiOutlineArrowDown size={12} />}
                <span>{trendValue}%</span>
            </div>
        </div>
        <div className="pt-1">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
        </div>
    </div>
);

const CustomDropdown = ({ options, defaultValue }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState(defaultValue);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-md px-3 py-1.5 transition-colors"
            >
                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">{selected}</span>
                <IoChevronDownOutline size={12} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white rounded-md border border-gray-200 shadow-lg z-20 animate-slide-down">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => { setSelected(option); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-[11px] font-medium transition-colors hover:bg-gray-50 ${selected === option ? 'text-[#8C0202] font-bold' : 'text-gray-600'}`}
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const PostGrowthChart = ({ data }) => {
    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200/80 flex flex-col h-full relative">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Publication Volume</h4>
                <CustomDropdown options={["6 Months", "Yearly", "All Time"]} defaultValue="6 Months" />
            </div>
            <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 bg-[#8C0202] rounded-sm"></span>
                    <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Posts</span>
                </div>
            </div>

            <div className="flex-1 relative flex items-end justify-between space-x-2 min-h-[200px]">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
                    {[50, 40, 30, 20, 10, 0].map(val => (
                        <div key={val} className="flex items-center w-full">
                            <span className="text-[10px] font-bold text-gray-400 w-5 shrink-0">{val}</span>
                            <div className="flex-1 border-t border-dashed border-gray-100 ml-2"></div>
                        </div>
                    ))}
                </div>

                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center space-y-3 group z-10">
                        <div className="relative w-full flex items-end justify-center">
                            <div
                                className={`w-7 md:w-9 rounded transition-all duration-500 relative overflow-hidden
                                    ${i % 2 !== 0 ? 'bg-[#8C0202]' : 'bg-gray-100 hover:bg-gray-200'}`}
                                style={{ height: `${(d.posts / 50) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    {d.posts} Posts
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{d.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EngagementChart = ({ data }) => {
    if (!data || data.length === 0) return (
        <div className="bg-white p-6 rounded-lg border border-gray-200/80 flex flex-col h-full items-center justify-center text-gray-400">
            <p className="text-xs font-bold uppercase tracking-widest">No Data Available</p>
        </div>
    );

    // Normalize data
    const max = Math.max(...data.map(d => d.value), 5); // Min scale 5
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 1000;
        const y = 300 - (d.value / max) * 200; // Leave 100px padding total (top/bottom)
        return `${x},${y}`;
    }).join(' L ');

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200/80 flex flex-col h-full relative">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Engagement (Comments)</h4>
                <CustomDropdown options={["Yearly"]} defaultValue="Yearly" />
            </div>
            <div className="flex items-center space-x-5 mb-6">
                <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 bg-[#8C0202] rounded-sm"></span><span className="text-[10px] font-bold text-gray-600 uppercase tracking-wide">Activity Volume</span></div>
            </div>
            <div className="flex-1 relative mt-2">
                <svg className="w-full h-full min-h-[140px]" viewBox="0 0 1000 300" preserveAspectRatio="none">
                    {/* Gradient Defs could go here */}
                    {data.length > 1 && (
                        <>
                            <path d={`M0,300 L${points} L1000,300 Z`} fill="#8C0202" fillOpacity="0.05" />
                            <path d={`M${points.split(' ')[0]} L${points}`} fill="none" stroke="#8C0202" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        </>
                    )}
                </svg>
                <div className="flex justify-between mt-3 px-0 relative z-10 w-full">
                    {data.map((d, i) => (
                        <div key={i} className="text-[10px] font-bold text-gray-400 text-center w-full flex flex-col items-center group">
                            <span className="mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-[#8C0202]">{d.value}</span>
                            <span>{d.month}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
};

const DashboardHome = () => {
    const { searchTerm } = useOutletContext();
    const [stats, setStats] = useState({
        totalArticles: 0,
        totalCategories: 0,
        totalMedia: 0,
        pendingComments: 0
    });
    const [recentPosts, setRecentPosts] = useState([]);
    const [recentComments, setRecentComments] = useState([]);
    const [growthData, setGrowthData] = useState([]);
    const [engagementData, setEngagementData] = useState([]);
    const { fetchRequest } = useFetch();

    const fetchAllData = useCallback(() => {
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/stats` }, (res) => {
            if (res.status === 'success') setStats(res.data);
        });
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/blogs?limit=4&status=All` }, (res) => {
            if (res.status === 'success') setRecentPosts(res.data.blogs || []);
        });
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/recent-comments` }, (res) => {
            if (res.status === 'success') setRecentComments(res.data || []);
        });
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/analytics/growth` }, (res) => {
            if (res.status === 'success') setGrowthData(res.data.growth || []);
        });
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/analytics/engagement` }, (res) => {
            if (res.status === 'success') setEngagementData(res.data.engagement || []);
        });
    }, [fetchRequest]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    const filteredPosts = recentPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm?.toLowerCase() || "")
    );

    return (
        <div className="space-y-6 animate-fade-in pb-8 overflow-x-hidden">
            {/* Page Header */}
            <div className="mb-2">
                <h1 className="text-xl font-bold text-gray-900 mb-1">Overview</h1>
                <p className="text-sm text-gray-500">Track your content performance and engagement</p>
            </div>

            {/* Metric Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Total Posts"
                    value={stats.totalArticles}
                    icon={<AiOutlineFileText />}
                    trend="up"
                    trendValue="40.35"
                    iconBg="bg-red-50"
                />
                <MetricCard
                    title="Categories"
                    value={stats.totalCategories}
                    icon={<AiOutlineFolder />}
                    trend="down"
                    trendValue="12.2"
                    iconBg="bg-gray-50"
                />
                <MetricCard
                    title="Media Files"
                    value={stats.totalMedia}
                    icon={<AiOutlinePicture />}
                    trend="up"
                    trendValue="22.1"
                    iconBg="bg-gray-50"
                />
                <MetricCard
                    title="Comments"
                    value={stats.pendingComments}
                    icon={<AiOutlineMessage />}
                    trend="up"
                    trendValue="10.5"
                    iconBg="bg-gray-50"
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                <PostGrowthChart data={growthData} />
                <EngagementChart data={engagementData} />
            </div>

            {/* Tables Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Latest Posts */}
                <div className="bg-white p-6 rounded-lg border border-gray-200/80 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Posts</h4>
                        <Link to="/admin/posts" className="text-[10px] font-bold text-[#8C0202] uppercase tracking-wider hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-400 text-left border-b border-gray-100 uppercase tracking-wider">
                                    <th className="pb-3 pl-6">Title</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3 pr-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filteredPosts.map((post) => (
                                    <tr key={post.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="py-4 pl-6 pr-4">
                                            <p className="text-[13px] font-semibold text-gray-800 line-clamp-1">{post.title}</p>
                                        </td>
                                        <td className="py-4">
                                            <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded
                                                ${post.status === 'published' ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50'}`}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td className="py-4 whitespace-nowrap">
                                            <p className="text-[11px] font-medium text-gray-500">{moment(post.created_at).format('MMM D')}</p>
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <button className="p-1.5 text-gray-400 hover:text-[#8C0202] hover:bg-red-50 rounded transition-colors">
                                                <AiOutlineEye size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Comments */}
                <div className="bg-white p-6 rounded-lg border border-gray-200/80 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-5">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Recent Feedback</h4>
                        <Link to="/admin/comments" className="text-[10px] font-bold text-[#8C0202] uppercase tracking-wider hover:underline">View All</Link>
                    </div>
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full">
                            <thead>
                                <tr className="text-[10px] font-bold text-gray-400 text-left border-b border-gray-100 uppercase tracking-wider">
                                    <th className="pb-3 pl-6">Author</th>
                                    <th className="pb-3">Comment</th>
                                    <th className="pb-3">Date</th>
                                    <th className="pb-3 pr-6 text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {recentComments.length > 0 ? recentComments.map((comment) => (
                                    <tr key={comment.id} className="group hover:bg-gray-50/80 transition-colors">
                                        <td className="py-4 pl-6 pr-4">
                                            <p className="text-[13px] font-semibold text-gray-800">{comment.profiles?.username?.split(' ')[0] || "Guest"}</p>
                                        </td>
                                        <td className="py-4 pr-4 max-w-[200px]">
                                            <p className="text-[12px] text-gray-500 line-clamp-1 italic">"{comment.content}"</p>
                                        </td>
                                        <td className="py-4 whitespace-nowrap">
                                            <p className="text-[11px] font-medium text-gray-500">{moment(comment.created_at).format('MMM D')}</p>
                                        </td>
                                        <td className="py-4 pr-6 text-right">
                                            <button className="px-3 py-1.5 bg-gray-900 text-white text-[9px] font-bold uppercase tracking-wider rounded hover:bg-[#8C0202] transition-colors">
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan="4" className="py-12 text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider">No feedback available</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardHome;
