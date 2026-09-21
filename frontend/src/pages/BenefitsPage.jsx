import React from 'react';
import { Link } from 'react-router-dom';
import { Check, Shield, Award, Users, Trophy, Flag, Clock, Star } from 'lucide-react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';

const BenefitsPage = () => {
    const categories = [
        {
            name: 'Full Member',
            price: 'KES 60,000 / yr',
            joining: 'KES 50,000 joining fee',
            badge: 'Most Popular',
            features: [
                'Unlimited 7-day golfing rights on all 18 holes',
                'Official World Handicap System (WHS) index',
                'Unlimited entry to club tournaments & medal competitions',
                'Full access to Clubhouse, Restaurant, Bar & Lounge',
                'Priority tee time bookings (up to 14 days in advance)',
                'Up to 4 registered family dependants included',
                'Reciprocal golfing privileges with affiliated clubs'
            ]
        },
        {
            name: 'Corporate Member',
            price: 'KES 200,000 / yr',
            joining: 'KES 100,000 joining fee',
            badge: 'Business',
            features: [
                '4 transferable corporate player slots',
                'Access to executive meeting & conference rooms',
                'Corporate tournament hosting discounts',
                'Dedicated account manager & monthly invoicing',
                'Full dining & entertainment privileges',
                'VIP guest passes & customized corporate days'
            ]
        },
        {
            name: 'Associate Member',
            price: 'KES 30,000 / yr',
            joining: 'KES 20,000 joining fee',
            features: [
                'Weekday golfing rights (Monday – Friday)',
                'Official handicap index maintenance',
                'Access to clubhouse, dining, and social events',
                'Discounted weekend green fees',
                'Up to 2 registered family dependants'
            ]
        },
        {
            name: 'Junior Member (Under 25)',
            price: 'KES 15,000 / yr',
            joining: 'KES 10,000 joining fee',
            features: [
                'Golfing rights on junior tee boxes',
                'Junior golf academy coaching sessions',
                'Entry to junior championships and holiday camps',
                'Free range balls during training clinics'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <LandingNavbar />

            <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
                <div className="text-center max-w-3xl mx-auto space-y-3">
                    <h1 className="text-xs font-black uppercase tracking-[0.25em] text-emerald-600">Club Membership</h1>
                    <p className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">Membership Categories & Privileges</p>
                    <p className="text-sm text-slate-500 font-medium">Join Kenya's premier golfing community with world-class facilities and flexible membership tiers.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-5 flex flex-col justify-between hover:shadow-xl transition-all">
                            <div className="space-y-4">
                                {cat.badge && (
                                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                        {cat.badge}
                                    </span>
                                )}
                                <div>
                                    <h3 className="font-black text-slate-900 text-lg">{cat.name}</h3>
                                    <div className="text-xl font-black text-emerald-600 mt-1">{cat.price}</div>
                                    <div className="text-[10px] font-bold text-slate-400 mt-0.5">{cat.joining}</div>
                                </div>

                                <ul className="space-y-2.5 text-xs text-slate-600">
                                    {cat.features.map((f, fIdx) => (
                                        <li key={fIdx} className="flex items-start gap-2">
                                            <Check size={14} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <Link
                                to="/signup"
                                className="w-full text-center bg-slate-900 hover:bg-emerald-600 text-white py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all"
                            >
                                Apply for Membership
                            </Link>
                        </div>
                    ))}
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

export default BenefitsPage;
