import React from 'react';
import { CheckCircle2, DollarSign, User, Calendar, Receipt, Hash, Building } from 'lucide-react';

const ReceiptPrintable = ({ transaction, branding }) => {
    if (!transaction) return null;

    const serifFont = "'Playfair Display', serif";
    const accentColor = "#016938"; // Association green
    const labelColor = "#64748b";
    const textColor = "#1e293b";

    return (
        <div className="bg-white p-8 max-w-2xl mx-auto shadow-sm border border-slate-100 font-inter" id="printable-receipt">
            {/* Header / Branding */}
            <div className="flex justify-between items-start border-b-2 border-slate-50 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    {branding?.system_logo ? (
                        <img src={branding.system_logo} alt="NNAK Logo" className="h-16 w-auto object-contain" />
                    ) : (
                        <div className="w-16 h-16 bg-emerald-600 rounded-lg flex items-center justify-center text-white text-xs font-black">NNAK</div>
                    )}
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight uppercase leading-none">
                            {branding?.association_name || 'National Nurses Association of Kenya'}
                        </h1>
                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">
                            {branding?.association_tagline || 'Voice of the Nursing Profession'}
                        </p>
                    </div>
                </div>
                <div className="text-right">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                        Official Receipt
                    </div>
                    <div className="mt-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Number</p>
                        <p className="text-sm font-black text-slate-900">{transaction.invoice_number}</p>
                    </div>
                </div>
            </div>

            {/* Receipt Body */}
            <div className="space-y-8">
                {/* Amount Display */}
                <div className="bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Amount Paid</p>
                    <div className="text-4xl font-black text-slate-900 flex items-baseline gap-1">
                        <span className="text-lg opacity-40">{transaction.currency || 'KES'}</span>
                        {parseFloat(transaction.amount).toLocaleString()}
                    </div>
                    <div className="mt-4 px-3 py-1 bg-white border border-slate-200 rounded-lg flex items-center gap-2">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Transaction Successful</span>
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                    <DetailItem
                        icon={User}
                        label="Beneficiary"
                        value={`${transaction.first_name} ${transaction.last_name}`}
                        sub={transaction.email}
                    />
                    <DetailItem
                        icon={Hash}
                        label="Reference"
                        value={transaction.transaction_reference}
                        sub={`Method: ${transaction.payment_method?.toUpperCase()}`}
                    />
                    <DetailItem
                        icon={Receipt}
                        label="Purpose"
                        value={transaction.payment_type?.toUpperCase()}
                        sub={transaction.description}
                    />
                    <DetailItem
                        icon={Calendar}
                        label="Date & Time"
                        value={new Date(transaction.payment_date || transaction.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                        sub={new Date(transaction.payment_date || transaction.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    />
                </div>

                {/* Verification / Security */}
                <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Authentication</p>
                        <p className="text-[9px] text-slate-400 mt-1 max-w-[200px]">
                            This is a system-generated receipt. Authentication can be verified at portal.nnak.or.ke/verify
                        </p>
                    </div>
                    {/* Placeholder for QR if needed, but keeping it clean for now */}
                    <div className="w-12 h-12 bg-slate-50 rounded border border-slate-100 flex items-center justify-center opacity-30">
                        <Building size={20} className="text-slate-400" />
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="mt-12 pt-6 border-t border-dashed border-slate-200 text-center">
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-[0.3em]">
                    NNAK Financial Services • Thank you for your continued support
                </p>
            </div>
        </div>
    );
};

const DetailItem = ({ icon: Icon, label, value, sub }) => (
    <div className="flex gap-3">
        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 flex-shrink-0">
            <Icon size={14} />
        </div>
        <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
            <p className="text-sm font-bold text-slate-800 leading-tight">{value}</p>
            {sub && <p className="text-[10px] font-medium text-slate-400 mt-1">{sub}</p>}
        </div>
    </div>
);

export default ReceiptPrintable;
