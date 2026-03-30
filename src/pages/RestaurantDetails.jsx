import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Star, MapPin, Phone, Globe, Clock, Heart, ArrowLeft, DollarSign, MessageSquare } from 'lucide-react'
import { restaurantService } from '../services/restaurantService'
import { reviewService } from '../services/reviewService'
import { useAuth } from '../context/AuthContext'
import { useRestaurants } from '../context/RestaurantContext'
import ReviewCard from '../components/ui/ReviewCard'
import StarRating from '../components/ui/StarRating'
import { PageLoader } from '../components/ui/LoadingSpinner'
import EmptyState from '../components/ui/EmptyState'
import { mockRestaurants, mockReviews } from '../lib/mockData'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const priceColors = { '$': 'text-green-400', '$$': 'text-yellow-400', '$$$': 'text-orange-400', '$$$$': 'text-red-400' }

export default function RestaurantDetails({ onAuthClick }) {
    const { id } = useParams()
    const navigate = useNavigate()
    const { isAuthenticated, user, isAdmin } = useAuth()
    const { favoriteIds, toggleFavorite } = useRestaurants()

    const [restaurant, setRestaurant] = useState(null)
    const [reviews, setReviews] = useState([])
    const [loadingPage, setLoadingPage] = useState(true)
    const [reviewForm, setReviewForm] = useState({ rating: 0, comment: '' })
    const [submitting, setSubmitting] = useState(false)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        const load = async () => {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), 5000)
            )

            try {
                const [rest, revs] = await Promise.race([
                    Promise.all([
                        restaurantService.getRestaurantById(id),
                        reviewService.getReviewsByRestaurant(id),
                    ]),
                    timeoutPromise
                ])
                setRestaurant(rest)
                setReviews(revs)
            } catch (err) {
                console.error('Details: fetch error or timeout:', err.message)
                // Fallback to mock
                const mock = mockRestaurants.find(r => r.id === id)
                setRestaurant(mock || null)
                setReviews(mockReviews.filter(r => r.restaurant_id === id))
            } finally {
                setLoadingPage(false)
            }
        }
        load()
    }, [id])

    if (loadingPage) return <PageLoader />
    if (!restaurant) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white mb-3">Restaurant not found</h2>
                    <Link to="/restaurants" className="btn-primary">Browse Restaurants</Link>
                </div>
            </div>
        )
    }

    const isFavorite = favoriteIds.has(restaurant.id)
    const rating = Number(restaurant.avg_rating || 0).toFixed(1)

    const handleFavorite = async () => {
        if (!isAuthenticated) { onAuthClick?.('login'); return }
        await toggleFavorite(user.id, restaurant.id)
    }

    const handleReviewSubmit = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) { onAuthClick?.('login'); return }
        if (!reviewForm.rating) { toast.error('Please select a rating'); return }
        if (!reviewForm.comment.trim()) { toast.error('Please write a review'); return }

        setSubmitting(true)

        // 10 second timeout for submission
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Submission timed out. Please check your connection.')), 10000)
        )

        try {
            const newReview = await Promise.race([
                reviewService.addReview({
                    userId: user.id,
                    restaurantId: id,
                    rating: reviewForm.rating,
                    comment: reviewForm.comment,
                }),
                timeoutPromise
            ])

            setReviews(prev => [newReview, ...prev])
            setReviewForm({ rating: 0, comment: '' })
            setShowForm(false)
            toast.success('Review posted! 🎉')
        } catch (err) {
            console.error('Submit error:', err.message)
            toast.error(err.message || 'Failed to post review')
        } finally {
            setSubmitting(false)
        }
    }

    const handleReviewDelete = (deletedId) => {
        setReviews(prev => prev.filter(r => r.id !== deletedId))
    }

    const handleReviewUpdate = (updated) => {
        setReviews(prev => prev.map(r => r.id === updated.id ? updated : r))
    }

    return (
        <div className="min-h-screen pt-16">
            {/* Hero Image */}
            <div className="relative h-72 md:h-96 overflow-hidden">
                <img
                    src={restaurant.image_url || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop' }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-transparent" />

                {/* Back button */}
                <button onClick={() => navigate(-1)}
                    className="absolute top-6 left-6 flex items-center gap-2 bg-dark-900/80 hover:bg-dark-800 backdrop-blur-sm border border-dark-700 rounded-xl px-3 py-2 text-sm text-dark-200 transition-colors">
                    <ArrowLeft size={14} /> Back
                </button>

                {/* Favorite */}
                {!isAdmin && (
                    <button onClick={handleFavorite}
                        className={clsx(
                            'absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center transition-all backdrop-blur-sm border',
                            isFavorite ? 'bg-red-500 border-red-400 text-white shadow-lg' : 'bg-dark-900/80 border-dark-700 text-dark-300 hover:bg-red-500 hover:text-white'
                        )}>
                        <Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} />
                    </button>
                )}
            </div>

            <div className="page-container py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main */}
                    <div className="lg:col-span-2">
                        {/* Title */}
                        <div className="mb-6">
                            <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                                <div>
                                    <h1 className="text-3xl font-black text-white mb-1">{restaurant.name}</h1>
                                    <div className="flex items-center gap-2 text-dark-400 text-sm">
                                        <MapPin size={13} className="text-brand-500" />
                                        {restaurant.location}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-1.5">
                                        <Star size={14} className="text-amber-400 fill-amber-400" />
                                        <span className="text-amber-400 font-bold">{rating}</span>
                                        <span className="text-dark-500 text-xs">({restaurant.total_reviews || 0})</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                                {restaurant.category && (
                                    <span className="badge bg-dark-800 text-dark-300 border border-dark-700">{restaurant.category}</span>
                                )}
                                {restaurant.cuisine && (
                                    <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20">{restaurant.cuisine}</span>
                                )}
                                {restaurant.price_range && (
                                    <span className={clsx('badge bg-dark-800 border border-dark-700', priceColors[restaurant.price_range])}>
                                        {restaurant.price_range}
                                    </span>
                                )}
                            </div>

                            {restaurant.description && (
                                <p className="text-dark-300 leading-relaxed">{restaurant.description}</p>
                            )}
                        </div>

                        {/* Reviews */}
                        <div className="border-t border-dark-800 pt-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                    <MessageSquare size={18} className="text-brand-500" />
                                    Reviews ({reviews.length})
                                </h2>
                                {isAdmin ? (
                                    <span className="text-xs text-dark-500 italic bg-dark-800/50 px-3 py-1 rounded-lg border border-dark-700">
                                        Admin accounts cannot post reviews
                                    </span>
                                ) : isAuthenticated ? (
                                    <button
                                        onClick={() => setShowForm(!showForm)}
                                        className="btn-primary text-sm py-2 px-4"
                                    >
                                        {showForm ? 'Cancel' : '+ Write Review'}
                                    </button>
                                ) : (
                                    <button onClick={() => onAuthClick?.('login')} className="btn-secondary text-sm py-2 px-4">
                                        Sign in to review
                                    </button>
                                )}
                            </div>

                            {/* Review form */}
                            {showForm && (
                                <form onSubmit={handleReviewSubmit} className="card p-5 mb-6 animate-slide-down space-y-4">
                                    <h3 className="font-semibold text-white">Your Review</h3>
                                    <div>
                                        <label className="label">Rating</label>
                                        <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} size={24} />
                                    </div>
                                    <div>
                                        <label className="label">Comment</label>
                                        <textarea
                                            value={reviewForm.comment}
                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                            rows={4}
                                            className="input-field resize-none"
                                            placeholder="Share your experience..."
                                        />
                                    </div>
                                    <button type="submit" disabled={submitting} className="btn-primary">
                                        {submitting ? 'Posting...' : 'Post Review'}
                                    </button>
                                </form>
                            )}

                            {/* Reviews list */}
                            {reviews.length === 0 ? (
                                <EmptyState type="reviews" />
                            ) : (
                                <div className="space-y-4">
                                    {reviews.map(review => (
                                        <ReviewCard
                                            key={review.id}
                                            review={review}
                                            onDelete={handleReviewDelete}
                                            onUpdate={handleReviewUpdate}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-4">
                        <div className="card p-5">
                            <h3 className="font-semibold text-white mb-4">Info</h3>
                            <ul className="space-y-3">
                                {restaurant.address && (
                                    <li className="flex items-start gap-2.5 text-sm text-dark-300">
                                        <MapPin size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                                        {restaurant.address}
                                    </li>
                                )}
                                {restaurant.phone && (
                                    <li className="flex items-center gap-2.5 text-sm text-dark-300">
                                        <Phone size={14} className="text-brand-500 flex-shrink-0" />
                                        <a href={`tel:${restaurant.phone}`} className="hover:text-brand-400 transition-colors">{restaurant.phone}</a>
                                    </li>
                                )}
                                {restaurant.website && (
                                    <li className="flex items-center gap-2.5 text-sm text-dark-300">
                                        <Globe size={14} className="text-brand-500 flex-shrink-0" />
                                        <a href={restaurant.website} target="_blank" rel="noopener noreferrer" className="hover:text-brand-400 transition-colors truncate">
                                            Visit website
                                        </a>
                                    </li>
                                )}
                                {restaurant.hours && (
                                    <li className="flex items-start gap-2.5 text-sm text-dark-300">
                                        <Clock size={14} className="text-brand-500 mt-0.5 flex-shrink-0" />
                                        {restaurant.hours}
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Rating breakdown */}
                        <div className="card p-5">
                            <h3 className="font-semibold text-white mb-4">Rating Overview</h3>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-5xl font-black text-white">{rating}</div>
                                <div>
                                    <div className="flex gap-0.5 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} size={14}
                                                className={i <= Math.round(restaurant.avg_rating || 0) ? 'text-amber-400 fill-amber-400' : 'text-dark-700'} />
                                        ))}
                                    </div>
                                    <p className="text-dark-400 text-xs">{restaurant.total_reviews || 0} reviews</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
