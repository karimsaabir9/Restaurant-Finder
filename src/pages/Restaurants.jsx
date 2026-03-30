import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useRestaurants } from '../context/RestaurantContext'
import { useAuth } from '../context/AuthContext'
import RestaurantCard from '../components/ui/RestaurantCard'
import SearchBar from '../components/ui/SearchBar'
import FilterBar from '../components/ui/FilterBar'
import EmptyState from '../components/ui/EmptyState'
import { GridSkeleton } from '../components/ui/LoadingSpinner'
import { mockRestaurants } from '../lib/mockData'

export default function Restaurants({ onAuthClick }) {
    const [searchParams] = useSearchParams()
    const { restaurants, loading, fetchRestaurants, setFilters } = useRestaurants()
    const { isAuthenticated } = useAuth()

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [category, setCategory] = useState(searchParams.get('category') || 'All')
    const [sortBy, setSortBy] = useState('created_at')

    // Load restaurants on mount and filter change
    useEffect(() => {
        fetchRestaurants({ search, category, sortBy })
    }, [search, category, sortBy])

    // When URL params change update state
    useEffect(() => {
        const urlSearch = searchParams.get('search') || ''
        const urlCat = searchParams.get('category') || 'All'
        setSearch(urlSearch)
        setCategory(urlCat)
    }, [searchParams])

    // Client-side filter for mock data / search
    const displayed = restaurants.length > 0 ? restaurants : mockRestaurants

    const filtered = displayed.filter(r => {
        const matchSearch = !search ||
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            (r.location || '').toLowerCase().includes(search.toLowerCase()) ||
            (r.cuisine || '').toLowerCase().includes(search.toLowerCase())
        const matchCategory = category === 'All' || r.category === category || r.cuisine === category
        return matchSearch && matchCategory
    }).sort((a, b) => {
        if (sortBy === 'created_at') return new Date(b.created_at) - new Date(a.created_at)
        if (sortBy === 'avg_rating') return (b.avg_rating || 0) - (a.avg_rating || 0)
        if (sortBy === 'total_reviews') return (b.total_reviews || 0) - (a.total_reviews || 0)
        if (sortBy === 'name') return a.name.localeCompare(b.name)
        return 0
    })

    return (
        <div className="min-h-screen pt-20">
            {/* Header */}
            <div className="bg-gradient-to-b from-dark-900 to-dark-950 border-b border-dark-800 py-10">
                <div className="page-container">
                    <h1 className="section-title mb-1">All Restaurants</h1>
                    <p className="section-subtitle mb-6">
                        {filtered.length} restaurant{filtered.length !== 1 ? 's' : ''} found
                    </p>
                    <SearchBar value={search} onChange={setSearch} />
                </div>
            </div>

            <div className="page-container py-8">
                {/* Filters */}
                <div className="mb-8">
                    <FilterBar
                        category={category}
                        sortBy={sortBy}
                        onCategoryChange={setCategory}
                        onSortChange={setSortBy}
                    />
                </div>

                {/* Grid */}
                {loading ? (
                    <GridSkeleton count={8} />
                ) : filtered.length === 0 ? (
                    <EmptyState
                        type={search ? 'search' : 'restaurants'}
                        action={
                            <button onClick={() => { setSearch(''); setCategory('All') }} className="btn-primary">
                                Clear Filters
                            </button>
                        }
                    />
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in">
                        {filtered.map(restaurant => (
                            <RestaurantCard
                                key={restaurant.id}
                                restaurant={restaurant}
                                onAuthRequired={() => onAuthClick?.('login')}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
