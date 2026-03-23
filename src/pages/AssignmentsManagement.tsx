import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { Plus, Trash2, BookOpen, Calendar } from 'lucide-react';

export const AssignmentsManagement: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', subject: '', dueDate: '' });

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const fetchAssignments = async () => {
    try {
      const res = await axios.get('/api/assignments');
      setAssignments(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post('/api/assignments', newAssignment);
      setShowModal(false);
      fetchAssignments();
      setNewAssignment({ title: '', description: '', subject: '', dueDate: '' });
    } catch (err) {
      alert('Error creating assignment');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`/api/assignments/${id}`);
      fetchAssignments();
    } catch (err) {
      alert('Error deleting assignment');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white drop-shadow-md tracking-tight">Assignments</h1>
          <p className="text-indigo-200/80 font-bold mt-1 tracking-wider uppercase text-xs">{user?.role === 'admin' ? 'Manage student assignments' : 'View your pending tasks'}</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 rounded-2xl text-white font-black uppercase tracking-widest text-[11px] hover:from-indigo-400 hover:to-purple-400 transition-all shadow-[0_10px_20px_-5px_rgba(99,102,241,0.5)] border-b-[4px] border-indigo-800 active:border-b-0 active:translate-y-1"
          >
            <Plus size={16} />
            Create Assignment
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments.map(a => (
          <div key={a.id} className="bg-[#141d2e]/80 backdrop-blur-3xl p-6 rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 relative group hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] transition-all">
            {user?.role === 'admin' && (
              <button 
                onClick={() => handleDelete(a.id)}
                className="absolute top-5 right-5 p-2 text-white/40 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all bg-rose-500/10 hover:bg-rose-500/20 rounded-xl"
              >
                <Trash2 size={16} />
              </button>
            )}
            <div className="flex items-center gap-2 text-indigo-300 mb-5 bg-indigo-500/20 border border-indigo-500/30 w-fit px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-inner">
              <BookOpen size={14} />
              {a.subject}
            </div>
            <h3 className="font-black text-xl text-white mb-2 drop-shadow-sm">{a.title}</h3>
            <p className="text-indigo-200/80 text-sm mb-6 line-clamp-3 font-medium">{a.description}</p>
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-rose-400 bg-rose-500/20 border border-rose-500/30 w-fit px-4 py-1.5 rounded-xl shadow-inner mt-auto">
              <Calendar size={14} />
              Due: {new Date(a.dueDate).toLocaleDateString()}
            </div>
          </div>
        ))}
        {assignments.length === 0 && (
          <div className="col-span-full py-16 text-center text-white/40 font-medium text-lg italic bg-white/5 backdrop-blur-xl rounded-[2rem] border border-dashed border-white/20">
            No active assignments.
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-[#141d2e] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]">
            <h2 className="text-2xl font-black text-white mb-6 drop-shadow-md tracking-tight">Create Assignment</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">Title</label>
                <input required value={newAssignment.title} onChange={e => setNewAssignment({...newAssignment, title: e.target.value})} className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-white/20 shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">Subject</label>
                <input required value={newAssignment.subject} onChange={e => setNewAssignment({...newAssignment, subject: e.target.value})} className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-white/20 shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">Due Date</label>
                <input type="date" required value={newAssignment.dueDate} onChange={e => setNewAssignment({...newAssignment, dueDate: e.target.value})} className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-indigo-300 uppercase mb-2 tracking-widest">Description</label>
                <textarea required rows={3} value={newAssignment.description} onChange={e => setNewAssignment({...newAssignment, description: e.target.value})} className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-white/20 shadow-inner resize-none" />
              </div>
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-4 border border-white/10 rounded-2xl text-white/60 font-black tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-black tracking-widest uppercase shadow-[0_10px_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 hover:from-indigo-400 hover:to-purple-400 border-b-[4px] border-indigo-800 active:border-b-0 active:translate-y-[4px] transition-all">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
