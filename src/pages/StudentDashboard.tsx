import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { 
  GraduationCap, 
  Calendar, 
  Award, 
  MessageSquare, 
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const [student, setStudent] = useState<any>(null);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentData();
    fetchAnnouncements();
  }, []);

  const fetchStudentData = async () => {
    try {
      const res = await axios.get('/api/students');
      if (res.data.length > 0) {
        setStudent(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data.slice(0, 3));
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading performance data...</div>;
  if (!student) return <div className="p-8 text-center text-slate-500">No student data linked to this account.</div>;

  const radarData = student.marks.map((m: any) => ({
    subject: m.subject,
    score: Number(m.score) || 0,
    fullMark: Number(m.maxScore) || 100
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto overflow-hidden">
      {/* Profile Header */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100 }}
        className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 p-10 rounded-[2.5rem] shadow-[0_20px_50px_-10px_rgba(49,46,129,0.5)] border-b-[6px] border-indigo-950 flex flex-col md:flex-row items-center gap-10 mb-10 relative overflow-hidden"
      >
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: 'linear' }} className="absolute -top-32 -right-32 w-96 h-96 bg-fuchsia-600 rounded-full mix-blend-screen filter blur-[80px] opacity-40 z-0" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: 'linear' }} className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-40 z-0" />

        <motion.div 
           whileHover={{ scale: 1.1, rotate: 10 }}
           className="w-36 h-36 bg-gradient-to-tr from-pink-500 to-orange-400 rounded-3xl flex items-center justify-center text-white shadow-[0_0_30px_rgba(236,72,153,0.6)] z-10 border-4 border-white/20 rotate-3 cursor-pointer"
        >
          <GraduationCap size={72} className="drop-shadow-lg" />
        </motion.div>
        <div className="text-center md:text-left flex-1 z-10">
          <h1 className="text-5xl font-black text-white mb-4 tracking-tight drop-shadow-md">{student.name}</h1>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 text-indigo-100 font-bold tracking-wide">
            <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Calendar size={20} className="text-pink-400" /> Roll {student.rollNumber}</span>
            <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><Award size={20} className="text-amber-400" /> Dept {student.department}</span>
            <span className="flex items-center gap-2 bg-black/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"><MessageSquare size={20} className="text-emerald-400" /> Behavior {student.behavior}</span>
          </div>
        </div>
        <motion.div 
           whileHover={{ scale: 1.05 }}
           className="flex flex-col items-center p-8 bg-black/30 backdrop-blur-xl rounded-3xl min-w-[180px] border border-white/10 shadow-2xl z-10"
        >
          <span className="text-indigo-200 text-sm font-black uppercase tracking-widest mb-2">Attendance</span>
          <span className={`text-6xl font-black drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] ${(Number(student.attendance) || 0) < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {Number(student.attendance) || 0}%
          </span>
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Academic Performance */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-slate-900">Academic Overview</h2>
              <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-sm font-bold">
                <TrendingUp size={16} />
                Improving
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#4f46e5"
                      fill="#4f46e5"
                      fillOpacity={0.6}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {student.marks.map((m: any) => (
                  <div key={m.subject} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <span className="font-bold text-slate-700">{m.subject}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-slate-500">{m.score}/{m.maxScore}</span>
                      <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${((Number(m.score) || 0) / (Number(m.maxScore) || 100)) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights */}
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <BrainCircuit size={120} />
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-500 rounded-lg">
                  <BrainCircuit size={24} />
                </div>
                <h2 className="text-xl font-bold">AI Performance Analysis</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-4">Key Strengths</h3>
                  <ul className="space-y-3">
                    {student.aiFeedback?.strengths.map((s: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <CheckCircle2 className="text-emerald-500 shrink-0 mt-1" size={16} />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-rose-400 font-bold uppercase tracking-wider text-xs mb-4">Areas for Improvement</h3>
                  <ul className="space-y-3">
                    {student.aiFeedback?.weaknesses.map((w: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-slate-300">
                        <AlertTriangle className="text-rose-500 shrink-0 mt-1" size={16} />
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-800">
                <h3 className="text-indigo-400 font-bold uppercase tracking-wider text-xs mb-4">Smart Suggestions</h3>
                <div className="flex flex-wrap gap-3">
                  {student.aiFeedback?.suggestions.map((s: string, i: number) => (
                    <span key={i} className="bg-slate-800 px-4 py-2 rounded-xl text-sm border border-slate-700">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Alerts & Notifications */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Critical Alerts</h2>
            <div className="space-y-4">
              {student.attendance < 75 && (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex gap-3">
                  <AlertTriangle className="text-rose-600 shrink-0" />
                  <div>
                    <h4 className="font-bold text-rose-900 text-sm">Low Attendance</h4>
                    <p className="text-rose-700 text-xs mt-1">Attendance is below 75%. Please contact the advisor immediately.</p>
                  </div>
                </div>
              )}
              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex gap-3">
                <CheckCircle2 className="text-indigo-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-indigo-900 text-sm">Report Generated</h4>
                  <p className="text-indigo-700 text-xs mt-1">Weekly performance report for March is now available.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Recent Announcements</h2>
            <div className="space-y-4">
              {announcements.map(ann => (
                <div key={ann.id} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <h4 className="font-bold text-slate-900 text-sm">{ann.title}</h4>
                  <p className="text-slate-500 text-xs mt-1 line-clamp-2">{ann.message}</p>
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-slate-400 text-sm italic text-center py-4">No recent announcements.</p>
              )}
            </div>
          </div>

          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-50 to-purple-50 p-8 rounded-3xl shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] border border-indigo-100"
          >
            <h2 className="text-xl font-black text-indigo-900 mb-4 flex items-center gap-2"><MessageSquare className="text-indigo-600" /> Quick Chat</h2>
            <p className="text-indigo-600/80 font-medium text-sm mb-6">Have questions about the performance? Message the class advisor.</p>
            <motion.button 
               whileHover={{ scale: 1.05 }}
               whileTap={{ scale: 0.85, rotate: -3 }}
               className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-2xl font-black text-lg hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_15px_30px_-10px_rgba(99,102,241,0.6)] border-b-[4px] border-indigo-800 active:border-b-0 active:translate-y-[4px] flex items-center justify-center gap-3"
            >
              <MessageSquare size={24} />
              Message Advisor
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
