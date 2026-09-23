import React from 'react';
import { ChevronRight } from 'lucide-react';

/**
 * Standardized Enterprise Page Header Component
 */
export const PageHeader = ({ title, subtitle, breadcrumbs = [], actions }) => {
    return (
        <div className="mb-5 pb-4 border-b border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
                {breadcrumbs.length > 0 && (
                    <nav className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 mb-1">
                        {breadcrumbs.map((crumb, idx) => (
                            <React.Fragment key={idx}>
                                {idx > 0 && <ChevronRight size={12} className="text-slate-400" />}
                                {crumb.href ? (
                                    <a href={crumb.href} className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors">
                                        {crumb.label}
                                    </a>
                                ) : (
                                    <span className="text-slate-700 dark:text-slate-300 font-semibold">{crumb.label}</span>
                                )}
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight leading-snug">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                        {subtitle}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-2 flex-wrap">
                    {actions}
                </div>
            )}
        </div>
    );
};

/**
 * Semantic Enterprise Status Badge
 */
export const StatusBadge = ({ variant = 'default', children, className = '' }) => {
    const variants = {
        success: 'bg-emerald-50 text-emerald-800 border-emerald-200/70 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/60',
        warning: 'bg-amber-50 text-amber-800 border-amber-200/70 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/60',
        error: 'bg-rose-50 text-rose-800 border-rose-200/70 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800/60',
        info: 'bg-blue-50 text-blue-800 border-blue-200/70 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/60',
        neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
        default: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    };

    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${variants[variant] || variants.default} ${className}`}>
            {children}
        </span>
    );
};

/**
 * Standardized Button Component
 */
export const Button = ({ variant = 'secondary', size = 'md', children, className = '', ...props }) => {
    const baseStyle = 'inline-flex items-center justify-center font-semibold rounded transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-600/30 disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
        primary: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-2xs border border-emerald-800',
        secondary: 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 shadow-2xs',
        tertiary: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300',
        destructive: 'bg-rose-600 hover:bg-rose-700 text-white shadow-2xs border border-rose-700',
    };

    const sizes = {
        sm: 'px-2.5 py-1 text-xs gap-1.5',
        md: 'px-3 py-1.5 text-xs gap-1.5',
        lg: 'px-4 py-2 text-sm gap-2',
    };

    return (
        <button className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
            {children}
        </button>
    );
};

/**
 * Enterprise Data Table Shell
 */
export const DataTable = ({ headers = [], children, loading, emptyMessage = 'No records found' }) => {
    return (
        <div className="w-full overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-md">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        <tr>
                            {headers.map((header, idx) => (
                                <th key={idx} className={`px-3.5 py-2.5 ${header.className || ''}`}>
                                    {header.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-normal">
                        {loading ? (
                            <tr>
                                <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400">
                                    <div className="inline-flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                                        <span>Loading records...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : React.Children.count(children) === 0 ? (
                            <tr>
                                <td colSpan={headers.length} className="px-4 py-8 text-center text-slate-400 font-medium">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            children
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

/**
 * Enterprise Accessible Modal Dialog Component
 */
export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = 'max-w-lg' }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-2xs animate-fade-in">
            <div 
                className={`w-full ${maxWidth} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl flex flex-col overflow-hidden max-h-[calc(100vh-32px)]`}
                role="dialog"
                aria-modal="true"
            >
                {/* Fixed Header */}
                <div className="px-4 py-3 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {title}
                    </h3>
                    <button 
                        onClick={onClose}
                        className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        aria-label="Close dialog"
                    >
                        ✕
                    </button>
                </div>

                {/* Scrollable Body */}
                <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
                    {children}
                </div>

                {/* Fixed Footer */}
                {footer && (
                    <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center justify-end gap-2 flex-shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};
