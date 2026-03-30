import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Heart, Star, MessageSquare, TrendingUp, Clock, ChevronRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useRestaurants } from '../context/RestaurantContext'
import { reviewService } from '../services/reviewService'
import RestaurantCard from '../components/ui/RestaurantCard'
import EmptyState from '../components/ui/EmptyState'
import { GridSkeleton } from '../components/ui/LoadingSpinner'

function StatCard({ icon: Icon, value, label, color = 'brand' }) {
    const colors = {
        brand: 'bg-brand-500/10 text-brand-400',
        amber: 'bg-amber-500/10 text-amber-400',
        blue: 'bg-blue-500/10 text-blue-400',
        green: 'bg-green-500/10 text-green-400',
    }
    return (
        <div className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
                <Icon size={18} />
            </div>
            <div className="text-3xl font-black text-white mb-0.5">{value}</div>
            <div className="text-dark-400 text-sm">{label}</div>
        </div>
    )
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function Dashboard({ onAuthClick }) {
    const { profile } = useAuth()
    const { favorites, fetchFavorites } = useRestaurants()
    const { user } = useAuth()
    const [userReviews, setUserReviews] = useState([])
    const [loadingFavs, setLoadingFavs] = useState(true)
    const [loadingReviews, setLoadingReviews] = useState(true)

    useEffect(() => {
        if (!user) return
        const load = async () => {
            setLoadingFavs(true)
            await fetchFavorites(user.id)
            setLoadingFavs(false)
        }
        load()
    }, [user])

    useEffect(() => {
        if (!user) return
        const loadReviews = async () => {
            setLoadingReviews(true)

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), 5000)
            )

            try {
                const data = await Promise.race([
                    reviewService.getReviewsByUser(user.id),
                    timeoutPromise
                ])
                setUserReviews(data)
            } catch (err) {
                console.error('Dashboard: review fetch error or timeout:', err.message)
                setUserReviews([])
            } finally {
                setLoadingReviews(false)
            }
        }
        loadReviews()
    }, [user])

    const favoriteRestaurants = favorites.map(f => f.restaurants).filter(Boolean)

    return (
        <div className="min-h-screen pt-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-dark-900 to-dark-950 border-b border-dark-800 py-10">
                <div className="page-container">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-glow">
                            {(profile?.name || 'U')[0].toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl font-black text-white">
                                Welcome back, {profile?.name?.split(' ')[0] || 'Foodie'}! 👋
                            </h1>
                            <p className="text-dark-400 text-sm mt-0.5">Here's your restaurant activity</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="page-container py-8 space-y-10">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Heart} value={favoriteRestaurants.length} label="Favorites" color="brand" />
                    <StatCard icon={MessageSquare} value={userReviews.length} label="Reviews Written" color="amber" />
                    <StatCard icon={Star} value={
                        userReviews.length > 0
                            ? (userReviews.reduce((a, r) => a + r.rating, 0) / userReviews.length).toFixed(1)
                            : '—'
                    } label="Avg Rating Given" color="blue" />
                    <StatCard icon={TrendingUp} value={favoriteRestaurants.length > 0 ? `${Math.min(favoriteRestaurants.length * 3, 99)}%` : '—'} label="Foodie Score" color="green" />
                </div>

                {/* Favorites */}
                <section>
                    <div className="flex items-center justify-between mb-5">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Heart size={18} className="text-brand-500" /> My Favorites
                        </h2>
                        <Link to="/restaurants" className="text-brand-400 hover:text-brand-300 text-sm flex items-center gap-1">
                            Browse more <ChevronRight size={14} />
                        </Link>
                    </div>

                    {loadingFavs ? (
                        <GridSkeleton count={3} />
                    ) : favoriteRestaurants.length === 0 ? (
                        <EmptyState type="favorites" action={
                            <Link to="/restaurants" className="btn-primary">Start Exploring</Link>
                        } />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {favoriteRestaurants.slice(0, 8).map(rest => (
                                <RestaurantCard key={rest.id} restaurant={rest} />
                            ))}
                        </div>
                    )}
                </section>

                {/* Recent Reviews */}
                <section>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
                        <MessageSquare size={18} className="text-brand-500" /> My Recent Reviews
                    </h2>

                    {loadingReviews ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="card p-5 animate-pulse">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-dark-800 rounded-lg" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 bg-dark-800 rounded w-1/3" />
                                            <div className="h-3 bg-dark-800 rounded w-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : userReviews.length === 0 ? (
                        <EmptyState type="reviews" action={
                            <Link to="/restaurants" className="btn-primary">Find a Restaurant</Link>
                        } />
                    ) : (
                        <div className="space-y-3">
                            {userReviews.slice(0, 5).map(review => (
                                <div key={review.id} className="card p-5 flex items-center gap-4">
                                    {review.restaurants?.image_url && (
                                        <img
                                            src={review.restaurants.image_url}
                                            alt={review.restaurants.name}
                                            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                                        />
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <Link to={`/restaurants/${review.restaurant_id}`} className="font-semibold text-white hover:text-brand-400 transition-colors text-sm truncate">
                                                {review.restaurants?.name || 'Restaurant'}
                                            </Link>
                                            <div className="flex items-center gap-1 flex-shrink-0">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star key={i} size={11}
                                                        className={i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-dark-700'} />
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-dark-400 text-xs mt-0.5 line-clamp-1">{review.comment}</p>
                                        <div className="flex items-center gap-1 text-dark-600 text-xs mt-1">
                                            <Clock size={10} />
                                            {formatDate(review.created_at)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    )
}
