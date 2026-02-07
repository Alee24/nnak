import React, { useState, useEffect } from 'react';
import {
    Calendar, MapPin, Clock, Plus, Search, Filter,
    MoreVertical, Trash2, Edit3, ExternalLink,
    CheckCircle, AlertCircle, Image as ImageIcon,
    Download, Users, Award, Check, XCircle
} from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';
import clsx from 'clsx';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentEventId, setCurrentEventId] = useState(null);
    const [isInviting, setIsInviting] = useState(false);
    const [user, setUser] = useState(null);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        type: 'General',
        fee: 0,
        cpd_points: 0,
        image: null
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchEvents();
    }, [filterStatus]);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await AdminAPI.getEvents(filterStatus);
            if (response.events) {
                setEvents(response.events);
            }
        } catch (error) {
            console.error("Failed to fetch events:", error);
            Swal.fire('Error', 'Could not load events', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({ ...prev, image: e.target.files[0] }));
    };

    const handleEdit = (event) => {
        setFormData({
            title: event.title,
            date: event.event_date.split('T')[0], // Extract YYYY-MM-DD
            time: event.event_time ? event.event_time.substring(0, 5) : '',
            location: event.location,
            description: event.description,
            type: event.type,
            fee: event.fee,
            cpd_points: event.cpd_points,
            image: null,
            existing_image: event.image_url
        });
        setCurrentEventId(event.id);
        setIsEditing(true);
        setIsModalOpen(true);
    };

    const handleInviteAll = async (eventId) => {
        const result = await Swal.fire({
            title: 'Invite All Members?',
            text: "This will send an invitation to all active members of the association.",
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#059669',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, invite all!'
        });

        if (result.isConfirmed) {
            try {
                setIsInviting(true);
                const response = await AdminAPI.inviteAllMembers(eventId);
                if (response.success) {
                    Swal.fire('Invited!', response.message, 'success');
                }
            } catch (error) {
                Swal.fire('Error', error.message || 'Failed to send invitations', 'error');
            } finally {
                setIsInviting(false);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (key === 'image' && formData[key]) {
                    data.append('image', formData[key]);
                } else if (formData[key] !== null) {
                    data.append(key, formData[key]);
                }
            });

            let response;
            if (isEditing) {
                response = await AdminAPI.updateEvent(currentEventId, data);
            } else {
                response = await AdminAPI.createEvent(data);
            }

            if (response.success) {
                Swal.fire('Success', isEditing ? 'Event updated successfully' : 'Event created successfully', 'success');
                setIsModalOpen(false);
                resetForm();
                fetchEvents();
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || error.message || 'Action failed';
            Swal.fire('Error', errorMsg, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '', date: '', time: '', location: '',
            description: '', type: 'General', fee: 0,
            cpd_points: 0, image: null
        });
        setIsEditing(false);
        setCurrentEventId(null);
    };

    const handleResponse = async (eventId, response) => {
        try {
            const apiResponse = await AdminAPI.api.post(`/event/${eventId}/respond`, { response });
            if (apiResponse.data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: response === 'registered' ? 'See you there!' : 'Invite declined',
                    icon: 'success',
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000
                });
                fetchEvents();
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to update response', 'error');
        }
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                const response = await AdminAPI.deleteEvent(id);
                if (response.success) {
                    Swal.fire('Deleted!', 'Event has been deleted.', 'success');
                    fetchEvents();
                }
            } catch (error) {
                Swal.fire('Error', error.message || 'Failed to delete event', 'error');
            }
        }
    };

    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.location.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-1 md:p-6 space-y-6 animate-fade-in font-dm-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">Events Management</h1>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Schedule and manage association activities</p>
                </div>
                <button
                    onClick={() => { resetForm(); setIsModalOpen(true); }}
                    className="flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200 active:scale-95"
                >
                    <Plus size={16} /> Create Event
                </button>
            </div>

            {/* Filters and Utilities */}
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm">
                <div className="relative w-full md:w-96 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={18} />
                    <input
                        type="text"
                        placeholder="Search events, locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>

                <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar scroll-smooth">
                    {['all', 'upcoming', 'past'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                filterStatus === status
                                    ? "bg-slate-900 text-white shadow-lg"
                                    : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded-[2.5rem] h-96 animate-pulse border border-gray-100"></div>
                    ))}
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="group bg-white rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden flex flex-col">
                            {/* Image Placeholder/Header */}
                            <div className="h-48 bg-slate-100 relative overflow-hidden flex-shrink-0">
                                {event.image_url ? (
                                    <img src={`/api/event/image?path=${event.image_url}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                        <ImageIcon size={48} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <div className="px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-slate-900 uppercase tracking-widest shadow-sm">
                                        {event.type}
                                    </div>
                                </div>
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => handleDelete(event.id)}
                                        className="w-8 h-8 bg-red-50 text-red-500 rounded-lg flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Event Body */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[9px] font-black uppercase tracking-tighter">
                                        {event.cpd_points} CPD Points
                                    </div>
                                </div>
                                <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter leading-tight mb-2 group-hover:text-emerald-600 transition-colors">
                                    {event.title}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                                    {event.description}
                                </p>

                                <div className="mt-auto space-y-2 pt-4 border-t border-gray-50">
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <Calendar size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <Clock size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">{event.event_time ? event.event_time.substring(0, 5) : 'TBD'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-500">
                                        <MapPin size={14} className="text-emerald-500" />
                                        <span className="text-[10px] font-bold uppercase tracking-widest truncate">{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-50 flex items-center justify-between">
                                <div className="text-[10px] font-black text-slate-900 tracking-tighter uppercase">
                                    {event.fee > 0 ? `KES ${Number(event.fee).toLocaleString()}` : 'FREE ACCESS'}
                                </div>
                                <div className="flex items-center gap-2">
                                    {user?.role === 'admin' || user?.role === 'super_admin' ? (
                                        <button
                                            onClick={() => handleEdit(event)}
                                            className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                                            Manage <ExternalLink size={12} />
                                        </button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleResponse(event.id, 'registered')}
                                                className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-100 transition-all flex items-center gap-1">
                                                <Check size={12} /> Accept
                                            </button>
                                            <button
                                                onClick={() => handleResponse(event.id, 'rejected')}
                                                className="px-3 py-1 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-red-100 transition-all flex items-center gap-1">
                                                <XCircle size={12} /> Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border border-dashed border-gray-200">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <Calendar size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">No events found</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Try adjusting your filters or search query</p>
                </div>
            )}

            {/* Create Event Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] flex flex-col">
                        <div className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
                            <div>
                                <h2 className="text-xl font-black tracking-tighter uppercase">{isEditing ? 'Update Event' : 'Schedule New Event'}</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{isEditing ? 'Modify event parameters' : 'Define your event parameters'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Plus className="rotate-45" size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Event Title</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="Enter formal title" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Date</label>
                                    <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Time</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Location</label>
                                    <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" placeholder="Physical venue or link" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Event Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all">
                                        <option value="General">General</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Webinar">Webinar</option>
                                        <option value="Conference">Conference</option>
                                        <option value="Social">Social</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">CPD Points</label>
                                    <input type="number" name="cpd_points" value={formData.cpd_points} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Fee (KES)</label>
                                    <input type="number" name="fee" value={formData.fee} onChange={handleInputChange} className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all" />
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Cover Image</label>
                                    <input type="file" onChange={handleFileChange} className="w-full text-xs text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-black file:uppercase file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3" className="w-full px-4 py-3 bg-gray-50 border-none rounded-xl text-xs font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all resize-none" placeholder="Elaborate on event objectives..."></textarea>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-98 disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : (isEditing ? 'Update Event' : 'Publish Event')}
                                </button>

                                {isEditing && (
                                    <button
                                        type="button"
                                        disabled={isInviting}
                                        onClick={() => handleInviteAll(currentEventId)}
                                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-slate-200 hover:bg-slate-800 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Users size={16} />
                                        {isInviting ? 'Inviting...' : 'Invite All Members'}
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
