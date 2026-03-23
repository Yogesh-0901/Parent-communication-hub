import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'motion/react';
import { 
  Users, 
  UserPlus, 
  Download, 
  Trash2, 
  Edit2, 
  Eye,
  Search,
  AlertCircle,
  TrendingUp,
  Clock,
  Sparkles,
  Award,
  Mail,
  MessageSquare,
  Phone,
  Send
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { generateAIFeedback } from '../services/aiService.ts';

export const AdminDashboard: React.FC<{ activeTab?: string }> = ({ activeTab = 'dashboard' }) => {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNumber: '',
    department: '',
    attendance: 0,
    behavior: 'Good',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    marks: [{ subject: 'Math', score: 0, maxScore: 100 }]
  });
  const [viewStudent, setViewStudent] = useState<any>(null);
  const [editStudent, setEditStudent] = useState<any>(null);
  const [emailForm, setEmailForm] = useState({
    to: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const generateNextRollNumber = (studentList: any[]) => {
    if (!studentList || studentList.length === 0) return '001';
    
    // Sort alphabetically to find the highest logical roll number
    const sortedRolls = studentList
      .map(s => String(s.rollNumber || ''))
      .filter(Boolean)
      .sort((a, b) => a.localeCompare(b));
      
    if (sortedRolls.length === 0) return '001';
    const lastRoll = sortedRolls[sortedRolls.length - 1];
    
    // Extract trailing numbers to increment
    const match = lastRoll.match(/(\d+)$/);
    if (match) {
      const numStr = match[1];
      const nextNum = parseInt(numStr, 10) + 1;
      const paddedNextNum = nextNum.toString().padStart(numStr.length, '0');
      return lastRoll.slice(0, lastRoll.length - numStr.length) + paddedNextNum;
    }
    return lastRoll + '1';
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const aiFeedback = await generateAIFeedback(newStudent);
      await axios.post('/api/students', { ...newStudent, aiFeedback });
      setShowAddModal(false);
      fetchStudents();
      setNewStudent({
        name: '', rollNumber: '', department: '', attendance: 0, behavior: 'Good', parentName: '', parentEmail: '', marks: [{ subject: 'Math', score: 0, maxScore: 100 }]
      });
    } catch (err: any) {
      alert('Error adding student: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const aiFeedback = await generateAIFeedback(editStudent);
      await axios.put(`/api/students/${editStudent._id}`, { ...editStudent, aiFeedback });
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      alert('Error updating student');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await axios.delete(`/api/students/${id}`);
        fetchStudents();
      } catch (err) {
        alert('Error deleting student');
      }
    }
  };

  const handleExport = async () => {
    try {
      const res = await axios.get('/api/students/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'students_report.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleSendEmail = async (email: string) => {
    if (!email) {
      alert('No email address available for this parent');
      return;
    }
    
    try {
      const response = await axios.post('/api/messaging/send-email', {
        recipients: [email],
        subject: 'Important Notification from Parent Communication Hub',
        message: 'This is an important message regarding your child\'s progress. Please check the portal for more details.',
        sendToAll: false
      });
      
      if (response.data.success) {
        alert('Email sent successfully!');
      } else {
        alert('Failed to send email: ' + response.data.error);
      }
    } catch (err) {
      alert('Error sending email');
    }
  };

  const sendEmail = async () => {
    if (!emailForm.to || !emailForm.subject || !emailForm.message) {
      alert('Please fill in all email fields');
      return;
    }
    
    try {
      const response = await axios.post("http://localhost:3001/api/email", {
        to: emailForm.to,
        subject: emailForm.subject,
        message: emailForm.message
      });
      
      if (response.data.success) {
        alert("Email sent successfully!");
        setEmailForm({ to: '', subject: '', message: '' });
      } else {
        alert("Failed to send email");
      }
    } catch (error) {
      alert("Error sending email");
    }
  };

  const handleSendSMS = async (phone: string) => {
    if (!phone) {
      alert('No phone number available for this parent');
      return;
    }
    
    try {
      const response = await axios.post('/api/messaging/send-sms', {
        recipients: [phone],
        message: 'Important notification from Parent Communication Hub. Please check the portal for updates.',
        sendToAll: false
      });
      
      if (response.data.success) {
        alert('SMS sent successfully!');
      } else {
        alert('Failed to send SMS: ' + response.data.error);
      }
    } catch (err) {
      alert('Error sending SMS');
    }
  };

  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowPerformers = students.filter(s => s.attendance < 75);
  const avgAttendance = students.length > 0 
    ? (students.reduce((acc, s) => acc + (Number(s.attendance) || 0), 0) / students.length).toFixed(1)
    : 0;

  const chartData = students.slice(0, 5).map(s => ({
    name: s.name,
    attendance: Number(s.attendance) || 0
  }));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {activeTab === 'dashboard' ? (
        <>
          {/* Dashboard Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Admin Dashboard</h1>
              <p className="text-indigo-200/80 font-bold mt-1 tracking-wider uppercase text-xs">System overview and analytics</p>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8 relative">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 z-0" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }} className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-400 rounded-full mix-blend-multiply filter blur-2xl opacity-30 z-0" />
            
            <StatCard icon={<Users className="text-white" size={32} />} label="Total Students" value={students.length} gradient="from-blue-600 via-indigo-600 to-violet-600" shadow="shadow-indigo-500/40" delay={0.1} />
            <StatCard icon={<AlertCircle className="text-white" size={32} />} label="Low Attendance" value={lowPerformers.length} gradient="from-rose-500 via-red-500 to-orange-500" shadow="shadow-rose-500/40" delay={0.2} />
            <StatCard icon={<TrendingUp className="text-white" size={32} />} label="Avg Attendance" value={`${avgAttendance}%`} gradient="from-emerald-500 via-teal-500 to-cyan-500" shadow="shadow-emerald-500/40" delay={0.3} />
            <StatCard icon={<Award className="text-white" size={32} />} label="Top Performers" value="12" gradient="from-amber-400 via-yellow-500 to-orange-500" shadow="shadow-amber-500/40" delay={0.4} />
          </div>

          {/* Email Messaging Section */}
          <div className="bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.2)] border border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Mail className="text-indigo-400" size={28} />
              Send Email to Parents
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-indigo-300 mb-2">Parent Email</label>
                <input
                  type="email"
                  value={emailForm.to}
                  onChange={(e) => setEmailForm({...emailForm, to: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="parent@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-300 mb-2">Subject</label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({...emailForm, subject: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder="Message from Admin"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-indigo-300 mb-2">Message</label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({...emailForm, message: e.target.value})}
                  className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent h-24 resize-none"
                  placeholder="Your child attendance is low..."
                />
              </div>
            </div>
            <button
              onClick={sendEmail}
              className="mt-4 flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg"
            >
              <Send size={18} />
              Send Email
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Charts & Insights */}
            <div className="lg:col-span-2 bg-white/5 backdrop-blur-2xl p-8 rounded-[2rem] shadow-[0_15px_30px_rgba(0,0,0,0.2)] border border-white/10">
              <h2 className="text-xl font-black text-white mb-6 tracking-tight drop-shadow-md">Attendance Overview</h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#818cf8', fontWeight: 'bold' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#818cf8', fontWeight: 'bold' }} />
                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(15,23,42,0.9)', color: 'white', backdropFilter: 'blur(10px)' }} />
                    <Bar dataKey="attendance" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.attendance < 75 ? '#f43f5e' : '#10b981'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-indigo-600 p-6 rounded-2xl shadow-lg shadow-indigo-200 text-white">
                <h3 className="font-bold mb-2">AI Tip of the Day</h3>
                <p className="text-indigo-100 text-sm leading-relaxed">
                  Students with attendance above 85% show a 40% higher average in coding subjects. Consider sending an encouraging message to top performers.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Students Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Student Directory</h1>
              <p className="text-indigo-200/80 font-bold mt-1 tracking-wider uppercase text-xs">Manage students and monitor performance</p>
            </div>
            <div className="flex gap-4">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.85, rotate: 5 }}
                onClick={handleExport}
                className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-2xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all shadow-[0_10px_20px_-5px_rgba(16,185,129,0.5)] border-b-[4px] border-emerald-700 active:border-b-0 active:translate-y-1"
              >
                <Download size={18} /> Export Excel
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.85, rotate: -5 }}
                onClick={() => {
                  const nextRoll = generateNextRollNumber(students);
                  setNewStudent(prev => ({ ...prev, rollNumber: nextRoll }));
                  setShowAddModal(true);
                }} 
                className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-2.5 rounded-2xl font-bold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)] border-b-[4px] border-indigo-800 active:border-b-0 active:translate-y-1"
              >
                <UserPlus size={18} /> Add Student
              </motion.button>
            </div>
          </div>
          
          {/* Full List */}
          <div className="bg-white/5 backdrop-blur-3xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black/10">
              <h2 className="text-xl font-black text-white drop-shadow-sm tracking-tight">All Students</h2>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-4 h-4" />
                <input type="text" placeholder="Search students..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none w-72 text-white placeholder-white/30 shadow-inner transition-all" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left bg-transparent">
                <thead className="bg-black/30 text-indigo-300 text-[11px] font-black uppercase tracking-widest border-b border-white/10">
                  <tr>
                    <th className="px-6 py-5">Student</th>
                    <th className="px-6 py-5">Roll No</th>
                    <th className="px-6 py-5">Department</th>
                    <th className="px-6 py-5">Parent</th>
                    <th className="px-6 py-5">Phone</th>
                    <th className="px-6 py-5 text-center">Attendance</th>
                    <th className="px-6 py-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-5"><div className="font-bold text-white text-sm drop-shadow-sm">{student.name}</div></td>
                      <td className="px-6 py-5 text-indigo-200/80 font-medium text-sm tracking-wide">{student.rollNumber}</td>
                      <td className="px-6 py-5"><div className="font-bold text-indigo-300 text-sm">{student.department}</div></td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-white text-sm drop-shadow-sm">{student.parentName || 'N/A'}</div>
                        <div className="text-[11px] text-indigo-200/60 font-medium tracking-wide mt-1">{student.parentEmail || ''}</div>
                        <div className="text-[11px] text-green-400/80 font-medium tracking-wide mt-1">{student.parentPhone || ''}</div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <span className={`text-[11px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-inner border ${(Number(student.attendance) || 0) < 75 ? 'text-rose-400 bg-rose-500/10 border-rose-500/20' : 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'}`}>
                            {Number(student.attendance) || 0}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2">
                          <button onClick={() => setViewStudent(student)} className="p-2 text-white/40 hover:text-blue-400 hover:bg-blue-500/20 rounded-lg transition-all border border-transparent hover:border-blue-500/30 shadow-inner opacity-60 group-hover:opacity-100"><Eye size={16} /></button>
                          <button onClick={() => setEditStudent(student)} className="p-2 text-white/40 hover:text-indigo-400 hover:bg-indigo-500/20 rounded-lg transition-all border border-transparent hover:border-indigo-500/30 shadow-inner opacity-60 group-hover:opacity-100"><Edit2 size={16} /></button>
                          <button onClick={() => handleSendEmail(student.parentEmail)} className="p-2 text-white/40 hover:text-green-400 hover:bg-green-500/20 rounded-lg transition-all border border-transparent hover:border-green-500/30 shadow-inner opacity-60 group-hover:opacity-100" title="Send Email">📧</button>
                          <button onClick={() => handleSendSMS(student.parentPhone)} className="p-2 text-white/40 hover:text-purple-400 hover:bg-purple-500/20 rounded-lg transition-all border border-transparent hover:border-purple-500/30 shadow-inner opacity-60 group-hover:opacity-100" title="Send SMS">📱</button>
                          <button onClick={() => handleDelete(student._id)} className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-all border border-transparent hover:border-rose-500/30 shadow-inner opacity-60 group-hover:opacity-100"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl"
          >
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input 
                    type="text" 
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({...newStudent, name: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                  <input type="text" required value={newStudent.rollNumber} onChange={(e) => setNewStudent({...newStudent, rollNumber: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Name</label>
                  <input type="text" required value={newStudent.parentName} onChange={(e) => setNewStudent({...newStudent, parentName: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Email</label>
                  <input type="email" required value={newStudent.parentEmail} onChange={(e) => setNewStudent({...newStudent, parentEmail: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Parent Phone</label>
                  <input type="tel" required value={newStudent.parentPhone} onChange={(e) => setNewStudent({...newStudent, parentPhone: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="+1234567890" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input 
                  type="text" 
                  required
                  value={newStudent.department}
                  onChange={(e) => setNewStudent({...newStudent, department: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Attendance (%)</label>
                  <input 
                    type="number" 
                    required
                    value={newStudent.attendance}
                    onChange={(e) => setNewStudent({...newStudent, attendance: parseInt(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Behavior</label>
                  <select 
                    value={newStudent.behavior}
                    onChange={(e) => setNewStudent({...newStudent, behavior: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button 
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                  Save Student
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Student Modal */}
      {viewStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl relative">
             <button onClick={() => setViewStudent(null)} className="absolute top-4 right-4 text-slate-400 hover:text-rose-500 font-bold">Close</button>
             <h2 className="text-2xl font-bold text-slate-900 mb-6">{viewStudent.name} Details</h2>
             <div className="space-y-3 text-sm">
               <p><strong className="w-32 inline-block text-slate-500">Roll Number:</strong> {viewStudent.rollNumber}</p>
               <p><strong className="w-32 inline-block text-slate-500">Department:</strong> {viewStudent.department}</p>
               <p><strong className="w-32 inline-block text-slate-500">Attendance:</strong> {viewStudent.attendance}%</p>
               <p><strong className="w-32 inline-block text-slate-500">Behavior:</strong> {viewStudent.behavior}</p>
               <p><strong className="w-32 inline-block text-slate-500">Parent Name:</strong> {viewStudent.parentName || 'N/A'}</p>
               <p><strong className="w-32 inline-block text-slate-500">Parent Email:</strong> {viewStudent.parentEmail || 'N/A'}</p>
               <div className="mt-4 p-4 bg-indigo-50 rounded-xl">
                 <strong className="block text-indigo-900 mb-2">AI Feedback</strong>
                 <p className="text-indigo-800"><strong>Strengths:</strong> {viewStudent.aiFeedback?.strengths?.join(', ') || 'N/A'}</p>
                 <p className="text-indigo-800"><strong>Weaknesses:</strong> {viewStudent.aiFeedback?.weaknesses?.join(', ') || 'N/A'}</p>
               </div>
             </div>
          </motion.div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editStudent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Edit Student</h2>
            <form onSubmit={handleUpdateStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input type="text" required value={editStudent.name} onChange={(e) => setEditStudent({...editStudent, name: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Roll Number</label>
                  <input type="text" required value={editStudent.rollNumber} onChange={(e) => setEditStudent({...editStudent, rollNumber: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                <input type="text" required value={editStudent.department} onChange={(e) => setEditStudent({...editStudent, department: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Attendance (%)</label>
                  <input type="number" required value={editStudent.attendance || 0} onChange={(e) => setEditStudent({...editStudent, attendance: parseInt(e.target.value) || 0})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Behavior</label>
                  <select value={editStudent.behavior} onChange={(e) => setEditStudent({...editStudent, behavior: e.target.value})} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Average">Average</option>
                    <option value="Needs Improvement">Needs Improvement</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button type="button" onClick={() => setEditStudent(null)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200">Update Student</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon, label, value, gradient, shadow, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 30, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ delay, type: "spring", bounce: 0.6 }}
    whileHover={{ scale: 1.05, y: -5 }}
    whileTap={{ scale: 0.9, rotate: [0, -5, 5, 0] }}
    className={`bg-gradient-to-tr ${gradient} p-8 rounded-3xl shadow-[0_15px_35px_-5px_rgba(0,0,0,0.3)] shadow-${shadow} border-b-8 border-black/20 flex flex-col items-start gap-4 cursor-pointer relative overflow-hidden group z-10`}
  >
    <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }} className="absolute -right-6 -top-6 bg-white/20 w-32 h-32 rounded-full blur-2xl group-hover:bg-white/30 transition-all" />
    <div className={`p-4 rounded-2xl bg-white/20 backdrop-blur-md shadow-inner border border-white/20`}>
      {icon}
    </div>
    <div className="z-10">
      <p className="text-white/90 text-sm font-black uppercase tracking-widest mb-1">{label}</p>
      <p className="text-4xl font-extrabold text-white drop-shadow-md">{value}</p>
    </div>
  </motion.div>
);
