import React, { useState, useEffect } from 'react';
import { Mail, Search, CheckCircle, Clock } from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';

const MessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, unread, read

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.getMessages();
            if (response.success) {
                setMessages(response.messages);
            }
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to load messages', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id, currentStatus) => {
        if (currentStatus) return; // Already read

        try {
            const response = await AdminAPI.markMessageRead(id);
            if (response.success) {
                setMessages(prev => prev.map(msg =>
                    msg.id === id ? { ...msg, is_read: 1 } : msg
                ));
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true
                });
                Toast.fire({
                    icon: 'success',
                    title: 'Marked as read'
                });
                // Update sidebar badge
                window.dispatchEvent(new Event('messages-updated'));
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to update status', 'error');
        }
    };

    const filteredMessages = messages.filter(msg => {
        const matchesSearch =
            msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            msg.subject.toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'unread') return matchesSearch && !msg.is_read;
        if (filter === 'read') return matchesSearch && msg.is_read;
        return matchesSearch;
    });

    const unreadCount = messages.filter(m => !m.is_read).length;

    return (
        <div className="flex flex-col gap-4 animate-fade-in font-inter pb-8">
            {/* Header Section - Standardized High Density */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Communications</h1>
                    <p className="text-xs text-[#059669] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#059669]/30"></span>
                        External Inquiry Management
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={12} />
                        <input
                            type="text"
                            placeholder="Filter inbox..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/5 w-48 shadow-sm font-bold"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/5 shadow-sm cursor-pointer font-bold text-slate-600"
                    >
                        <option value="all">All Channels</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Archived</option>
                    </select>
                </div>
            </div>

            {/* In-Line Stats - High Density */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-1">
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center">
                        <Mail size={16} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 leading-none">{messages.length}</div>
                        <div className="text-xs font-black text-slate-400 uppercase tracking-widest mt-0.5">Total Inbound</div>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Clock size={16} />
                    </div>
                    <div>
                        <div className="text-sm font-black text-slate-900 leading-none">{unreadCount}</div>
                        <div className="text-xs font-black text-amber-500 uppercase tracking-widest mt-0.5">Awaiting Review</div>
                    </div>
                </div>
            </div>

            {/* Message Feed - High Density */}
            <div className="space-y-3 px-1">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-2">
                        <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Retrieving Correspondence...</p>
                    </div>
                ) : filteredMessages.length === 0 ? (
                    <div className="bg-white rounded-3xl border border-slate-100 p-16 text-center shadow-sm">
                        <Mail size={32} className="text-slate-100 mx-auto mb-3" />
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Inbox Clear</h3>
                        <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest font-black">No matching records found in system</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div
                            key={msg.id}
                            className={`bg-white rounded-2xl border ${msg.is_read ? 'border-slate-100' : 'border-emerald-100 bg-emerald-50/10'} p-4 shadow-sm hover:shadow-md transition-all group relative`}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black shadow-xs ${msg.is_read ? 'bg-slate-100 text-slate-400' : 'bg-slate-900 text-white'}`}>
                                        {msg.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight group-hover:text-[#059669] transition-colors">{msg.subject}</h3>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                                            <span className="text-slate-600">{msg.name}</span>
                                            <span className="opacity-30">&bull;</span>
                                            <span>{msg.email}</span>
                                            <span className="opacity-30">&bull;</span>
                                            <span>{new Date(msg.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                                {!msg.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                                        className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg transition-all hover:bg-emerald-600 hover:text-white shadow-xs"
                                        title="Archive Message"
                                    >
                                        <CheckCircle size={10} strokeWidth={3} />
                                    </button>
                                )}
                            </div>
                            <div className="bg-slate-50/50 p-3 rounded-xl text-xs text-slate-600 font-medium leading-relaxed border border-slate-100/50">
                                {msg.message}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MessagesPage;
