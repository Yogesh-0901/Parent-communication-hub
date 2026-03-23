import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.tsx';
import { 
  Plus, 
  Megaphone, 
  Trash2, 
  Calendar, 
  Users, 
  User,
  Send,
  Bell,
  Pencil
} from 'lucide-react';
import { motion } from 'motion/react';

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    message: '',
    targetType: 'all',
    targetId: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
    if (user?.role === 'admin') {
      fetchStudents();
    }
  }, [user]);

  const fetchAnnouncements = async () => {
    try {
      const res = await axios.get('/api/announcements');
      setAnnouncements(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await axios.get('/api/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`/api/announcements/${editingId}`, newAnnouncement);
      } else {
        await axios.post('/api/announcements', newAnnouncement);
      }
      setShowAddModal(false);
      setEditingId(null);
      fetchAnnouncements();
      setNewAnnouncement({ title: '', message: '', targetType: 'all', targetId: '' });
    } catch (err) {
      alert('Error saving announcement');
    }
  };

  const openEditModal = (ann: any) => {
    setNewAnnouncement({
      title: ann.title, message: ann.message, targetType: ann.targetType, targetId: ann.targetId || ''
    });
    setEditingId(ann.id);
    setShowAddModal(true);
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`/api/announcements/${id}`);
        fetchAnnouncements();
      } catch (err) {
        alert('Error deleting announcement');
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-black text-white drop-shadow-lg tracking-tight">Announcements</h1>
          <p className="text-indigo-200/80 font-medium mt-1 tracking-wide">Stay updated with the latest news and alerts</p>
        </div>
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 px-6 py-3 rounded-2xl text-white font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
          >
            <Plus size={20} />
            Create Announcement
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {announcements.length > 0 ? (
          announcements.map((ann) => (
            <motion.div 
              key={ann.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] shadow-[0_15px_30px_-5px_rgba(0,0,0,0.3)] border border-white/20 flex flex-col h-full group transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-gradient-to-tr from-indigo-500/30 to-purple-500/30 rounded-2xl text-indigo-100 border border-white/10 shadow-inner">
                  <Megaphone size={24} />
                </div>
                {user?.role === 'admin' && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => openEditModal(ann)}
                      className="p-2 text-white/50 hover:text-indigo-400 hover:bg-indigo-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Pencil size={18} />
                    </button>
                    <button 
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="p-2 text-white/50 hover:text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </div>
              <h3 className="text-xl font-black text-white mb-2 drop-shadow-md">{ann.title}</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-6 flex-1 font-medium">{ann.message}</p>
              <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  <Calendar size={14} />
                  {new Date(ann.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-indigo-200 bg-indigo-500/30 px-3 py-1.5 rounded-full border border-indigo-400/30">
                  {ann.targetType === 'all' ? (
                    <><Users size={12} /> All Students</>
                  ) : (
                    <><User size={12} /> Specific Student</>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-24 h-24 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center text-white/30 mx-auto mb-6 border border-white/10 shadow-inner">
              <Bell size={48} />
            </div>
            <h2 className="text-2xl font-black text-white mb-2 tracking-tight">No announcements yet</h2>
            <p className="text-indigo-200/60 font-medium">Check back later for updates from the administration.</p>
          </div>
        )}
      </div>

      {/* Create/Edit Announcement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#141d2e] border border-white/10 rounded-[2.5rem] p-8 w-full max-w-lg shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]"
          >
            <h2 className="text-2xl font-black text-white mb-6 tracking-tight drop-shadow-md">
              {editingId ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-indigo-300 uppercase mb-2 tracking-widest">Title</label>
                <input 
                  type="text" 
                  required
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 placeholder-white/20 shadow-inner"
                  placeholder="e.g. Holiday Notice"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-300 uppercase mb-2 tracking-widest">Message</label>
                <textarea 
                  required
                  rows={4}
                  value={newAnnouncement.message}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, message: e.target.value})}
                  className="w-full px-5 py-4 bg-black/30 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 resize-none placeholder-white/20 shadow-inner"
                  placeholder="Type your message here..."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-indigo-300 uppercase mb-2 tracking-widest">Target Audience</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewAnnouncement({...newAnnouncement, targetType: 'all', targetId: ''})}
                    className={`px-4 py-3.5 rounded-2xl text-sm font-black tracking-widest uppercase border transition-all shadow-inner ${
                      newAnnouncement.targetType === 'all' 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_5px_15px_rgba(79,70,229,0.4)]' 
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    All Students
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAnnouncement({...newAnnouncement, targetType: 'student'})}
                    className={`px-4 py-3.5 rounded-2xl text-sm font-black tracking-widest uppercase border transition-all shadow-inner ${
                      newAnnouncement.targetType === 'student' 
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-[0_5px_15px_rgba(79,70,229,0.4)]' 
                        : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    Specific
                  </button>
                </div>
              </div>
              {newAnnouncement.targetType === 'student' && (
                <div>
                  <label className="block text-xs font-black text-indigo-300 uppercase mb-2 tracking-widest">Select Student</label>
                  <select
                    required
                    value={newAnnouncement.targetId}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, targetId: e.target.value})}
                    className="w-full px-5 py-4 bg-black/40 border border-white/10 rounded-2xl text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner"
                  >
                    <option value="" className="text-slate-900">Choose a student...</option>
                    {students.map(s => (
                      <option key={s._id} value={s._id} className="text-slate-900">{s.name} ({s.rollNumber})</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="flex gap-4 mt-10">
                <button 
                  type="button"
                  onClick={() => { setShowAddModal(false); setEditingId(null); setNewAnnouncement({ title: '', message: '', targetType: 'all', targetId: '' }); }}
                  className="flex-1 px-4 py-4 border border-white/10 rounded-2xl text-white/60 font-black tracking-widest uppercase hover:bg-white/5 hover:text-white transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="flex-1 px-4 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-black tracking-widest uppercase shadow-[0_10px_20px_rgba(99,102,241,0.4)] flex items-center justify-center gap-2 hover:from-indigo-400 hover:to-purple-400 border-b-[4px] border-indigo-800 active:border-b-0 active:translate-y-[4px] transition-all"
                >
                  <Send size={18} />
                  {editingId ? 'Save' : 'Publish'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
