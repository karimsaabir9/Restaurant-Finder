import { Search, Heart, Utensils } from 'lucide-react'

const presets = {
    restaurants: { icon: Utensils, title: 'No restaurants found', subtitle: 'Try adjusting your search or filters.' },
    favorites: { icon: Heart, title: 'No favorites yet', subtitle: 'Browse restaurants and tap ♥ to save your favorites.' },
    search: { icon: Search, title: 'No results found', subtitle: 'Try different keywords or clear your search.' },
    reviews: { icon: Utensils, title: 'No reviews yet', subtitle: 'Be the first to share your experience!' },
}

export default function EmptyState({ type = 'restaurants', title, subtitle, action }) {
    const preset = presets[type] || presets.restaurants
    const Icon = preset.icon

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center animate-fade-in">
            <div className="w-20 h-20 bg-dark-800 rounded-full flex items-center justify-center mb-5">
                <Icon size={32} className="text-dark-600" />
            </div>
            <h3 className="text-white font-bold text-xl mb-2">{title || preset.title}</h3>
            <p className="text-dark-400 text-sm max-w-xs leading-relaxed">{subtitle || preset.subtitle}</p>
            {action && (
                <div className="mt-6">{action}</div>
            )}
        </div>
    )
}
