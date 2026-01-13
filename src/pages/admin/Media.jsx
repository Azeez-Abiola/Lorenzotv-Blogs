import React from 'react';
import { AiOutlineCloudUpload, AiOutlineSearch, AiOutlineEllipsis, AiOutlinePicture } from "react-icons/ai";

const Media = () => {
    const assets = [
        { id: 1, name: "hero_banner.jpg", size: "1.2MB", date: "12 Jan 2026", type: "image/jpeg" },
        { id: 2, name: "founder_story.png", size: "850KB", date: "10 Jan 2026", type: "image/png" },
        { id: 3, name: "tech_ai_cover.webp", size: "420KB", date: "08 Jan 2026", type: "image/webp" },
        { id: 4, name: "lifestyle_portrait.jpg", size: "2.1MB", date: "05 Jan 2026", type: "image/jpeg" },
        { id: 5, name: "business_logo_v2.svg", size: "15KB", date: "02 Jan 2026", type: "image/svg+xml" },
        { id: 6, name: "education_bg.jpg", size: "3.4MB", date: "01 Jan 2026", type: "image/jpeg" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Asset Management</p>
                    <h1 className="text-4xl font-black text-black tracking-tight uppercase">Media Library</h1>
                </div>
                <button className="flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#8C0202] transition-all shadow-xl shadow-gray-200">
                    <AiOutlineCloudUpload size={18} />
                    <span>Upload New Asset</span>
                </button>
            </div>

            <div className="flex items-center space-x-4">
                <div className="bg-white rounded-2xl px-6 h-12 flex items-center flex-1 border border-gray-100 shadow-sm max-w-md">
                    <AiOutlineSearch className="text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search media..."
                        className="bg-transparent border-none outline-none text-sm font-bold text-black w-full ml-3 placeholder:text-gray-400"
                    />
                </div>
                <select className="bg-white border border-gray-100 rounded-2xl text-[12px] font-black uppercase tracking-widest text-black px-6 py-3 outline-none shadow-sm">
                    <option>All Media</option>
                    <option>Images</option>
                    <option>Documents</option>
                </select>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {assets.map((asset) => (
                    <div key={asset.id} className="group relative bg-white p-4 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                        <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 flex items-center justify-center border border-gray-50">
                            <AiOutlinePicture size={40} className="text-gray-200 group-hover:text-[#8C0202] transition-colors" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[12px] font-black text-black truncate uppercase tracking-tight">{asset.name}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{asset.size} • {asset.date}</p>
                        </div>
                        <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg text-black hover:text-[#8C0202]">
                                <AiOutlineEllipsis size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Media;
