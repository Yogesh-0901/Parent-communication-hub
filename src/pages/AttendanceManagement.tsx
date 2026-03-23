import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { Calendar, Download, Send, Check, X, Users, MessageSquare, ChevronRight } from 'lucide-react';

export const AttendanceManagement: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  
  // For parent view layout
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<any[]>([]);
  const [searchName, setSearchName] = useState('');
  const [searchRoll, setSearchRoll] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentAttendance = async (studentId: string) => {
    try {
      const res = await axios.get(`/api/attendance/${studentId}`);
      setStudentAttendance(res.data);
    } catch (err) {}
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    fetchStudentAttendance(studentId);
  };

  const handleMark = async (studentId: string, status: 'Present' | 'Absent') => {
    try {
      await axios.post('/api/attendance', { studentId, date, status });
      setStudents(students.map(s => s._id === studentId ? { ...s, tempStatus: status } : s));
    } catch (err) {
      alert('Error marking attendance');
    }
  };

  const exportAndSend = async () => {
    setSending(true);
    try {
      const res = await axios.post('/api/attendance/export-and-send', { date }, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance_${date}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('Report exported and sent to parents successfully!');
    } catch (err) {
      alert('Error exporting report');
    } finally {
      setSending(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-white drop-shadow-md mb-8 tracking-tight">View Attendance</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="col-span-1 bg-[#141d2e]/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden h-fit max-h-[80vh] overflow-y-auto custom-scrollbar">
            <div className="p-5 bg-black/20 border-b border-white/10 font-black text-indigo-300 flex flex-col gap-3 sticky top-0 uppercase tracking-widest text-xs">
               <div className="flex items-center gap-2"><Users size={18} /> Find Student</div>
               <div className="flex flex-col gap-3 mt-2">
                 <input type="text" placeholder="Search by Name" value={searchName} onChange={e => setSearchName(e.target.value)} className="w-full px-4 py-2 text-sm bg-black/30 border border-white/10 text-white placeholder-white/20 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all"/>
                 <input type="text" placeholder="Search by Roll No" value={searchRoll} onChange={e => setSearchRoll(e.target.value)} className="w-full px-4 py-2 text-sm bg-black/30 border border-white/10 text-white placeholder-white/20 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all"/>
               </div>
            </div>
            <div className="divide-y divide-white/5">
              {students
                .filter(s => {
                  if (!searchName && !searchRoll) return true;
                  return s.name.toLowerCase().includes(searchName.toLowerCase()) && s.rollNumber.toLowerCase().includes(searchRoll.toLowerCase());
                })
                .map(s => (
                <button key={s._id} onClick={() => handleStudentSelect(s._id)} className={`w-full text-left px-5 py-4 text-sm transition-all flex items-center justify-between group ${selectedStudent === s._id ? 'bg-indigo-600/30 border-l-[3px] border-indigo-400 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
                  <div><div className="font-bold">{s.name}</div><div className="text-[10px] uppercase font-black tracking-widest text-indigo-300 mt-1">{s.rollNumber}</div></div>
                  <ChevronRight size={14} className={`transition-transform ${selectedStudent === s._id ? 'translate-x-1 text-indigo-300' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="col-span-3">
            {selectedStudent ? (
              <div className="bg-[#141d2e]/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
                 <div className="p-6 border-b border-white/10 bg-gradient-to-r from-black/20 to-transparent">
                    <h2 className="text-xl font-black text-white drop-shadow-sm">{students.find(s => s._id === selectedStudent)?.name}'s Daily Attendance Log</h2>
                 </div>
                 <table className="w-full text-left">
                  <thead className="bg-black/40 text-indigo-300 text-xs uppercase tracking-widest font-black">
                    <tr><th className="px-6 py-5">Date</th><th className="px-6 py-5">Status</th></tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {studentAttendance.map((record) => (
                      <tr key={record.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-6 py-5 font-bold text-white">{record.date}</td>
                        <td className="px-6 py-5">
                          <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest shadow-lg ${
                            record.status === 'Present' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {record.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {studentAttendance.length === 0 && (
                      <tr><td colSpan={2} className="px-6 py-12 text-center text-white/40 italic font-medium">No attendance records found for this student.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[2rem] shadow-inner border border-white/10 text-center flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-indigo-300 mb-6 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]"><Calendar size={48} /></div>
                <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md tracking-tight">Select a student</h2>
                <p className="text-indigo-200/80 max-w-sm font-medium">Choose a student to view their detailed attendance records securely</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Daily Attendance</h1>
          <p className="text-indigo-200/80 font-bold mt-1 tracking-wider uppercase text-xs">Mark student attendance and send reports</p>
        </div>
        <div className="flex items-center gap-4">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="px-5 py-3 bg-[#1e293b]/70 backdrop-blur-md text-white border border-white/20 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-inner transition-all font-medium" />
          <button onClick={exportAndSend} disabled={sending} className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)] border-b-[4px] border-emerald-700 active:border-b-0 active:translate-y-1 disabled:opacity-50">
            {sending ? <MessageSquare className="animate-pulse" size={18} /> : <Send size={18} />}
            {sending ? 'Sending...' : 'Export & Send'}
          </button>
        </div>
      </div>

      <div className="bg-[#141d2e]/80 backdrop-blur-3xl rounded-[2.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
        <table className="w-full text-left bg-transparent">
          <thead className="bg-black/30 text-indigo-300 text-[11px] font-black uppercase tracking-widest border-b border-white/10">
            <tr>
              <th className="px-6 py-5">Student Name</th>
              <th className="px-6 py-5">Roll Number</th>
              <th className="px-6 py-5 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {students.map((student) => (
              <tr key={student._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-5 font-bold text-white text-sm">{student.name}</td>
                <td className="px-6 py-5 text-indigo-200/60 font-medium text-sm tracking-wide">{student.rollNumber}</td>
                <td className="px-6 py-5 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <button onClick={() => handleMark(student._id, 'Present')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${student.tempStatus === 'Present' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_5px_15px_rgba(16,185,129,0.4)]' : 'bg-white/5 text-white/50 hover:bg-emerald-500/20 hover:text-emerald-400 border border-white/10'}`}>
                      <Check size={14} /> Present
                    </button>
                    <button onClick={() => handleMark(student._id, 'Absent')} className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${student.tempStatus === 'Absent' ? 'bg-gradient-to-r from-rose-500 to-orange-500 text-white shadow-[0_5px_15px_rgba(244,63,94,0.4)]' : 'bg-white/5 text-white/50 hover:bg-rose-500/20 hover:text-rose-400 border border-white/10'}`}>
                      <X size={14} /> Absent
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && !loading && (
              <tr><td colSpan={3} className="px-6 py-16 text-center text-white/40 italic text-lg font-medium">No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
