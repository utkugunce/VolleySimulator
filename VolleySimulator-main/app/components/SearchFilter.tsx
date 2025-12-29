"use client";

import { useState, useEffect } from 'react';

interface SearchFilterProps {
    items: { name: string;[key: string]: any }[];
    onFilter: (filtered: any[]) => void;
    placeholder?: string;
}

export default function SearchFilter({ items, onFilter, placeholder = "Ara..." }: SearchFilterProps) {
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!query.trim()) {
            onFilter(items);
            return;
        }

        const q = query.toLowerCase();
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(q)
        );
        onFilter(filtered);
    }, [query, items, onFilter]);

    return (
        <div className="relative">
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={placeholder}
                className="w-full px-4 py-2 pl-10 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                🔍
            </span>
            {query && (
                <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
