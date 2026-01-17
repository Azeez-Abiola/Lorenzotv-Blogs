import { useEffect, useState, useCallback, useRef } from "react";
import { AiOutlineBarChart, AiOutlineArrowUp, AiOutlineUser, AiOutlineGlobal, AiOutlineFileText, AiOutlineFolder } from "react-icons/ai";
import { IoChevronDownOutline } from "react-icons/io5";
import useFetch from "../../hooks/useFetch";

const CustomDropdown = ({ options, value, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
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
                className="flex items-center space-x-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 rounded-md px-3 py-1.5 transition-colors"
            >
                <span className="text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wide">{value}</span>
                <IoChevronDownOutline size={12} className="text-gray-400" />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-1 w-32 bg-white dark:bg-[#0A0A0A] rounded-md border border-gray-200 dark:border-white/10 shadow-lg z-20 animate-slide-down">
                    <div className="py-1">
                        {options.map((option) => (
                            <button
                                key={option}
                                onClick={() => { onChange(option); setIsOpen(false); }}
                                className={`w-full text-left px-4 py-2 text-[11px] font-medium transition-colors hover:bg-gray-50 dark:hover:bg-white/5 ${value === option ? 'text-[#8C0202] font-bold' : 'text-gray-600 dark:text-gray-400'}`}
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

const PostGrowthChart = ({ data, period, onPeriodChange }) => {
    if (!data || data.length === 0) return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-96 items-center justify-center text-gray-400">
            <p>No data available</p>
        </div>
    );

    const maxVal = Math.max(...data.map(d => d.posts), 10); // Minimum scale of 10

    return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-96 relative transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Publication Volume</h4>
                <CustomDropdown
                    options={["Today", "This Week", "This Year"]}
                    value={period === 'day' ? 'Today' : period === 'week' ? 'This Week' : 'This Year'}
                    onChange={(val) => {
                        const map = { 'Today': 'day', 'This Week': 'week', 'This Year': 'year' };
                        onPeriodChange(map[val]);
                    }}
                />
            </div>

            <div className="flex-1 relative flex items-end justify-between space-x-2 min-h-[200px]">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
                    {[1, 0.75, 0.5, 0.25, 0].map(val => (
                        <div key={val} className="flex items-center w-full">
                            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-600 w-8 shrink-0">{Math.round(maxVal * val)}</span>
                            <div className="flex-1 border-t border-dashed border-gray-100 dark:border-white/5 ml-2"></div>
                        </div>
                    ))}
                </div>

                {data.map((d, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center space-y-3 group z-10">
                        <div className="relative w-full flex items-end justify-center h-full">
                            <div
                                className={`w-full max-w-[40px] rounded-t transition-all duration-500 relative overflow-hidden bg-[#8C0202]/80 hover:bg-[#8C0202]`}
                                style={{ height: `${(d.posts / maxVal) * 100}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                                    {d.posts} Posts
                                </div>
                            </div>
                        </div>
                        <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tight truncate w-full text-center">{d.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const EngagementChart = ({ data, period, onPeriodChange }) => {
    if (!data || data.length === 0) return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-96 items-center justify-center text-gray-400">
            <p className="text-xs font-bold uppercase tracking-widest">No Data Available</p>
        </div>
    );

    const max = Math.max(...data.map(d => d.value), 5);
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100; // using percentages for viewBox width (e.g. 0-100)
        const y = 100 - (d.value / max) * 100;
        return `${x} ${y}`;
    }).join(',');

    // Helper for generating polygon fill (closed loop)
    const polyPoints = `0 100, ${points}, 100 100`;

    return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-96 relative transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Engagement Volume</h4>
                <CustomDropdown
                    options={["Today", "This Week", "This Year"]}
                    value={period === 'day' ? 'Today' : period === 'week' ? 'This Week' : 'This Year'}
                    onChange={(val) => {
                        const map = { 'Today': 'day', 'This Week': 'week', 'This Year': 'year' };
                        onPeriodChange(map[val]);
                    }}
                />
            </div>

            <div className="flex-1 relative w-full overflow-hidden flex flex-col justify-end">
                <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8C0202" stopOpacity="0.2" />
                            <stop offset="100%" stopColor="#8C0202" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Area Fill */}
                    <polyline points={polyPoints} fill="url(#engagementGradient)" />
                    {/* Line Stroke */}
                    <polyline points={points} fill="none" stroke="#8C0202" strokeWidth="2" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
                </svg>

                {/* X-Axis Labels (Simplified) */}
                <div className="absolute bottom-0 left-0 right-0 flex justify-between px-2 pt-2">
                    {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => ( // Show subset of labels
                        <span key={i} className="text-[10px] font-bold text-gray-400 uppercase">{d.month}</span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const DemographicsCard = ({ data }) => {
    if (!data || data.length === 0) return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-[400px] items-center justify-center text-gray-400 shadow-sm">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <AiOutlineGlobal size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">No Demographics Data</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-[400px] transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Demographics</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Top locations by engagement</p>
                </div>
                <button className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full text-gray-400">
                    <AiOutlineGlobal size={18} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
                {data.map((item, idx) => (
                    <div key={idx} className="space-y-2 group">
                        <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                                {item.location}
                            </span>
                            <span className="font-bold text-gray-900 dark:text-white">{item.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-out ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-blue-500' : 'bg-gray-400'}`}
                                style={{ width: `${item.percentage}%` }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const DeviceBreakdown = ({ data }) => {
    if (!data || data.length === 0) return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-[400px] items-center justify-center text-gray-400 shadow-sm">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-3">
                    <AiOutlineUser size={20} />
                </div>
                <p className="text-xs font-bold uppercase tracking-widest">No Device Data</p>
            </div>
        </div>
    );

    return (
        <div className="bg-white dark:bg-[#0A0A0A] p-6 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col h-[400px] transition-colors shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wide">Device Breakdown</h4>
                    <p className="text-[11px] text-gray-500 font-medium">Usage by device type</p>
                </div>
                <button className="p-2 hover:bg-gray-50 dark:hover:bg-white/5 rounded-full text-gray-400">
                    <AiOutlineUser size={18} />
                </button>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                {data.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-md ${idx === 0 ? 'bg-red-50 text-[#8C0202]' : 'bg-gray-50 text-gray-600 dark:bg-white/5 dark:text-gray-400'}`}>
                                {item.device === 'mobile' ? <AiOutlineUser size={16} /> : <AiOutlineBarChart size={16} />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-900 dark:text-white capitalize">{item.device}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{item.count} Sessions</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${idx === 0 ? 'bg-[#8C0202]' : 'bg-gray-300'}`}
                                    style={{ width: `${item.percentage}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-white w-8 text-right">{item.percentage}%</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Analytics = () => {
    const { fetchRequest } = useFetch();
    const [growthData, setGrowthData] = useState([]);
    const [engagementData, setEngagementData] = useState([]);
    const [demographicsData, setDemographicsData] = useState([]);
    const [deviceData, setDeviceData] = useState([]);
    const [stats, setStats] = useState({
        totalArticles: 0,
        totalCategories: 0,
        totalMedia: 0,
        pendingComments: 0,
        totalComments: 0
    });

    const [growthPeriod, setGrowthPeriod] = useState('year');
    const [engagementPeriod, setEngagementPeriod] = useState('year');
    const [commentView, setCommentView] = useState('total');

    const fetchData = useCallback(() => {
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/analytics/summary?growthPeriod=${growthPeriod}&engagementPeriod=${engagementPeriod}` }, (res) => {
            if (res.status === 'success') {
                setGrowthData(res.data.growth || []);
                setEngagementData(res.data.engagement || []);
                setStats(res.data.stats || {});
                setDemographicsData(res.data.demographics || []);
                setDeviceData(res.data.devices || []);
            }
        });
    }, [fetchRequest, growthPeriod, engagementPeriod]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const metrics = [
        { title: "Total Articles", value: stats.totalArticles, growth: "+12%", icon: <AiOutlineFileText className="text-[#8C0202]" />, iconBg: "bg-red-50" },
        { title: "Categories Active", value: stats.totalCategories, growth: "+0%", icon: <AiOutlineFolder className="text-[#8C0202]" />, iconBg: "bg-orange-50" },
    ];

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Analytics</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Real-time content performance</p>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-[#0A0A0A] p-5 rounded-lg border border-gray-200/80 dark:border-white/10 group hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-white/5 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 ${stat.iconBg} dark:bg-white/5 rounded-md flex items-center justify-center text-xl border border-gray-100 dark:border-white/10`}>
                                {stat.icon}
                            </div>
                            <span className="text-emerald-500 text-[10px] font-bold flex items-center">
                                <AiOutlineArrowUp className="mr-0.5" size={12} />
                                {stat.growth}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                    </div>
                ))}

                {/* Independent Comments Card with Toggle */}
                <div className="bg-white dark:bg-[#0A0A0A] p-5 rounded-lg border border-gray-200/80 dark:border-white/10 flex flex-col space-y-4 hover:shadow-lg hover:shadow-gray-200/40 dark:hover:shadow-white/5 transition-all duration-300 group relative">
                    <div className="flex items-center justify-between">
                        <div className={`w-11 h-11 bg-blue-50 dark:bg-white/5 rounded-md flex items-center justify-center text-[#8C0202] text-xl border border-gray-100 dark:border-white/10`}>
                            <AiOutlineGlobal className="text-[#8C0202]" />
                        </div>
                        <div className={`flex items-center space-x-1 text-[11px] font-bold text-emerald-500`}>
                            <AiOutlineArrowUp size={12} />
                            <span>+24%</span>
                        </div>
                    </div>
                    <div className="pt-1">
                        <div className="flex justify-between items-center mb-1">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{commentView === 'total' ? 'Total Comments' : 'Pending Comments'}</p>
                            <button
                                onClick={() => setCommentView(prev => prev === 'total' ? 'pending' : 'total')}
                                className="text-[9px] font-bold text-[#8C0202] hover:underline uppercase tracking-wide"
                            >
                                {commentView === 'total' ? 'Show Pending' : 'Show Total'}
                            </button>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                            {commentView === 'total' ? stats.totalComments : stats.pendingComments}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PostGrowthChart
                    data={growthData}
                    period={growthPeriod}
                    onPeriodChange={setGrowthPeriod}
                />
                <EngagementChart
                    data={engagementData}
                    period={engagementPeriod}
                    onPeriodChange={setEngagementPeriod}
                />
            </div>

            {/* Demographics & Devices Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <DemographicsCard data={demographicsData} />
                </div>
                <div className="lg:col-span-2">
                    <DeviceBreakdown data={deviceData} />
                </div>
            </div>
        </div>
    );
};

export default Analytics;
