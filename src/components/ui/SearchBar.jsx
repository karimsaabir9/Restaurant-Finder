import { Search, X } from 'lucide-react'

export default function SearchBar({ value, onChange, placeholder = 'Search restaurants, cuisine, location...' }) {
    return (
        <div className="relative group">
            <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500 group-focus-within:text-brand-400 transition-colors"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-dark-800/60 border border-dark-700 text-dark-100 placeholder-dark-500
                   rounded-2xl pl-11 pr-10 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500
                   focus:border-transparent transition-all duration-200 backdrop-blur-sm"
            />
            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-dark-700 text-dark-400 hover:text-white transition-colors"
                >
                    <X size={14} />
                </button>
            )}
        </div>
    )
}
