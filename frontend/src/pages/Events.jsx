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
            const apiResponse = await AdminAPI.respondToEvent(eventId, response);
            if (apiResponse.success) {
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
        <div className="flex flex-col gap-4 animate-fade-in font-inter pb-8">
            {/* Header Section - High Density Standardized */}
            <div className="flex justify-between items-end px-1">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Events Engine</h1>
                    <p className="text-xs text-[#059669] font-black uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <span className="w-4 h-px bg-[#059669]/30"></span>
                        Schedule & Engagement Management
                    </p>
                </div>
                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-black uppercase tracking-widest shadow-md hover:bg-[#059669] transition-all active:scale-95 group"
                    >
                        <Plus size={12} strokeWidth={3} />
                        <span>Create Event</span>
                    </button>
                )}
            </div>

            {/* Filters and Utilities - Compact */}
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-100 shadow-sm mx-1">
                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
                    <input
                        type="text"
                        placeholder="Search events, locations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-emerald-500/5 transition-all outline-none"
                    />
                </div>

                <div className="flex items-center gap-1.5 bg-slate-100/50 p-1 rounded-xl">
                    {['all', 'upcoming', 'past'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={clsx(
                                "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
                                filterStatus === status
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Events Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-100"></div>
                    ))}
                </div>
            ) : filteredEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
                    {filteredEvents.map((event) => (
                        <div key={event.id} className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col">
                            {/* Image Header */}
                            <div className="h-28 bg-slate-100 relative overflow-hidden flex-shrink-0">
                                {event.image_url ? (
                                    <img src={`/api/event/image?path=${event.image_url}`} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-200">
                                        <ImageIcon size={24} strokeWidth={1} />
                                    </div>
                                )}
                                <div className="absolute top-2 left-2">
                                    <div className="px-1.5 py-0.5 bg-white/90 backdrop-blur-md rounded-md text-[10px] font-black text-slate-800 uppercase tracking-widest shadow-xs">
                                        {event.type}
                                    </div>
                                </div>
                                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            className="w-5 h-5 bg-rose-50 text-rose-500 rounded-md flex items-center justify-center hover:bg-rose-500 hover:text-white transition-colors"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Event Body */}
                            <div className="p-3 flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-1.5">
                                    <div className="px-1 py-0.5 bg-emerald-50 text-emerald-600 rounded text-[10px] font-black uppercase tracking-tighter">
                                        {event.cpd_points} CPD Points
                                    </div>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight leading-tight mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">
                                    {event.title}
                                </h3>
                                <p className="text-xs text-slate-400 font-bold line-clamp-2 mb-3 leading-snug">
                                    {event.description}
                                </p>

                                <div className="mt-auto space-y-1.5 pt-2 border-t border-slate-50">
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Calendar size={10} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <Clock size={10} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{event.event_time ? event.event_time.substring(0, 5) : 'TBD'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-400">
                                        <MapPin size={10} className="text-emerald-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest truncate">{event.location}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Action */}
                            <div className="px-3 py-2 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                                <div className="text-[10px] font-black text-slate-800 tracking-tighter uppercase">
                                    {event.fee > 0 ? `KES ${Number(event.fee).toLocaleString()}` : 'FREE'}
                                </div>
                                {user?.role === 'admin' || user?.role === 'super_admin' ? (
                                    <button
                                        onClick={() => handleEdit(event)}
                                        className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1 hover:gap-1.5 transition-all">
                                        Manage <ExternalLink size={9} />
                                    </button>
                                ) : (
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleResponse(event.id, 'registered')}
                                            className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded-md text-xs font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleResponse(event.id, 'rejected')}
                                            className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded-md text-xs font-black uppercase tracking-widest hover:bg-rose-100 transition-all">
                                            Reject
                                        </button>
                                    </div>
                                )}
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
                    <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500 max-h-[90vh] flex flex-col">
                        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center flex-shrink-0">
                            <div>
                                <h2 className="text-sm font-bold tracking-tight uppercase">{isEditing ? 'Update Event' : 'Schedule New Event'}</h2>
                                <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5">{isEditing ? 'Modify event parameters' : 'Define your event parameters'}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                                <Plus className="rotate-45" size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto custom-scrollbar space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Event Title</label>
                                    <input required type="text" name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" placeholder="Enter formal title" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Date</label>
                                    <input required type="date" name="date" value={formData.date} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Time</label>
                                    <input type="time" name="time" value={formData.time} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Location</label>
                                    <input required type="text" name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" placeholder="Physical venue or link" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Event Type</label>
                                    <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none">
                                        <option value="General">General</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Webinar">Webinar</option>
                                        <option value="Conference">Conference</option>
                                        <option value="Social">Social</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">CPD Points</label>
                                    <input type="number" name="cpd_points" value={formData.cpd_points} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Fee (KES)</label>
                                    <input type="number" name="fee" value={formData.fee} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none" />
                                </div>

                                <div>
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Cover Image</label>
                                    <input type="file" onChange={handleFileChange} className="w-full text-[9px] text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[9px] file:font-bold file:uppercase file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 transition-all" />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block">Description</label>
                                    <textarea name="description" value={formData.description} onChange={handleInputChange} rows="2" className="w-full px-3 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none outline-none" placeholder="Elaborate on event objectives..."></textarea>
                                </div>
                            </div>

                            <div className="flex flex-col md:flex-row gap-3 pt-2">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-98 disabled:opacity-50"
                                >
                                    {isSaving ? 'Processing...' : (isEditing ? 'Update Event' : 'Publish Event')}
                                </button>

                                {isEditing && (
                                    <button
                                        type="button"
                                        disabled={isInviting}
                                        onClick={() => handleInviteAll(currentEventId)}
                                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-[9px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-slate-100 hover:bg-slate-800 transition-all active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Users size={14} />
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
