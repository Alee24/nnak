import React, { useState, useEffect } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { Mail, Phone, MapPin, Send, MessageSquare, Globe, Clock } from 'lucide-react';
import AdminAPI from '../services/api';
import Swal from 'sweetalert2';

const ContactPage = () => {
    const [settings, setSettings] = useState({
        contact_email: 'info@nnak.or.ke',
        contact_phone: '+254 700 000 000',
        contact_address: 'NNAK Headquarters, Nurses Complex, Nairobi, Kenya',
        contact_map_url: '',
        office_hours_weekdays: '8:00 AM - 5:00 PM',
        office_hours_saturday: '9:00 AM - 1:00 PM'
    });

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [sending, setSending] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const response = await AdminAPI.getSettings();
            if (response.success) {
                setSettings(prev => ({ ...prev, ...response.settings }));
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            const response = await AdminAPI.submitContactMessage(formData);
            if (response.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Message Sent!',
                    text: 'We have received your message and will get back to you shortly.',
                    confirmButtonColor: '#10b981'
                });
                setFormData({ name: '', email: '', subject: '', message: '' });
            }
        } catch (error) {
            Swal.fire('Error', error.message || 'Failed to send message', 'error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <LandingNavbar />

            <div className="flex-1 pt-32 pb-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 mb-6">
                            <MessageSquare className="w-5 h-5 text-emerald-500" />
                            <span className="text-sm font-bold text-emerald-800 tracking-wide uppercase">Get in Touch</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                            We'd Love to Hear <span className="text-emerald-600">From You</span>
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                            Have questions about membership, events, or CPD points? Our team is ready to assist you.
                        </p>
                    </div>

                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Contact Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <ContactCard
                                icon={MapPin}
                                title="Visit Us"
                                content={settings.contact_address}
                                link="#"
                            />
                            <ContactCard
                                icon={Phone}
                                title="Call Us"
                                content={settings.contact_phone}
                                link={`tel:${settings.contact_phone}`}
                            />
                            <ContactCard
                                icon={Mail}
                                title="Email Us"
                                content={settings.contact_email}
                                link={`mailto:${settings.contact_email}`}
                            />
                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Clock size={20} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">Office Hours</h3>
                                </div>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Mon - Fri</span>
                                        <span className="font-bold text-gray-900">{settings.office_hours_weekdays}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Saturday</span>
                                        <span className="font-bold text-gray-900">{settings.office_hours_saturday}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Sunday</span>
                                        <span className="font-bold text-gray-400">Closed</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Form */}
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Send us a Message</h2>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Full Name</label>
                                            <input required name="name" value={formData.name} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium" placeholder="John Doe" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email Address</label>
                                            <input required name="email" value={formData.email} onChange={handleChange} type="email" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium" placeholder="john@example.com" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</label>
                                        <input required name="subject" value={formData.subject} onChange={handleChange} type="text" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium" placeholder="How can we help?" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</label>
                                        <textarea required name="message" value={formData.message} onChange={handleChange} rows="5" className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all font-medium resize-none" placeholder="Your message here..."></textarea>
                                    </div>

                                    <button disabled={sending} type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
                                        {sending ? 'Sending...' : <>Send Message <Send size={20} /></>}
                                    </button>
                                </form>
                            </div>

                            {/* Map Embed */}
                            {settings.contact_map_url && (
                                <div className="bg-white p-4 rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-80">
                                    <iframe
                                        src={settings.contact_map_url}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0, borderRadius: '1rem' }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                    ></iframe>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

const ContactCard = ({ icon: Icon, title, content, link }) => (
    <a href={link} className="flex items-start gap-5 p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all group">
        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-500 group-hover:text-white transition-colors text-emerald-600">
            <Icon size={24} />
        </div>
        <div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">{title}</h3>
            <p className="text-gray-600 font-medium">{content}</p>
        </div>
    </a>
);

export default ContactPage;
