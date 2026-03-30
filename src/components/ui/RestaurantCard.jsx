import { Link } from 'react-router-dom'
import { Star, MapPin, Heart, DollarSign } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useRestaurants } from '../../context/RestaurantContext'
import clsx from 'clsx'

const priceColors = {
    '$': 'text-green-400',
    '$$': 'text-yellow-400',
    '$$$': 'text-orange-400',
    '$$$$': 'text-red-400',
}

export default function RestaurantCard({ restaurant, onAuthRequired }) {
    const { isAuthenticated, user, isAdmin } = useAuth()
    const { favoriteIds, toggleFavorite } = useRestaurants()

    const isFavorite = favoriteIds.has(restaurant.id)

    const handleFavoriteClick = async (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (!isAuthenticated) {
            onAuthRequired?.()
            return
        }
        await toggleFavorite(user.id, restaurant.id)
    }

    const rating = Number(restaurant.avg_rating || 0).toFixed(1)

    return (
        <Link to={`/restaurants/${restaurant.id}`} className="group block h-full">
            <div className="card h-full flex flex-col group-hover:-translate-y-1 transition-transform duration-300">
                {/* Image */}
                <div className="relative overflow-hidden h-48">
                    <img
                        src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop'}
                        alt={restaurant.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                            e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop'
                        }}
                    />
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/60 to-transparent" />

                    {/* Featured badge */}
                    {restaurant.featured && (
                        <div className="absolute top-3 left-3">
                            <span className="badge bg-brand-500/90 text-white backdrop-blur-sm text-[10px] px-2 py-0.5">
                                ⭐ Featured
                            </span>
                        </div>
                    )}

                    {/* Favorite button */}
                    {!isAdmin && (
                        <button
                            onClick={handleFavoriteClick}
                            className={clsx(
                                'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-sm',
                                isFavorite
                                    ? 'bg-red-500 text-white shadow-lg'
                                    : 'bg-dark-900/60 text-dark-300 hover:bg-red-500 hover:text-white'
                            )}
                            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        >
                            <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                    )}

                    {/* Category badge */}
                    <div className="absolute bottom-3 left-3">
                        <span className="badge bg-dark-900/80 text-dark-200 text-[10px] backdrop-blur-sm">
                            {restaurant.cuisine || restaurant.category}
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-4 flex flex-col flex-1">
                    <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white text-base leading-snug group-hover:text-brand-400 transition-colors line-clamp-1">
                            {restaurant.name}
                        </h3>
                        {/* Rating */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                            <Star size={13} className="text-amber-400 fill-amber-400" />
                            <span className="text-white text-sm font-semibold">{rating}</span>
                            {restaurant.total_reviews > 0 && (
                                <span className="text-dark-500 text-xs">({restaurant.total_reviews})</span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-dark-400 text-xs mb-3">
                        <MapPin size={11} className="text-brand-500 flex-shrink-0" />
                        <span className="line-clamp-1">{restaurant.location}</span>
                    </div>

                    {restaurant.description && (
                        <p className="text-dark-400 text-xs leading-relaxed line-clamp-2 mb-3 flex-1">
                            {restaurant.description}
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-dark-800">
                        <span className={clsx('text-sm font-bold', priceColors[restaurant.price_range] || 'text-dark-400')}>
                            {restaurant.price_range || '$$'}
                        </span>
                        <span className="text-brand-400 text-xs font-medium group-hover:underline">
                            View Details →
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
