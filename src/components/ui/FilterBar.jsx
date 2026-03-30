import { SlidersHorizontal } from 'lucide-react'
import { categories } from '../../lib/mockData'
import clsx from 'clsx'

const sortOptions = [
    { value: 'created_at', label: 'Newest First' },
    { value: 'avg_rating', label: 'Top Rated' },
    { value: 'total_reviews', label: 'Most Reviewed' },
    { value: 'name', label: 'Name A–Z' },
]

export default function FilterBar({ category, sortBy, onCategoryChange, onSortChange }) {
    return (
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 flex-1">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => onCategoryChange(cat)}
                        className={clsx(
                            'flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200',
                            category === cat
                                ? 'bg-brand-500 text-white shadow-glow'
                                : 'bg-dark-800 text-dark-400 hover:text-white hover:bg-dark-700 border border-dark-700'
                        )}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 flex-shrink-0">
                <SlidersHorizontal size={14} className="text-dark-500" />
                <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value)}
                    className="bg-dark-800 border border-dark-700 text-dark-300 rounded-xl px-3 py-1.5 text-xs
                     focus:outline-none focus:ring-1 focus:ring-brand-500 transition-all cursor-pointer"
                >
                    {sortOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
        </div>
    )
}
