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
        <div className="space-y-8 animate-fade-in-up pb-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Messages</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage incoming inquiries from the contact form</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search messages..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 w-64 shadow-sm"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm cursor-pointer"
                    >
                        <option value="all">All Messages</option>
                        <option value="unread">Unread Only</option>
                        <option value="read">Read Only</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Inbox Stats */}
                <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Mail size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{messages.length}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Messages</div>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900">{unreadCount}</div>
                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Unread</div>
                        </div>
                    </div>
                </div>

                {/* Message List */}
                <div className="md:col-span-3 space-y-4">
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    ) : filteredMessages.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                                <Mail size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No messages found</h3>
                            <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`bg-white rounded-2xl border ${msg.is_read ? 'border-gray-100' : 'border-blue-200 bg-blue-50/10'} p-6 shadow-sm hover:shadow-md transition-all group relative`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${msg.is_read ? 'bg-gray-100 text-gray-500' : 'bg-blue-100 text-blue-600'}`}>
                                            {msg.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900">{msg.subject}</h3>
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <span className="font-medium">{msg.name}</span>
                                                <span>&bull;</span>
                                                <span>{msg.email}</span>
                                                <span>&bull;</span>
                                                <span>{new Date(msg.created_at).toLocaleDateString()} at {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </div>
                                    </div>
                                    {!msg.is_read && (
                                        <button
                                            onClick={() => handleMarkAsRead(msg.id, msg.is_read)}
                                            className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-xs font-bold flex items-center gap-1"
                                            title="Mark as Read"
                                        >
                                            <CheckCircle size={16} /> Mark Read
                                        </button>
                                    )}
                                </div>
                                <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed border border-gray-100">
                                    {msg.message}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default MessagesPage;
