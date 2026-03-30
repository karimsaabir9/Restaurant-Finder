import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, ChevronRight, Star, MapPin, Utensils, Award, Users, TrendingUp } from 'lucide-react'
import { useRestaurants } from '../context/RestaurantContext'
import { useAuth } from '../context/AuthContext'
import RestaurantCard from '../components/ui/RestaurantCard'
import { GridSkeleton } from '../components/ui/LoadingSpinner'
import { restaurantService } from '../services/restaurantService'
import { mockRestaurants } from '../lib/mockData'

const HERO_CATEGORIES = [
    { label: 'Italian', emoji: '🍕' },
    { label: 'Japanese', emoji: '🍱' },
    { label: 'American', emoji: '🍔' },
    { label: 'Indian', emoji: '🍛' },
    { label: 'French', emoji: '🥐' },
    { label: 'Mexican', emoji: '🌮' },
]

const STATS = [
    { icon: Utensils, value: '500+', label: 'Restaurants' },
    { icon: Star, value: '50K+', label: 'Reviews' },
    { icon: Users, value: '10K+', label: 'Happy Users' },
    { icon: Award, value: '4.8★', label: 'Avg Rating' },
]

export default function Home({ onAuthClick }) {
    const { isAuthenticated } = useAuth()
    const { favoriteIds, toggleFavorite } = useRestaurants()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [featured, setFeatured] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const load = async () => {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), 5000)
            )

            try {
                const data = await Promise.race([
                    restaurantService.getFeaturedRestaurants(),
                    timeoutPromise
                ])

                setFeatured(data && data.length > 0 ? data : mockRestaurants.filter(r => r.featured))
            } catch (err) {
                // Fallback to mock data immediately on error or timeout
                setFeatured(mockRestaurants.filter(r => r.featured))
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/restaurants?search=${encodeURIComponent(searchQuery.trim())}`)
        }
    }

    return (
        <div className="min-h-screen">
            {/* ── Hero ── */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&auto=format&fit=crop')] bg-cover bg-center opacity-15" />
                    <div className="absolute inset-0 bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950" />
                    {/* Glow orbs */}
                    <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl animate-pulse-slow" />
                    <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-brand-600/10 rounded-full blur-3xl animate-pulse-slow" />
                </div>

                <div className="relative page-container text-center z-10 py-24">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-4 py-1.5 text-brand-400 text-xs font-medium mb-8 animate-fade-in">
                        <TrendingUp size={12} />
                        <span>Discover the best restaurants near you</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-5xl md:text-7xl font-black text-white mb-6 animate-slide-up leading-tight">
                        Find Your Next
                        <br />
                        <span className="gradient-text">Favorite Meal</span>
                    </h1>
                    <p className="text-dark-400 text-lg md:text-xl mb-10 max-w-xl mx-auto animate-fade-in">
                        Browse hundreds of restaurants, read real reviews, and discover amazing dining experiences in your city.
                    </p>

                    {/* Search form */}
                    <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto mb-8 animate-slide-up">
                        <div className="relative flex-1">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Restaurant name, cuisine, location..."
                                className="w-full bg-dark-800/80 border border-dark-700 text-dark-100 placeholder-dark-500
                           rounded-2xl pl-11 pr-4 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500
                           focus:border-transparent transition-all backdrop-blur-sm"
                            />
                        </div>
                        <button type="submit" className="btn-primary px-6 py-4 rounded-2xl">
                            Search
                        </button>
                    </form>

                    {/* Quick categories */}
                    <div className="flex flex-wrap justify-center gap-2 mb-12 animate-fade-in">
                        {HERO_CATEGORIES.map(cat => (
                            <button
                                key={cat.label}
                                onClick={() => navigate(`/restaurants?category=${cat.label}`)}
                                className="flex items-center gap-1.5 bg-dark-800/60 hover:bg-dark-700 border border-dark-700 hover:border-brand-500/50
                           rounded-full px-4 py-2 text-xs text-dark-300 hover:text-white transition-all duration-200 backdrop-blur-sm"
                            >
                                <span>{cat.emoji}</span> {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* CTA buttons */}
                    {!isAuthenticated && (
                        <div className="flex items-center justify-center gap-4 animate-fade-in">
                            <button onClick={() => onAuthClick('register')} className="btn-primary px-8 py-3">
                                Get Started Free
                            </button>
                            <button onClick={() => onAuthClick('login')} className="btn-ghost text-white border border-dark-700 px-8 py-3 rounded-xl">
                                Sign In
                            </button>
                        </div>
                    )}
                </div>

                {/* Scroll hint */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float">
                    <div className="w-px h-12 bg-gradient-to-b from-dark-600 to-transparent" />
                </div>
            </section>

            {/* ── Stats ── */}
            <section className="py-16 border-y border-dark-800 bg-dark-900/50">
                <div className="page-container">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {STATS.map(({ icon: Icon, value, label }) => (
                            <div key={label} className="text-center">
                                <div className="w-12 h-12 bg-brand-500/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                    <Icon size={20} className="text-brand-400" />
                                </div>
                                <div className="text-3xl font-black text-white mb-1">{value}</div>
                                <div className="text-dark-400 text-sm">{label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Featured Restaurants ── */}
            <section className="py-20">
                <div className="page-container">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="section-title">Featured Restaurants</h2>
                            <p className="section-subtitle">Top-rated picks our community loves</p>
                        </div>
                        <Link to="/restaurants" className="btn-secondary text-sm flex items-center gap-1.5">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>

                    {loading ? (
                        <GridSkeleton count={4} />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {featured.map(restaurant => (
                                <RestaurantCard
                                    key={restaurant.id}
                                    restaurant={restaurant}
                                    onAuthRequired={() => onAuthClick('login')}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ── CTA Banner ── */}
            <section className="py-20">
                <div className="page-container">
                    <div className="relative rounded-3xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 to-brand-800" />
                        <div className="absolute inset-0 opacity-10 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&auto=format&fit=crop')] bg-cover bg-center" />
                        <div className="relative py-16 px-8 text-center">
                            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                                Ready to explore great food?
                            </h2>
                            <p className="text-brand-100 mb-8 max-w-md mx-auto">
                                Join thousands of food lovers who use RestaurantFinder every day.
                            </p>
                            <div className="flex items-center justify-center gap-4 flex-wrap">
                                <Link to="/restaurants" className="bg-white text-brand-600 hover:bg-brand-50 font-bold px-8 py-3 rounded-xl transition-colors">
                                    Browse Restaurants
                                </Link>
                                {!isAuthenticated && (
                                    <button onClick={() => onAuthClick('register')}
                                        className="border border-white/40 text-white hover:bg-white/10 font-medium px-8 py-3 rounded-xl transition-colors">
                                        Create Account
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
