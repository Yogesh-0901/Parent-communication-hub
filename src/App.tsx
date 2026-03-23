import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { SocketProvider } from './context/SocketContext.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.tsx';
import { AdminDashboard } from './pages/AdminDashboard.tsx';
import { StudentDashboard } from './pages/StudentDashboard.tsx';
import { ChatPage } from './pages/ChatPage.tsx';
import { MarksManagement } from './pages/MarksManagement.tsx';
import { AnnouncementsPage } from './pages/AnnouncementsPage.tsx';
import { AttendanceManagement } from './pages/AttendanceManagement.tsx';
import { AssignmentsManagement } from './pages/AssignmentsManagement.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import { Bell, Search, User as UserIcon } from 'lucide-react';

const DashboardContent = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  if (!user) {
    // Check if we're on forgot password page
    if (window.location.pathname === '/forgot-password') {
      return <ForgotPasswordPage />;
    }
    return <LoginPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return user.role === 'admin' ? <AdminDashboard activeTab="dashboard" /> : <StudentDashboard />;
      case 'students':
        return <AdminDashboard activeTab="students" />;
      case 'marks':
        return <MarksManagement />;
      case 'announcements':
        return <AnnouncementsPage />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'assignments':
        return <AssignmentsManagement />;
      case 'chat':
        return <ChatPage />;
      default:
        return user.role === 'admin' ? <AdminDashboard activeTab="dashboard" /> : <StudentDashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f172a] relative overflow-hidden">
      {/* Dynamic Animated Premium Dashboard Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-fuchsia-500/10 rounded-full mix-blend-screen filter blur-[100px] animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-50 mix-blend-overlay" />
      </div>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <div className="flex-1 flex flex-col relative z-10 w-full overflow-hidden">
        {/* Top Header */}
        <header className="h-[76px] bg-[#1e293b]/70 backdrop-blur-2xl border-b border-white/5 flex items-center justify-between px-8 sticky top-0 z-30 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
          <div className="flex items-center gap-4 text-slate-400 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10 focus-within:border-indigo-500/50 focus-within:bg-white/10 transition-all w-80 shadow-inner">
            <Search size={20} className="text-white/50" />
            <input 
              type="text" 
              placeholder="Search anything across the hub..." 
              className="bg-transparent border-none outline-none text-sm w-full text-white placeholder:text-white/30"
            />
          </div>
          <div className="flex items-center gap-6">
            <button className="relative p-2.5 rounded-full bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 transition-all border border-white/5 shadow-sm">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-tr from-rose-500 to-pink-500 border-2 border-[#1e293b] rounded-full flex items-center justify-center text-[9px] text-white font-black shadow-md">
                2
              </span>
            </button>
            <div className="flex items-center gap-4 pl-6 border-l border-white/10">
              <div className="text-right">
                <div className="text-sm font-black text-white">{user.name}</div>
                <div className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest">{user.role}</div>
              </div>
              <div className="w-11 h-11 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white shadow-[0_4px_15px_rgba(99,102,241,0.4)] border border-white/20">
                <UserIcon size={22} />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <DashboardContent />
      </SocketProvider>
    </AuthProvider>
  );
}
