import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext.tsx';
import { useSocket } from '../context/SocketContext.tsx';
import { Send, Search, MessageSquare, Paperclip, FileText, Download, Languages, Sparkles, Loader2, Globe, Check, CheckCheck, Pencil, Trash2 } from 'lucide-react';

const SUPPORTED_LANGUAGES = ['Tamil', 'Hindi', 'Telugu', 'Malayalam', 'Spanish', 'French'];

export const ChatPage: React.FC = () => {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [contacts, setContacts] = useState<any[]>([]);
  const [parentContacts, setParentContacts] = useState<any[]>([]);
  const [studentContacts, setStudentContacts] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'parents' | 'students'>('parents');
  const [selectedContact, setSelectedContact] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Translation feature states
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isTranslating, setIsTranslating] = useState<string | null>(null);
  const [targetLanguage, setTargetLanguage] = useState('Tamil');
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchInitialData();
  }, [user]);

  const fetchInitialData = async () => {
    try {
      if (user?.role === 'admin') {
        const studentRes = await axios.get('/api/students');
        const pContacts = studentRes.data.map((s: any) => ({
          _id: 'parent_' + s._id,
          name: s.parentName ? `${s.parentName} (Parent of ${s.name})` : `Parent of ${s.name}`,
          role: 'parent'
        }));
        const sContacts = studentRes.data.map((s: any) => ({
          _id: 'student_' + s._id,
          name: `${s.name} (${s.rollNumber})`,
          role: 'student'
        }));
        setParentContacts([{ _id: 'all', name: 'All Parents (Broadcast)', role: 'parent' }, ...pContacts]);
        setStudentContacts([{ _id: 'all_students', name: 'All Students (Broadcast)', role: 'student' }, ...sContacts]);
      } else {
        const res = await axios.get('/api/auth/users');
        const admin = res.data.find((u: any) => u.role === 'admin');
        if (admin) setContacts([admin]);
      }
    } catch (err) {}
  };

  useEffect(() => {
    if (selectedContact) {
      fetchMessages();
    }
  }, [selectedContact]);

  useEffect(() => {
    if (socket) {
      socket.on('receiveMessage', (data: any) => {
        if (selectedContact && data.senderId === selectedContact._id) {
          setMessages(prev => [...prev, data]);
        }
      });
    }
    return () => { if (socket) socket.off('receiveMessage'); };
  }, [socket, selectedContact]);

  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/messages/${selectedContact._id}`);
      setMessages(res.data);
    } catch (err) {}
  };

  const handleTranslate = async (msgId: string, text: string) => {
    setIsTranslating(msgId);
    try {
      const langMap: Record<string, string> = {
        'Tamil': 'ta',
        'Hindi': 'hi',
        'Telugu': 'te',
        'Malayalam': 'ml',
        'Kannada': 'kn',
        'Spanish': 'es',
        'French': 'fr'
      };
      const tl = langMap[targetLanguage] || 'ta';
      
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const data = await res.json();
      
      if (data && data[0]) {
        const translatedText = data[0].map((t: any) => t[0]).join('');
        setTranslations(prev => ({ ...prev, [msgId]: translatedText }));
      } else {
        throw new Error("Invalid translation response");
      }
    } catch (err) {
      alert('Translation failed. Please try again or check connection.');
    } finally {
      setIsTranslating(null);
    }
  };

  const handleEditMessage = async (msgId: string) => {
    if (!editingText.trim() || !msgId) return;
    try {
      await axios.put(`/api/messages/${msgId}`, { message: editingText });
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, message: editingText } : m));
      setEditingMessageId(null);
      setEditingText('');
    } catch (err) {
      alert('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await axios.delete(`/api/messages/${msgId}`);
      setMessages(prev => prev.filter(m => m.id !== msgId));
    } catch (err) {
      alert('Failed to delete message');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { alert('File is too large! Maximum 5MB.'); return; }
      setFileName(file.name);
      setFileType(file.type);
      const reader = new FileReader();
      reader.onload = (ev) => { setFileBase64(ev.target?.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !fileBase64) || !selectedContact) return;

    try {
      const payload = { 
        receiverId: selectedContact._id, 
        message: newMessage, 
        fileUrl: fileBase64, 
        fileName, 
        fileType
      };
      const res = await axios.post('/api/messages', payload);

      setMessages(prev => [...prev, res.data]);

      setNewMessage(''); setFileBase64(null); setFileName(''); setFileType('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      alert('Error sending message: ' + (err.response?.data?.error || err.message));
    }
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  const displayContacts = user?.role === 'admin' ? (activeTab === 'parents' ? parentContacts : studentContacts) : contacts;
  const filteredContacts = displayContacts.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Fallback avatar generator
  const getAvatar = (name: string, isBroadcast: boolean) => {
    if (isBroadcast) return "https://api.dicebear.com/7.x/shapes/svg?seed=broadcast&backgroundColor=eef2ff";
    return `https://api.dicebear.com/7.x/notionists/svg?seed=${name.replace(/\s/g, '')}&backgroundColor=f8fafc`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
      className="h-[calc(100vh-100px)] flex bg-[#1e293b]/50 backdrop-blur-3xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.3)] border border-white/10 overflow-hidden m-6 relative"
    >
      <div className="absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-gradient-to-tr from-purple-500/20 via-indigo-500/20 to-pink-500/20 rounded-full blur-[80px] opacity-40 pointer-events-none" />
      
      {/* Sidebar Contacts */}
      <div className="w-80 border-r border-white/10 flex flex-col bg-black/20">
        <div className="p-6 pb-4 bg-gradient-to-b from-white/5 to-transparent border-b border-white/10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300 flex items-center gap-2 drop-shadow-md">
              <Sparkles size={20} className="text-indigo-400" /> Messaging Hub
            </h2>
          </div>
          
          {user?.role === 'admin' && (
            <div className="flex bg-black/40 p-1.5 rounded-2xl mb-5 shadow-inner border border-white/5">
              <button 
                onClick={() => { setActiveTab('parents'); setSelectedContact(null); }} 
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'parents' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Parents
              </button>
              <button 
                onClick={() => { setActiveTab('students'); setSelectedContact(null); }} 
                className={`flex-1 py-2 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'students' ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-md text-white' : 'text-slate-400 hover:text-white'}`}
              >
                Students
              </button>
            </div>
          )}
          
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 w-5 h-5" />
            <input 
              type="text" placeholder="Search contacts..." 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
              className="w-full pl-11 pr-4 py-3 bg-black/30 border border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all shadow-inner text-white placeholder-white/30" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          {filteredContacts.map((contact, index) => {
            const isBroadcast = contact._id === 'all' || contact._id === 'all_students';
            const isActive = selectedContact?._id === contact._id;
            return (
              <motion.button 
                key={contact._id} 
                initial={{ opacity: 0, x: -10 }} 
                animate={{ opacity: 1, x: 0 }} 
                transition={{ delay: index * 0.03 }}
                onClick={() => setSelectedContact(contact)} 
                className={`w-full p-4 flex items-center gap-4 rounded-2xl transition-all relative overflow-hidden group border ${isActive ? 'bg-white/10 border-white/20 shadow-[0_5px_15px_rgba(0,0,0,0.2)]' : 'border-transparent hover:bg-white/5'}`}
              >
                {isActive && <motion.div layoutId="contactIndicator" className="absolute left-0 top-1/4 bottom-1/4 w-[3px] bg-indigo-400 rounded-r-md shadow-[0_0_10px_rgb(129,140,248)]" />}
                
                <div className="relative shrink-0">
                  <img src={getAvatar(contact.name, isBroadcast)} alt="" className="w-12 h-12 rounded-full border border-white/20 shadow-md bg-white/10" />
                  {isBroadcast && <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-tr from-rose-500 to-orange-400 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm"><MessageSquare size={10} className="text-white"/></div>}
                </div>
                
                <div className="text-left overflow-hidden">
                  <div className={`font-black truncate text-sm transition-colors ${isActive ? 'text-white' : 'text-slate-300 group-hover:text-indigo-300'}`}>
                    {contact.name}
                  </div>
                  <div className={`text-[10px] font-black uppercase mt-1 tracking-widest ${isBroadcast ? 'text-rose-400' : 'text-indigo-400/80'}`}>
                    {contact.role}
                  </div>
                </div>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-transparent relative w-full">
        {selectedContact ? (
          <>
            <div className="p-4 px-6 bg-white/5 backdrop-blur-3xl border-b border-white/10 flex items-center justify-between z-10 sticky top-0 shadow-[0_5px_20px_rgba(0,0,0,0.2)]">
              <div className="flex items-center gap-4">
                <img src={getAvatar(selectedContact.name, selectedContact._id === 'all' || selectedContact._id === 'all_students')} className="w-12 h-12 rounded-full border-2 border-white/20 shadow-md" alt="Contact"/>
                <div>
                  <div className="font-black text-white text-xl drop-shadow-sm">{selectedContact.name}</div>
                  <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest mt-1 text-emerald-400 flex items-center">
                     <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse border border-emerald-200" />
                     {selectedContact._id.includes('all') ? 'Ready to Broadcast' : 'Online & Ready'}
                  </div>
                </div>
              </div>
              
              {user?.role !== 'admin' && (
                <div className="relative">
                  <button onClick={() => setShowLanguagePicker(!showLanguagePicker)} className="flex items-center gap-2 bg-white border border-slate-200 shadow-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-600 hover:text-indigo-600 hover:border-indigo-200 transition-all">
                    <Globe size={14} className="text-indigo-500" /> Translate config: <span className="text-indigo-600">{targetLanguage}</span>
                  </button>
                  <AnimatePresence>
                    {showLanguagePicker && (
                      <motion.div initial={{ opacity: 0, y: 10, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.9 }} className="absolute right-0 top-full mt-2 w-40 bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-200/50 p-2 z-50">
                        {SUPPORTED_LANGUAGES.map(lang => (
                          <button key={lang} onClick={() => { setTargetLanguage(lang); setShowLanguagePicker(false); setTranslations({}); }} className={`w-full text-left px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${targetLanguage === lang ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                            {lang}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex-col-reverse custom-scrollbar">
              {/* Broadcast Welcome Area */}
              {(selectedContact._id === 'all' || selectedContact._id === 'all_students') && messages.length === 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center h-full text-center text-white/50">
                   <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-6 border border-white/10 shadow-[0_0_30px_rgba(99,102,241,0.2)]">
                      <Sparkles size={36} className="text-indigo-300" />
                   </div>
                   <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Broadcast Hub</h3>
                   <p className="max-w-sm text-sm font-medium leading-relaxed">Type a message or drop files below to instantly notify all {activeTab} across the network securely.</p>
                </motion.div>
              )}

              <AnimatePresence initial={false}>
                {messages.map((msg, i) => {
                   const isMe = msg.senderId === user?.id;
                   const msgId = msg.id || i.toString();
                   const hasTranslation = translations[msgId];
                   
                   return (
                    <motion.div 
                      key={msgId} 
                      initial={{ opacity: 0, y: 20, scale: 0.95 }} 
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      className={`flex items-start gap-2 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <div className={`max-w-[80%] px-6 py-4 shadow-lg relative group border border-white/10
                        ${isMe ? 
                          'bg-gradient-to-tr from-indigo-600 via-purple-600 to-indigo-700 text-white rounded-[1.5rem] rounded-tr-sm shadow-[0_10px_25px_-5px_rgba(79,70,229,0.5)]' : 
                          'bg-white/10 backdrop-blur-xl text-white rounded-[1.5rem] rounded-tl-sm shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)]'
                        }`}
                      >
                        {editingMessageId === msgId ? (
                          <div className="flex flex-col gap-2 min-w-[200px]">
                            <textarea 
                              autoFocus 
                              value={editingText} 
                              onChange={(e) => setEditingText(e.target.value)} 
                              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleEditMessage(msgId); } else if (e.key === 'Escape') setEditingMessageId(null); }} 
                              className="w-full bg-white/20 text-white placeholder-white/50 border border-white/30 rounded p-2 outline-none resize-none min-h-[50px] text-sm custom-scrollbar" 
                            />
                            <div className="flex justify-end gap-2">
                               <button onClick={() => setEditingMessageId(null)} className="text-[10px] font-bold uppercase hover:bg-white/20 px-2 py-1 rounded">Cancel</button>
                               <button onClick={() => handleEditMessage(msgId)} className="text-[10px] font-bold uppercase bg-white text-indigo-600 px-2 py-1 rounded shadow-sm">Save</button>
                            </div>
                          </div>
                        ) : hasTranslation ? (
                          <div className="relative">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-50 px-2 py-0.5 rounded-full inline-block mb-2 shadow-inner border border-indigo-100"><Sparkles size={8} className="inline mr-1"/> Translated to {targetLanguage}</span>
                            <p className="text-[15px] leading-relaxed font-medium">{hasTranslation}</p>
                            <div className="mt-3 pt-3 border-t border-slate-100/50 text-xs text-slate-400 opacity-80 whitespace-pre-wrap">{msg.message}</div>
                          </div>
                        ) : (
                          <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap">{msg.message}</p>
                        )}

                        {msg.fileUrl && (
                          <a href={msg.fileUrl} download={msg.fileName} target="_blank" rel="noopener noreferrer" 
                            className={`mt-4 flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold w-fit transition-all 
                              ${isMe ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'}`}
                          >
                            <div className={`p-1.5 rounded-md ${isMe ? 'bg-white/20' : 'bg-white shadow-sm'}`}><FileText size={14} /></div>
                            {msg.fileName} 
                            <Download size={14} className="ml-2 opacity-70" />
                          </a>
                        )}

                        <div className={`text-[10px] mt-2 font-semibold tracking-wider flex items-center gap-1 justify-end ${isMe ? 'text-indigo-100/80' : 'text-slate-400'}`}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                          {isMe && (
                             Date.now() - new Date(msg.timestamp || Date.now()).getTime() > 3000 ? 
                               <CheckCheck size={14} className="text-white" /> : 
                               <Check size={14} className="opacity-70" />
                          )}
                        </div>
                      </div>

                      {/* Floating Actions for My Messages */}
                      {isMe && editingMessageId !== msgId && (
                        <div className="opacity-0 group-hover:opacity-100 flex gap-2 mt-2 transition-opacity">
                          <button onClick={() => { setEditingMessageId(msgId); setEditingText(msg.message); }} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-400 hover:text-indigo-600 transition-colors bg-slate-100 shadow-sm border border-slate-200" title="Edit Message"><Pencil size={12}/></button>
                          <button onClick={() => handleDeleteMessage(msgId)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors bg-slate-100 shadow-sm border border-slate-200" title="Delete Message"><Trash2 size={12}/></button>
                        </div>
                      )}

                      {/* Parent Translate Action Button */}
                      {!isMe && user?.role !== 'admin' && !hasTranslation && (
                        <button 
                          onClick={() => handleTranslate(msgId, msg.message)}
                          disabled={isTranslating === msgId}
                          className="mt-1.5 ml-2 text-[11px] font-bold text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          {isTranslating === msgId ? <Loader2 size={12} className="animate-spin" /> : <Languages size={12} />}
                          {isTranslating === msgId ? `Translating to ${targetLanguage}...` : `Translate to ${targetLanguage}`}
                        </button>
                      )}
                    </motion.div>
                   );
                })}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form Wrapper */}
            <div className="p-5 bg-[#141d2e]/80 backdrop-blur-3xl border-t border-white/5 z-20 w-full shadow-[0_-10px_30px_rgba(0,0,0,0.2)]">
              <div className="max-w-5xl mx-auto w-full">
                {fileName && (
                  <div className="mb-4 px-5 py-3 bg-pink-500/10 border border-pink-500/30 rounded-2xl flex items-center justify-between text-sm text-pink-200 font-bold shadow-inner">
                    <span className="truncate flex items-center gap-2"><FileText size={16}/> {fileName}</span>
                    <button onClick={() => { setFileBase64(null); setFileName(''); setFileType(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="text-rose-400 hover:text-rose-300 bg-rose-500/10 px-3 py-1 rounded-full uppercase text-[10px] tracking-widest">Remove</button>
                  </div>
                )}

                <div className="flex gap-4 items-center">
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".pdf,.xlsx,.xls,.doc,.docx" />
                  
                  <div className="flex-1 bg-black/30 backdrop-blur-xl border border-white/10 rounded-3xl flex items-center px-5 overflow-hidden relative shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:bg-black/50 transition-all">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} type="button" onClick={() => fileInputRef.current?.click()} className="text-white/40 hover:text-pink-400 mr-3 p-2 bg-white/5 rounded-full transition-colors">
                      <Paperclip size={20} />
                    </motion.button>
                    <textarea 
                      value={newMessage} 
                      onChange={(e) => setNewMessage(e.target.value)} 
                      placeholder="Type your message securely..." 
                      className="flex-1 bg-transparent border-none py-4 text-white placeholder-white/30 focus:outline-none min-h-[56px] max-h-[120px] resize-none font-medium custom-scrollbar leading-relaxed" 
                    />
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() && !fileBase64} 
                    className="h-14 px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-3xl font-black uppercase tracking-widest flex items-center justify-center disabled:opacity-50 disabled:grayscale shadow-[0_10px_20px_rgba(99,102,241,0.4)] border-b-[4px] border-purple-800 active:border-b-0 active:translate-y-[4px]"
                  >
                    Send <Send size={20} className="ml-3 drop-shadow-md" />
                  </motion.button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40 p-10 text-center relative z-10 w-full h-full">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="relative mb-8">
              <div className="w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full flex flex-col items-center justify-center border border-white/20 shadow-[0_0_40px_rgba(99,102,241,0.3)] backdrop-blur-xl z-10 relative">
                 <MessageSquare size={48} className="text-indigo-300 drop-shadow-lg" />
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -inset-8 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30 blur-2xl -z-10 mix-blend-screen" />
            </motion.div>
            <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-4xl font-black text-white mb-4 tracking-tight drop-shadow-md">Communication Hub</motion.h3>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="max-w-lg leading-relaxed font-medium text-indigo-200/80 text-lg">
              Select a contact from the sidebar to instantly translate, drop files, and broadcast messages securely in an entirely upgraded premium environment.
            </motion.p>
          </div>
        )}
      </div>
    </motion.div>
  );
};
