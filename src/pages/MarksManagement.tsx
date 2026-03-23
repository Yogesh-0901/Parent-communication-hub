import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { Plus, Search, Trash2, Save, ChevronRight, GraduationCap, BookOpen, Users } from 'lucide-react';

const SEMESTER_SUBJECTS: any = {
  'Semester 1': ['Mathematics I', 'Physics', 'Programming in C', 'Engineering Graphics'],
  'Semester 2': ['Mathematics II', 'Chemistry', 'Data Structures', 'Basic Electronics'],
  'Semester 3': ['Mathematics III', 'Digital Logic', 'OOP with Java', 'Computer Organization'],
  'Semester 4': ['Operating Systems', 'Database Management', 'Design of Algorithms', 'Software Engineering'],
  'Semester 5': ['Computer Networks', 'Automata Theory', 'Web Technology', 'Microprocessors'],
  'Semester 6': ['Compiler Design', 'Artificial Intelligence', 'Machine Learning', 'Cloud Computing'],
  'Semester 7': ['Cryptography', 'Data Science', 'Big Data Analytics', 'Project Phase I'],
  'Semester 8': ['Professional Ethics', 'Elective II', 'Elective III', 'Project Phase II']
};

export const MarksManagement: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [semester, setSemester] = useState('Semester 1');
  const [marks, setMarks] = useState<any[]>([]);
  const [newMark, setNewMark] = useState({ subject: '', internal1Score: 0, internal1Max: 50, internal2Score: 0, internal2Max: 50, externalScore: 0, externalMax: 100 });
  
  // Parent Search
  const [searchName, setSearchName] = useState('');
  const [searchRoll, setSearchRoll] = useState('');

  useEffect(() => {
    fetchStudents();
    fetchAllMarks();
  }, [user]);

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) {}
  };

  const fetchAllMarks = async () => {
    try {
      if (user?.role === 'admin') return;
      // Fetch all marks for parents to view
      const res = await axios.get('/api/students'); // We can get students to build the table
      setStudents(res.data);
      if (user?.linkedStudentId) {
         fetchMarks(user.linkedStudentId);
      }
    } catch(err) {}
  };

  const fetchMarks = async (studentId: string) => {
    try {
      const res = await axios.get(`/api/marks/${studentId}`);
      setMarks(res.data);
    } catch (err) {}
  };

  const handleStudentSelect = (studentId: string) => {
    setSelectedStudent(studentId);
    fetchMarks(studentId);
  };

  const handleSaveMark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await axios.post('/api/marks', { studentId: selectedStudent, semester, ...newMark });
      fetchMarks(selectedStudent);
      setNewMark({ subject: '', internal1Score: 0, internal1Max: 50, internal2Score: 0, internal2Max: 50, externalScore: 0, externalMax: 100 });
    } catch (err) { alert('Error saving mark'); }
  };

  const handleDeleteMark = async (id: string) => {
    try {
      await axios.delete(`/api/marks/${id}`);
      if (selectedStudent) fetchMarks(selectedStudent);
    } catch (err) { alert('Error deleting mark'); }
  };

  const filteredMarks = marks.filter(m => m.semester === semester);
  const semesters = Object.keys(SEMESTER_SUBJECTS);
  const subjects = SEMESTER_SUBJECTS[semester] || [];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Academic Marks</h1>
          <p className="text-indigo-200/80 font-bold mt-1 tracking-wider uppercase text-xs">Manage internal and external marks by semester</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="col-span-1 bg-[#141d2e]/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden h-fit max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="p-5 bg-black/20 border-b border-white/10 font-black text-indigo-300 flex flex-col gap-3 sticky top-0 uppercase tracking-widest text-xs">
             <div className="flex items-center gap-2"><Users size={18} /> {user?.role === 'admin' ? 'Select Student' : 'Find Student'}</div>
             {user?.role !== 'admin' && (
               <div className="flex flex-col gap-3 mt-2">
                 <input type="text" placeholder="Search by Name" value={searchName} onChange={e => setSearchName(e.target.value)} className="w-full px-4 py-2 text-sm bg-black/30 border border-white/10 text-white placeholder-white/20 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all"/>
                 <input type="text" placeholder="Search by Roll No" value={searchRoll} onChange={e => setSearchRoll(e.target.value)} className="w-full px-4 py-2 text-sm bg-black/30 border border-white/10 text-white placeholder-white/20 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner transition-all"/>
               </div>
             )}
          </div>
          <div className="divide-y divide-white/5">
            {students
              .filter(s => {
                if (user?.role === 'admin') return true;
                if (!searchName && !searchRoll) return true; // Show all to parents by default based on prompt
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

        <div className="col-span-3 space-y-6">
          {selectedStudent ? (
            <>
              <div className="bg-[#141d2e]/80 backdrop-blur-3xl p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-xl text-indigo-300 border border-white/10 shadow-inner"><BookOpen size={24} /></div>
                  <div>
                    <h2 className="text-2xl font-black text-white drop-shadow-sm">{students.find(s => s._id === selectedStudent)?.name}'s Performance</h2>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  {semesters.map(sem => (
                    <button key={sem} onClick={() => setSemester(sem)} className={`px-5 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all shadow-inner ${semester === sem ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-[0_5px_15px_rgba(99,102,241,0.4)]' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white border border-white/5'}`}>{sem}</button>
                  ))}
                </div>
              </div>

              {user?.role === 'admin' && (
                <div className="bg-[#141d2e]/80 backdrop-blur-3xl p-6 rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.2)] border border-white/10">
                  <h3 className="font-black text-white text-lg tracking-tight drop-shadow-sm mb-6 flex items-center gap-3"><span className="p-1.5 bg-indigo-500/20 rounded-md border border-indigo-500/30 text-indigo-300"><Plus size={16}/></span> Add/Update Mark</h3>
                  <form onSubmit={handleSaveMark} className="grid grid-cols-1 md:grid-cols-4 gap-5 items-end">
                    <div className="col-span-1">
                       <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">Subject</label>
                       <select required value={newMark.subject} onChange={e => setNewMark({...newMark, subject: e.target.value})} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 text-white shadow-inner">
                         <option value="" className="text-slate-900">Select subject...</option>
                         {subjects.map((sub: string) => <option key={sub} value={sub} className="text-slate-900">{sub}</option>)}
                       </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">Internal 1 (/{newMark.internal1Max})</label>
                      <input type="number" required value={newMark.internal1Score} onChange={e => setNewMark({...newMark, internal1Score: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm outline-none text-white shadow-inner focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">Internal 2 (/{newMark.internal2Max})</label>
                      <input type="number" required value={newMark.internal2Score} onChange={e => setNewMark({...newMark, internal2Score: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm outline-none text-white shadow-inner focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">External (/{newMark.externalMax})</label>
                      <input type="number" required value={newMark.externalScore} onChange={e => setNewMark({...newMark, externalScore: parseInt(e.target.value)||0})} className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-xl text-sm outline-none text-white shadow-inner focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="col-span-1 md:col-span-4 flex justify-end mt-4">
                      <button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 h-12 rounded-xl font-black uppercase tracking-widest text-[11px] shadow-[0_10px_20px_rgba(99,102,241,0.4)] border-b-[4px] border-indigo-800 active:border-b-0 active:translate-y-1 transition-all flex items-center justify-center gap-2"><Save size={16} /> Save Marks</button>
                    </div>
                  </form>
                </div>
              )}

              <div className="bg-[#141d2e]/80 backdrop-blur-3xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left bg-transparent">
                    <thead className="bg-black/30 text-indigo-300 text-[11px] font-black uppercase tracking-widest border-b border-white/10">
                      <tr>
                        <th className="px-6 py-5">Subject</th>
                        <th className="px-6 py-5">Internal 1</th>
                        <th className="px-6 py-5">Internal 2</th>
                        <th className="px-6 py-5">Semester</th>
                        <th className="px-6 py-5">Total</th>
                        {user?.role === 'admin' && <th className="px-6 py-5">Actions</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredMarks.map(m => (
                        <tr key={m.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-6 py-5 font-bold text-white text-sm">{m.subject}</td>
                          <td className="px-6 py-5 text-indigo-200/60 font-medium text-sm tracking-wide">{m.internal1Score}/{m.internal1Max}</td>
                          <td className="px-6 py-5 text-indigo-200/60 font-medium text-sm tracking-wide">{m.internal2Score}/{m.internal2Max}</td>
                          <td className="px-6 py-5 text-indigo-200/60 font-medium text-sm tracking-wide">{m.externalScore}/{m.externalMax}</td>
                          <td className="px-6 py-5">
                            <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 drop-shadow-sm text-sm">{m.score}/{m.maxScore}</span>
                          </td>
                          {user?.role === 'admin' && (
                            <td className="px-6 py-5">
                              <button onClick={() => handleDeleteMark(m.id)} className="p-2 text-white/40 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all shadow-inner border border-transparent hover:border-rose-500/30"><Trash2 size={16} /></button>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredMarks.length === 0 && (
                        <tr><td colSpan={6} className="px-6 py-16 text-center text-white/40 italic text-lg font-medium">No marks recorded.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white/5 backdrop-blur-2xl p-12 rounded-[2rem] shadow-inner border border-white/10 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center text-indigo-300 mb-6 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]"><GraduationCap size={48} /></div>
              <h2 className="text-2xl font-black text-white mb-2 drop-shadow-md tracking-tight">Select a student</h2>
              <p className="text-indigo-200/80 max-w-sm font-medium">Choose a student to securely view or manage their marks and academic performance.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
