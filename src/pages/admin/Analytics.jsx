import { useEffect, useState, useCallback, useRef } from "react";
import { AiOutlineBarChart, AiOutlineArrowUp, AiOutlineUser, AiOutlineGlobal, AiOutlineArrowDown, AiOutlineFileText, AiOutlineFolder } from "react-icons/ai";
import { IoChevronDownOutline } from "react-icons/io5";
import useFetch from "../../hooks/useFetch";
import LoadingSpinner from "../../components/LoadingSpinner/LoadingSpinner";

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
    if (!data || data.length === 0) return (
        <div className="bg-white p-6 rounded-lg border border-gray-200/80 flex flex-col h-96 items-center justify-center text-gray-400">
            <p>No data available</p>
        </div>
    );

    const maxVal = Math.max(...data.map(d => d.posts), 10); // Minimum scale of 10

    return (
        <div className="bg-white p-6 rounded-lg border border-gray-200/80 flex flex-col h-96 relative">
            <div className="flex items-center justify-between mb-6">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Publication Volume</h4>
                <CustomDropdown options={["6 Months", "Yearly", "All Time"]} defaultValue="Yearly" />
            </div>

            <div className="flex-1 relative flex items-end justify-between space-x-2 min-h-[200px]">
                {/* Horizontal Grid Lines */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-10">
                    {[1, 0.75, 0.5, 0.25, 0].map(val => (
                        <div key={val} className="flex items-center w-full">
                            <span className="text-[10px] font-bold text-gray-400 w-8 shrink-0">{Math.round(maxVal * val)}</span>
                            <div className="flex-1 border-t border-dashed border-gray-100 ml-2"></div>
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
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-tight">{d.month}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Analytics = () => {
    const { fetchRequest, isLoading } = useFetch();
    const [growthData, setGrowthData] = useState([]);
    const [stats, setStats] = useState({
        totalArticles: 0,
        totalCategories: 0,
        totalMedia: 0,
        pendingComments: 0
    });

    const fetchData = useCallback(() => {
        // Fetch Growth
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/analytics/growth` }, (res) => {
            if (res.status === 'success') {
                setGrowthData(res.data.growth || []);
            }
        });
        // Fetch Stats
        fetchRequest({ url: `${import.meta.env.VITE_API_BASE_URL}/admin/stats` }, (res) => {
            if (res.status === 'success') setStats(res.data);
        });
    }, [fetchRequest]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const metrics = [
        { title: "Total Articles", value: stats.totalArticles, growth: "+12%", icon: <AiOutlineFileText className="text-[#8C0202]" />, iconBg: "bg-red-50" },
        { title: "Categories Active", value: stats.totalCategories, growth: "+0%", icon: <AiOutlineFolder className="text-[#8C0202]" />, iconBg: "bg-orange-50" },
        { title: "Engagement (Comments)", value: stats.pendingComments, growth: "+24%", icon: <AiOutlineGlobal className="text-[#8C0202]" />, iconBg: "bg-blue-50" },
    ];



    if (isLoading && growthData.length === 0) {
        return <div className="py-20 flex justify-center"><LoadingSpinner type="full" /></div>
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-1">Analytics</h1>
                    <p className="text-sm text-gray-500">Real-time content performance</p>
                </div>
                <div className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200/80 rounded-md text-[11px] font-medium text-gray-600">
                    <span>Current Year Data</span>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {metrics.map((stat, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-lg border border-gray-200/80 group hover:shadow-lg hover:shadow-gray-200/40 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-10 h-10 ${stat.iconBg} rounded-md flex items-center justify-center text-xl border border-gray-100`}>
                                {stat.icon}
                            </div>
                            {/* Dummy trend logic for now since we don't have historical deltas stored */}
                            <span className="text-emerald-500 text-[10px] font-bold flex items-center">
                                <AiOutlineArrowUp className="mr-0.5" size={12} />
                                {stat.growth}
                            </span>
                        </div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">{stat.title}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div>
                <PostGrowthChart data={growthData} />
            </div>
        </div>
    );
};

export default Analytics;
