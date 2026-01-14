import React, { useState, useContext } from 'react';
import { AppContext } from "../../store/AppContext";
import { AiOutlineUser, AiOutlineLock, AiOutlineSave, AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { toast } from "react-toastify";

const Profile = () => {
  const { loggedInUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('info');

  // States for user info
  const [username, setUsername] = useState(loggedInUser?.username || "");
  const [email, setEmail] = useState(loggedInUser?.email || "");

  // States for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleInfoUpdate = (e) => {
    e.preventDefault();
    toast.success("Profile information updated!");
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error("Please fill in both password fields.");
      return;
    }
    toast.success("Password changed successfully!");
    setCurrentPassword("");
    setNewPassword("");
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-[#0A0A0A] p-8 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm transition-colors">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white leading-tight mb-2 tracking-tighter">Account Settings</h1>
          <p className="text-gray-400 dark:text-gray-500 font-medium text-sm">Manage your administrator profile, security, and preferences.</p>
        </div>
        <div className="flex bg-gray-50 dark:bg-white/5 p-1.5 rounded-lg border border-gray-100 dark:border-white/10">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all
              ${activeTab === 'info' ? 'bg-white dark:bg-white/10 text-[#8C0202] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            General Info
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all
              ${activeTab === 'security' ? 'bg-white dark:bg-white/10 text-[#8C0202] shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
          >
            Security
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Card: Avatar & Status */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-white/10 p-12 shadow-sm text-center relative overflow-hidden group transition-colors">
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-[#8C0202] to-[#5a0000]"></div>
            <div className="relative z-10 pt-8">
              <div className="w-40 h-40 bg-white dark:bg-black p-2 rounded-xl mx-auto mb-6 shadow-2xl">
                <div className="w-full h-full bg-[#8C0202] rounded-lg flex items-center justify-center group relative overflow-hidden">
                  <span className="text-6xl font-black text-white">{username[0]?.toUpperCase() || "A"}</span>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer">
                    <AiOutlineSave size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest mt-2">Update</span>
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-1">{username || "Admin"}</h3>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-8">Master Administrator</p>
              <div className="flex items-center justify-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Active Session</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-950 p-10 rounded-xl text-white relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-red-500 mb-4 font-mono">System Logs // Safety</p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 text-xs">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1"></div>
                  <p className="text-gray-400 font-medium">Last login from <span className="text-white">Lagos, NG</span> on Jan 12, 08:42 AM</p>
                </div>
                <div className="flex items-start space-x-3 text-xs opacity-50">
                  <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mt-1"></div>
                  <p className="text-gray-400 font-medium">Security policy updated successfully</p>
                </div>
              </div>
            </div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Right Columns: Forms */}
        <div className="xl:col-span-8">
          {activeTab === 'info' ? (
            <form onSubmit={handleInfoUpdate} className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-white/10 p-12 shadow-sm space-y-10 animate-fade-in relative transition-colors">
              <div className="space-y-8">
                <div className="flex items-center space-x-4 border-b border-gray-50 dark:border-white/5 pb-6">
                  <div className="w-10 h-10 bg-red-50 dark:bg-red-500/10 rounded-lg flex items-center justify-center text-[#8C0202]">
                    <AiOutlineUser size={20} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Personal Identification</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Full Name</label>
                    <input
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 focus:bg-white dark:focus:bg-black focus:border-[#8C0202] focus:shadow-xl focus:shadow-red-500/5 transition-all outline-none"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4 text-gray-400">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Email (Primary)</label>
                    <input
                      className="w-full px-6 py-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm font-bold opacity-60 dark:text-gray-400 cursor-not-allowed"
                      value={email}
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button className="inline-flex items-center space-x-4 px-10 py-5 bg-[#8C0202] text-white rounded-lg font-black uppercase tracking-widest text-xs shadow-2xl shadow-red-900/20 hover:-translate-y-1 transition-all">
                  <AiOutlineSave size={20} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordUpdate} className="bg-white dark:bg-[#0A0A0A] rounded-xl border border-gray-100 dark:border-white/10 p-12 shadow-sm space-y-10 animate-fade-in transition-colors">
              <div className="space-y-8">
                <div className="flex items-center space-x-4 border-b border-gray-50 dark:border-white/5 pb-6">
                  <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-gray-900 dark:text-white">
                    <AiOutlineLock size={20} />
                  </div>
                  <h4 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-widest">Security Credentials</h4>
                </div>
                <div className="space-y-10">
                  <div className="space-y-4 max-w-md">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">Current Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        className="w-full px-6 py-5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 focus:bg-white dark:focus:bg-black focus:border-[#8C0202] transition-all outline-none"
                        placeholder="••••••••"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-4 max-w-md">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 dark:text-gray-500 ml-1">New Secure Password</label>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        className="w-full px-6 py-14 md:py-5 border border-gray-100 dark:border-white/10 rounded-lg text-sm font-bold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-white/5 focus:bg-white dark:focus:bg-black focus:border-[#8C0202] transition-all outline-none pr-16"
                        placeholder="Min 12 characters"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass(!showPass)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {showPass ? <AiOutlineEyeInvisible size={22} /> : <AiOutlineEye size={22} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="pt-4">
                <button className="inline-flex items-center space-x-4 px-10 py-5 bg-gray-950 text-white rounded-lg font-black uppercase tracking-widest text-xs shadow-2xl hover:-translate-y-1 transition-all">
                  <AiOutlineLock size={20} />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
