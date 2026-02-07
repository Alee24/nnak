import React, { useState } from 'react';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const FAQItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden mb-4 bg-white transition-all duration-300 hover:shadow-md">
            <button
                className="w-full px-6 py-5 text-left flex items-center justify-between bg-white hover:bg-gray-50 transition-colors"
                onClick={onClick}
            >
                <span className="font-semibold text-gray-900 text-lg">{question}</span>
                {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-emerald-600" />
                ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                )}
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                <div className="px-6 pb-6 pt-2 text-gray-600 leading-relaxed border-t border-gray-100">
                    {answer}
                </div>
            </div>
        </div>
    );
};

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const faqs = [
        {
            question: "How do I become a member of NNAK?",
            answer: (
                <ul className="list-disc pl-5 space-y-2">
                    <li>Register on our online portal</li>
                    <li>Complete your profile with all required information</li>
                    <li>Upload your nursing qualification documents</li>
                    <li>Select a membership type and make payment</li>
                    <li>Your application will be reviewed and approved. Once approved, you will receive a confirmation email and access to your membership certificate and ID card.</li>
                </ul>
            )
        },
        {
            question: "What are the benefits of NNAK membership?",
            answer: (
                <div className="space-y-2">
                    <p>NNAK membership offers numerous benefits including:</p>
                    <ul className="list-disc pl-5 grid grid-cols-1 md:grid-cols-2 gap-2">
                        <li>Professional recognition and credibility</li>
                        <li>Access to continuing education opportunities</li>
                        <li>Networking with nursing professionals</li>
                        <li>Representation in national healthcare policy discussions</li>
                        <li>Career development resources</li>
                        <li>Discounted rates for conferences and workshops</li>
                        <li>Legal and professional advice</li>
                        <li>Subscription to nursing publications</li>
                    </ul>
                </div>
            )
        },
        {
            question: "How can I renew my membership?",
            answer: (
                <div>
                    <p className="mb-2">You can renew your NNAK membership through your online member portal:</p>
                    <ol className="list-decimal pl-5 space-y-1 mb-2">
                        <li>Log in to your account</li>
                        <li>Navigate to the Membership section</li>
                        <li>Click on "Renew Membership"</li>
                        <li>Confirm your details and make payment</li>
                    </ol>
                    <p>Renewals can be done up to 3 months before your membership expires. You will receive email reminders when your membership is approaching expiration.</p>
                </div>
            )
        },
        {
            question: "How can I get a replacement for my lost membership certificate?",
            answer: (
                <div>
                    <p className="mb-2">If you've lost your membership certificate, you can easily get a replacement by:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-2">
                        <li>Logging into your member portal</li>
                        <li>Navigating to the Certificates section</li>
                        <li>Downloading a new copy of your certificate</li>
                    </ul>
                    <p>Digital certificates are always available for active members. If you require a physical certificate to be mailed to you, please contact our office directly.</p>
                </div>
            )
        },
        {
            question: "What payment methods are accepted for membership fees?",
            answer: (
                <div>
                    <p className="mb-2">NNAK accepts the following payment methods:</p>
                    <ul className="list-disc pl-5 space-y-1 mb-2">
                        <li>M-PESA mobile payments</li>
                        <li>Bank transfers</li>
                        <li>Credit/Debit cards</li>
                        <li>Direct deposits at our office</li>
                    </ul>
                    <p>M-PESA is the preferred payment method for most members due to its convenience and immediate processing.</p>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            <LandingNavbar />

            {/* Hero Section */}
            <div className="bg-emerald-900 text-white py-20 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/medical-icons.png')]"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-emerald-100 text-lg max-w-2xl mx-auto">
                        Find answers to common questions about NNAK membership, benefits, and portal usage.
                    </p>
                </div>
            </div>

            {/* FAQ Content */}
            <div className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
                <div className="flex items-center justify-center mb-10">
                    <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                        <HelpCircle className="w-8 h-8" />
                    </div>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <FAQItem
                            key={index}
                            question={faq.question}
                            answer={faq.answer}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                        />
                    ))}
                </div>

                <div className="mt-16 text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
                    <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please contact our friendly team.</p>
                    <a href="/contact" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors">
                        Contact Support
                    </a>
                </div>
            </div>

            <LandingFooter />
        </div>
    );
};

export default FAQ;
