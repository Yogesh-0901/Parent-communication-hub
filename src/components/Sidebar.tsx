import React from 'react';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  LayoutDashboard, 
  Users, 
  MessageSquare, 
  LogOut, 
  GraduationCap,
  Bell,
  FileText,
  Megaphone,
  Sparkles
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, bg: 'from-blue-500 to-cyan-400' },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={20} />, bg: 'from-amber-400 to-orange-500' },
    { id: 'marks', label: 'Marks', icon: <FileText size={20} />, bg: 'from-emerald-400 to-teal-500' },
    { id: 'attendance', label: 'Attendance', icon: <FileText size={20} />, bg: 'from-rose-400 to-red-500' },
    { id: 'assignments', label: 'Assignments', icon: <FileText size={20} />, bg: 'from-fuchsia-500 to-pink-500' },
    { id: 'chat', label: 'Messages', icon: <MessageSquare size={20} />, bg: 'from-indigo-500 to-purple-600' },
  ];

  if (user?.role === 'admin') {
    menuItems.splice(1, 0, { id: 'students', label: 'Students', icon: <Users size={20} />, bg: 'from-violet-500 to-purple-500' });
  }

  return (
    <div className="w-72 bg-gradient-to-b from-indigo-900 via-slate-900 to-slate-900 border-r border-indigo-800/50 flex flex-col h-screen sticky top-0 shadow-2xl z-50">
      <div className="p-6 flex items-center gap-4 border-b border-white/10 relative overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute -top-10 -left-10 w-24 h-24 bg-purple-500 rounded-full mix-blend-screen filter blur-2xl opacity-40" />
        <motion.div 
           whileHover={{ scale: 1.1, rotate: 180 }}
           className="bg-gradient-to-tr from-indigo-500 to-pink-500 p-2.5 rounded-xl shadow-[0_0_15px_rgba(168,85,247,0.5)] z-10"
        >
          <GraduationCap className="text-white" size={26} />
        </motion.div>
        <span className="font-extrabold text-white text-xl tracking-tight z-10 flex items-center gap-2">ParentHub <Sparkles size={16} className="text-yellow-400" /></span>
      </div>

      <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.03, x: 5 }}
              whileTap={{ scale: 0.9, rotate: [0, -3, 3, 0] }}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all relative overflow-hidden ${
                isActive 
                  ? 'bg-white/10 text-white border border-white/20 shadow-[0_8px_30px_rgb(0,0,0,0.12)]' 
                  : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              {isActive && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-pink-500 to-violet-500" />
              )}
              <div className={`p-2 rounded-xl text-white shadow-lg bg-gradient-to-tr ${item.bg}`}>
                 {item.icon}
              </div>
              <span className="text-[15px] tracking-wide">{item.label}</span>
            </motion.button>
          );
        })}
      </div>

      <div className="p-4 border-t border-white/10">
        <div className="bg-white/5 border border-white/10 p-4 rounded-2xl mb-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-extrabold shadow-[0_0_10px_rgba(99,102,241,0.5)]">
              {user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-extrabold text-white truncate">{user?.name}</div>
              <div className="text-[10px] text-pink-400 uppercase font-black tracking-widest">{user?.role}</div>
            </div>
          </div>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.85, rotate: -3 }}
          onClick={logout}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 text-white font-bold bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 rounded-2xl transition-all shadow-[0_8px_20px_rgba(225,29,72,0.4)] border-b-4 border-rose-800 active:border-b-0 active:translate-y-1"
        >
          <LogOut size={20} />
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};
