import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { motion } from 'motion/react';
import { GraduationCap, Mail, Lock, User as UserIcon, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('parent');
  const [linkedStudentId, setLinkedStudentId] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        await register({ name, email, password, role, linkedStudentId });
      } else {
        await login(email, password);
      }
    } catch (err) {
      alert('Authentication failed');
    }
  };

  return (
    <div className="min-h-screen flex w-full relative overflow-hidden bg-slate-50">
      
      {/* LEFT SIDE: Promotional Banner & Background Image */}
      <div className="hidden lg:flex flex-col flex-1 relative bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center items-center justify-center p-16">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-950/90 via-purple-900/80 to-black/90 z-0" />
        
        {/* Animated decorative orbs */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }} className="absolute -top-32 -left-32 w-[30rem] h-[30rem] bg-indigo-500 rounded-full mix-blend-screen filter blur-[100px] opacity-40 z-0" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }} className="absolute bottom-0 right-0 w-[30rem] h-[30rem] bg-pink-500 rounded-full mix-blend-screen filter blur-[100px] opacity-30 z-0" />
        
        <div className="z-10 text-white w-full max-w-2xl relative">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8, type: "spring" }}>
            <div className="bg-white/10 p-5 rounded-icon backdrop-blur-md w-fit mb-8 border border-white/20 shadow-2xl rounded-3xl">
              <GraduationCap size={56} className="text-yellow-400 drop-shadow-lg" />
            </div>
            <h1 className="text-6xl font-black mb-6 leading-[1.1] drop-shadow-xl tracking-tight">
              Parent <br />
              Communication <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-500">Hub</span>
            </h1>
            <p className="text-xl text-indigo-100/90 font-medium leading-relaxed max-w-lg">
              Empower your institution with an ultra-premium, AI-driven digital gateway. Keep parents and educators perfectly synchronized in real-time.
            </p>
          </motion.div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-[#0b0f19] relative z-10 overflow-hidden shadow-[-30px_0_60px_-15px_rgba(0,0,0,0.5)]">
      
        {/* Anti-gravity flowing sparkle bubbles */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-50">
           {[...Array(20)].map((_, i) => (
             <motion.div 
                key={i}
                initial={{ y: "110vh", x: (Math.random() - 0.5) * 800, opacity: 0, scale: Math.random() * 0.6 + 0.4 }}
                animate={{ y: "-10vh", opacity: [0, 1, 1, 0], rotate: Math.random() * 360 }}
                transition={{ duration: Math.random() * 15 + 10, repeat: Infinity, delay: Math.random() * 10, ease: "linear" }}
                className={`absolute bottom-0 left-1/2 rounded-full mix-blend-screen shadow-[0_0_20px_rgba(255,255,255,0.6)] ${['bg-indigo-500 w-4 h-4', 'bg-pink-500 w-6 h-6', 'bg-blue-400 w-3 h-3', 'bg-purple-500 w-5 h-5'][Math.floor(Math.random()*4)]}`}
             />
           ))}
        </div>

      <motion.div 
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
        className="bg-white/10 backdrop-blur-2xl p-10 rounded-[2.5rem] shadow-[0px_30px_60px_-15px_rgba(0,0,0,0.6)] w-full max-w-md border border-white/20 z-10 relative"
      >
        <div className="flex flex-col items-center mb-10 relative text-center">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 10 }}
            className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-4 rounded-3xl mb-5 shadow-[0px_10px_30px_-5px_rgba(236,72,153,0.6)] border-b-[3px] border-white/20 cursor-pointer"
          >
            <Lock className="text-white w-8 h-8 drop-shadow-md" />
          </motion.div>
          <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
             className="absolute top-0 right-16 text-yellow-300 drop-shadow-[0_0_10px_rgba(253,224,71,0.8)]"
          >
             <Sparkles size={26} className="animate-pulse" />
          </motion.div>
          <h1 className="text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">Welcome Back!</h1>
          <p className="text-indigo-200/80 text-sm font-bold tracking-wide">Please enter your credentials to login.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegister && (
             <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
              <label className="block text-[11px] uppercase tracking-widest font-black text-indigo-300 mb-2">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 w-5 h-5 flex items-center justify-center opacity-70" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-black/20 text-white placeholder-indigo-200/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-pink-500/50 focus:border-transparent focus:bg-black/40 outline-none transition-all shadow-inner"
                  placeholder="e.g. John Doe"
                  required
                />
              </div>
            </motion.div>
          )}

          <div>
            <label className="block text-[11px] uppercase tracking-widest font-black text-indigo-300 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 w-5 h-5 flex items-center justify-center opacity-70" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 text-white placeholder-indigo-200/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-pink-500/50 focus:border-transparent focus:bg-black/40 outline-none transition-all shadow-inner"
                placeholder="e.g. you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-widest font-black text-indigo-300 mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-indigo-300 w-5 h-5 flex items-center justify-center opacity-70" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-black/20 text-white placeholder-indigo-200/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-pink-500/50 focus:border-transparent focus:bg-black/40 outline-none transition-all shadow-inner"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {isRegister && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-5">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-black text-indigo-300 mb-2">Account Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 bg-black/20 text-white placeholder-indigo-200/40 border border-white/10 rounded-2xl focus:ring-2 focus:ring-pink-500/50 outline-none shadow-inner"
                >
                  <option value="parent" className="text-slate-900">Parent</option>
                  <option value="student" className="text-slate-900">Student</option>
                  <option value="admin" className="text-slate-900">Admin</option>
                </select>
              </div>
              {role !== 'admin' && (
                <div>
                  <label className="block text-[11px] uppercase tracking-widest font-black text-emerald-300 mb-2 animate-pulse">Link Student ID (Required)</label>
                  <input
                    type="text"
                    value={linkedStudentId}
                    onChange={(e) => setLinkedStudentId(e.target.value)}
                    className="w-full px-4 py-3 bg-emerald-500/10 text-emerald-100 placeholder-emerald-100/40 border border-emerald-500/30 rounded-2xl focus:ring-2 focus:ring-emerald-400 outline-none shadow-inner"
                    placeholder="Enter corresponding Student ID"
                  />
                </div>
              )}
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.85, rotate: [0, -5, 5, 0] }}
            type="submit"
            className="w-full bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white rounded-2xl py-4 font-black text-lg hover:from-pink-400 hover:to-indigo-500 transition-all shadow-[0px_15px_30px_-5px_rgba(236,72,153,0.5)] border-b-[4px] border-purple-800 active:border-b-0 active:translate-y-[4px] mt-4 uppercase tracking-wider"
          >
            {isRegister ? '🚀 Create Account' : '🚀 Secure Sign In'}
          </motion.button>
        </form>

        <div className="mt-8 text-center space-y-4">
          <button
            onClick={() => setIsRegister(!isRegister)}
            className="text-pink-300 hover:text-pink-200 text-sm font-bold tracking-wide hover:underline block w-full transition-colors"
          >
            {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
          </button>
          <button
            onClick={() => window.location.href = '/forgot-password'}
            className="text-indigo-200/50 hover:text-indigo-200 text-sm font-bold tracking-wide hover:underline block w-full transition-colors"
          >
            Forgot Password?
          </button>
          <button
            onClick={async () => {
              try {
                await axios.post('/api/seed/seed');
                alert('Database seeded! Use admin@college.edu / password123');
              } catch (err) {
                alert('Seed failed. Ensure MongoDB is running or URI is correct.');
              }
            }}
            className="text-indigo-200/50 text-xs hover:text-indigo-200 font-bold uppercase tracking-wider transition-colors pt-4"
          >
            Seed Sample Data
          </button>
        </div>
      </motion.div>
      </div>
    </div>
  );
};
