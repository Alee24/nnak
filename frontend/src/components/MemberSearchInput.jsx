import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, X, Loader2 } from 'lucide-react';
import AdminAPI from '../services/api';

/**
 * MemberSearchInput — Autocomplete input that searches existing club members.
 *
 * Props:
 *   value        {string}   — controlled display value (the typed text / selected name)
 *   onChange     {function} — called with the full member object when a result is selected,
 *                             OR with a plain string when the user clears / types freely.
 *   placeholder  {string}   — input placeholder text
 *   className    {string}   — extra Tailwind classes for the wrapper div
 *   disabled     {boolean}  — disables the input
 *   label        {string}   — optional visible label above the input
 *   required     {boolean}  — marks field as required
 *   id           {string}   — input id (for label association)
 *
 * When a member is selected, onChange receives an object:
 *   { player_name, member_number, handicap, member_id, email, phone, membership_type_name }
 *
 * When the user types freely (no selection), onChange receives a plain string.
 */
const MemberSearchInput = ({
    value = '',
    onChange,
    placeholder = 'Search by name or member number…',
    className = '',
    disabled = false,
    label,
    required = false,
    id = 'member-search'
}) => {
    const [query, setQuery] = useState(value);
    const [results, setResults] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(false); // true after user picks from list
    const debounceTimer = useRef(null);
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Sync external value changes (e.g. form reset)
    useEffect(() => {
        if (value !== query) {
            setQuery(value);
            if (!value) setSelected(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handle = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handle);
        return () => document.removeEventListener('mousedown', handle);
    }, []);

    const doSearch = useCallback(async (q) => {
        if (q.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }
        setLoading(true);
        try {
            const res = await AdminAPI.searchMembers(encodeURIComponent(q));
            const members = res?.members || [];
            setResults(members);
            setIsOpen(members.length > 0);
        } catch {
            setResults([]);
            setIsOpen(false);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = (e) => {
        const val = e.target.value;
        setQuery(val);
        setSelected(false);
        // Propagate free-text so parent can still track the field
        if (onChange) onChange(val);

        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => doSearch(val), 280);
    };

    const handleSelect = (member) => {
        const fullName = `${member.first_name} ${member.last_name}`.trim();
        setQuery(fullName);
        setSelected(true);
        setIsOpen(false);
        setResults([]);
        if (onChange) {
            onChange({
                player_name: fullName,
                member_number: member.member_id || '',
                handicap: member.handicap_index != null ? String(member.handicap_index) : '',
                member_id: member.id,
                email: member.email || '',
                phone: member.phone || '',
                membership_type_name: member.membership_type_name || ''
            });
        }
    };

    const handleClear = () => {
        setQuery('');
        setSelected(false);
        setResults([]);
        setIsOpen(false);
        if (onChange) onChange('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-gray-300 mb-1">
                    {label}{required && <span className="text-red-400 ml-1">*</span>}
                </label>
            )}

            <div className="relative flex items-center">
                {/* Left icon */}
                <span className="absolute left-3 text-gray-400 pointer-events-none">
                    {loading
                        ? <Loader2 size={16} className="animate-spin" />
                        : <Search size={16} />
                    }
                </span>

                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={query}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results.length > 0 && !selected) setIsOpen(true); }}
                    placeholder={placeholder}
                    disabled={disabled}
                    required={required}
                    autoComplete="off"
                    className={`
                        w-full pl-9 pr-8 py-2 rounded-lg border text-sm transition-all outline-none
                        bg-[#1a2535] border-gray-700 text-white placeholder-gray-500
                        focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20
                        disabled:opacity-50 disabled:cursor-not-allowed
                        ${selected ? 'border-emerald-600' : ''}
                    `}
                />

                {/* Clear button */}
                {query && !disabled && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-2 text-gray-500 hover:text-gray-300 transition-colors"
                        tabIndex={-1}
                        aria-label="Clear"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>

            {/* Dropdown results */}
            {isOpen && results.length > 0 && (
                <ul className="absolute z-50 left-0 right-0 mt-1 bg-[#0f1923] border border-gray-700 rounded-lg shadow-2xl max-h-56 overflow-y-auto divide-y divide-gray-800">
                    {results.map((m) => {
                        const fullName = `${m.first_name} ${m.last_name}`.trim();
                        const hcp = m.handicap_index != null ? Number(m.handicap_index).toFixed(1) : '—';
                        const memberId = m.member_id || '—';
                        const type = m.membership_type_name || '';
                        return (
                            <li
                                key={m.id}
                                onMouseDown={(e) => {
                                    e.preventDefault(); // Prevent blur from firing first
                                    handleSelect(m);
                                }}
                                className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-emerald-900/30 transition-colors"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-800/60 flex items-center justify-center text-emerald-300">
                                    <User size={14} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium text-white truncate">{fullName}</p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {memberId}
                                        {type ? ` · ${type}` : ''}
                                        {' · '}
                                        <span className="text-emerald-400">HCP {hcp}</span>
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* No results hint */}
            {isOpen && results.length === 0 && !loading && query.length >= 2 && (
                <div className="absolute z-50 left-0 right-0 mt-1 bg-[#0f1923] border border-gray-700 rounded-lg shadow-xl px-4 py-3 text-sm text-gray-400">
                    No members found for "<span className="text-white">{query}</span>" — you may still type a name manually.
                </div>
            )}
        </div>
    );
};

export default MemberSearchInput;
