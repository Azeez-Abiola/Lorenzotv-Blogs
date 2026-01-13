import React from 'react';
import { AiOutlinePlus, AiOutlineEllipsis, AiOutlineCopy, AiOutlineLink } from "react-icons/ai";

const Pages = () => {
    const pages = [
        { title: "Home Page", slug: "/", type: "Dynamic", lastModified: "12 Jan 2026", status: "Active" },
        { title: "Founder's Series", slug: "/founderseries", type: "Standard", lastModified: "10 Jan 2026", status: "Active" },
        { title: "About Us", slug: "/about", type: "Standard", lastModified: "05 Jan 2026", status: "Active" },
    ];

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-1">Content Structure</p>
                    <h1 className="text-4xl font-black text-black tracking-tight uppercase">Static Pages</h1>
                </div>
                <button className="flex items-center space-x-3 bg-black text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-[#8C0202] transition-all shadow-xl shadow-gray-200">
                    <AiOutlinePlus size={18} />
                    <span>Create New Page</span>
                </button>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-[11px] font-black text-black text-left border-b border-gray-100 uppercase tracking-[0.2em]">
                                <th className="pb-6 pl-4">Page Title</th>
                                <th className="pb-6">Relative URL</th>
                                <th className="pb-6">Type</th>
                                <th className="pb-6">Modified</th>
                                <th className="pb-6 text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50/50">
                            {pages.map((page, idx) => (
                                <tr key={idx} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="py-6 pl-4">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-black group-hover:text-[#8C0202] transition-colors">
                                                <AiOutlineCopy size={20} />
                                            </div>
                                            <p className="text-[15px] font-black text-black uppercase tracking-tight">{page.title}</p>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <div className="flex items-center space-x-2 text-gray-400">
                                            <AiOutlineLink size={14} />
                                            <code className="text-[12px] font-bold">{page.slug}</code>
                                        </div>
                                    </td>
                                    <td className="py-6">
                                        <p className="text-[12px] font-black text-black uppercase tracking-widest">{page.type}</p>
                                    </td>
                                    <td className="py-6">
                                        <p className="text-[12px] font-black text-black opacity-60 uppercase whitespace-nowrap">{page.lastModified}</p>
                                    </td>
                                    <td className="py-6 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button className="px-5 py-2.5 bg-gray-50 text-[10px] font-black uppercase tracking-widest text-black rounded-xl hover:bg-black hover:text-white transition-all">Edit Page</button>
                                            <button className="text-gray-300 hover:text-black transition-colors"><AiOutlineEllipsis size={24} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Pages;
