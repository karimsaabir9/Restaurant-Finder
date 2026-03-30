import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, X, Check, Star, Utensils, MessageSquare, Users, Loader2 } from 'lucide-react'
import { restaurantService } from '../../services/restaurantService'
import { reviewService } from '../../services/reviewService'
import { storageService } from '../../services/storageService'
import { authService } from '../../services/authService'
import { useRestaurants } from '../../context/RestaurantContext'
import { mockRestaurants } from '../../lib/mockData'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const EMPTY_FORM = {
    name: '', description: '', image_url: '', location: '',
    address: '', category: 'Restaurant', cuisine: 'American', price_range: '$$',
    phone: '', hours: '', featured: false,
}

function StatCard({ icon: Icon, value, label }) {
    return (
        <div className="card p-5">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-500/10 rounded-xl flex items-center justify-center">
                    <Icon size={18} className="text-brand-400" />
                </div>
                <div>
                    <div className="text-2xl font-black text-white">{value}</div>
                    <div className="text-dark-400 text-xs">{label}</div>
                </div>
            </div>
        </div>
    )
}

export default function AdminDashboard() {
    const { profile } = useAuth()
    const { addRestaurant, updateRestaurant, deleteRestaurant: ctxDelete } = useRestaurants()
    const [restaurants, setRestaurants] = useState([])
    const [reviews, setReviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState('restaurants')
    const [showForm, setShowForm] = useState(false)
    const [editTarget, setEditTarget] = useState(null)
    const [form, setForm] = useState(EMPTY_FORM)
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [userCount, setUserCount] = useState(0)

    useEffect(() => {
        const load = async () => {
            setLoading(true)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Fetch timeout')), 5000)
            )

            try {
                const [rests, revs, uCount] = await Promise.race([
                    Promise.all([
                        restaurantService.getRestaurants(),
                        reviewService.getAllReviews(),
                        authService.getUserCount(),
                    ]),
                    timeoutPromise
                ])
                setRestaurants(rests.length > 0 ? rests : mockRestaurants)
                setReviews(revs)
                setUserCount(uCount)
            } catch (err) {
                console.error('Admin: fetch error or timeout:', err.message)
                setRestaurants(mockRestaurants)
                setReviews([])
            } finally {
                setLoading(false)
            }
        }
        load()
    }, [])

    const openAdd = () => { setForm(EMPTY_FORM); setEditTarget(null); setShowForm(true) }
    const openEdit = (r) => { setForm({ ...r }); setEditTarget(r.id); setShowForm(true) }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) { toast.error('Name is required'); return }
        setSaving(true)
        try {
            if (editTarget) {
                const updated = await restaurantService.updateRestaurant(editTarget, form)
                setRestaurants(p => p.map(r => r.id === editTarget ? updated : r))
                updateRestaurant(updated)
                toast.success('Restaurant updated!')
            } else {
                const created = await restaurantService.createRestaurant(form)
                setRestaurants(p => [created, ...p])
                addRestaurant(created)
                toast.success('Restaurant added!')
            }
            setShowForm(false)
        } catch (err) {
            toast.error(err.message || 'Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Delete this restaurant? This cannot be undone.')) return
        try {
            await restaurantService.deleteRestaurant(id)
            setRestaurants(p => p.filter(r => r.id !== id))
            ctxDelete(id)
            toast.success('Deleted!')
        } catch (err) {
            toast.error(err.message || 'Failed to delete')
        }
    }

    const handleDeleteReview = async (id) => {
        if (!confirm('Delete this review?')) return
        try {
            await reviewService.deleteReview(id)
            setReviews(p => p.filter(r => r.id !== id))
            toast.success('Review deleted')
        } catch (err) {
            toast.error(err.message || 'Failed to delete review')
        }
    }

    const toggleFeatured = async (id, current) => {
        try {
            const updated = await restaurantService.updateRestaurant(id, { featured: !current })
            setRestaurants(p => p.map(r => r.id === id ? updated : r))
            updateRestaurant(updated)
            toast.success(`Featured ${!current ? 'Enabled' : 'Disabled'}`)
        } catch (err) {
            toast.error(err.message || 'Failed to toggle')
        }
    }

    const set = (f) => (e) => setForm({ ...form, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value })

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) return toast.error('Please select an image file')

        setUploading(true)
        try {
            const publicUrl = await storageService.uploadFile('restaurants', file)
            setForm({ ...form, image_url: publicUrl })
            toast.success('Image uploaded!')
        } catch (err) {
            toast.error('Failed to upload image: ' + (err.message || 'Unknown error'))
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="min-h-screen pt-20">
            <div className="bg-gradient-to-r from-dark-900 to-dark-950 border-b border-dark-800 py-8">
                <div className="page-container flex items-center justify-between gap-4 flex-wrap">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 text-[10px]">Admin</span>
                        </div>
                        <h1 className="section-title !mb-0">Admin Dashboard</h1>
                        <p className="text-dark-400 text-sm">Manage restaurants and reviews</p>
                    </div>
                    {activeTab === 'restaurants' && (
                        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                            <Plus size={15} /> Add Restaurant
                        </button>
                    )}
                </div>
            </div>

            <div className="page-container py-8 space-y-6">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard icon={Utensils} value={restaurants.length} label="Total Restaurants" />
                    <StatCard icon={MessageSquare} value={reviews.length} label="Total Reviews" />
                    <StatCard icon={Star} value={restaurants.filter(r => r.featured).length} label="Featured" />
                    <StatCard icon={Users} value={userCount} label="Total Users" />
                </div>

                {/* Tabs */}
                <div className="flex gap-1 bg-dark-900 border border-dark-800 rounded-xl p-1 w-fit">
                    {['restaurants', 'reviews'].map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-brand-500 text-white' : 'text-dark-400 hover:text-white'
                                }`}>
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Add/Edit Form */}
                {showForm && (
                    <div className="card p-6 animate-slide-down">
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="font-bold text-white">{editTarget ? 'Edit Restaurant' : 'Add New Restaurant'}</h3>
                            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-dark-800 rounded-lg text-dark-400 hover:text-white transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                {[
                                    { f: 'name', label: 'Restaurant Name *', placeholder: 'e.g. The Golden Fork' },
                                    { f: 'location', label: 'Location', placeholder: 'e.g. Downtown, New York' },
                                    { f: 'address', label: 'Full Address', placeholder: '123 Main St, NY 10001' },
                                    { f: 'phone', label: 'Phone', placeholder: '+1 (212) 555-0101' },
                                    { f: 'hours', label: 'Hours', placeholder: 'Mon-Sun: 11am - 10pm' },
                                ].map(({ f, label, placeholder }) => (
                                    <div key={f}>
                                        <label className="label">{label}</label>
                                        <input type="text" value={form[f] || ''} onChange={set(f)}
                                            placeholder={placeholder} className="input-field" />
                                    </div>
                                ))}
                                <div>
                                    <label className="label text-xs">Restaurant Image</label>
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-dark-800 border border-dark-700 overflow-hidden flex-shrink-0">
                                            {form.image_url ? (
                                                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-dark-600">
                                                    <Utensils size={18} />
                                                </div>
                                            )}
                                        </div>
                                        <label className="flex-1">
                                            <div className="btn-secondary text-xs py-2 w-full text-center flex items-center justify-center gap-2 cursor-pointer">
                                                {uploading ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                                                {uploading ? 'Uploading...' : 'Upload Image'}
                                            </div>
                                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                    <input type="hidden" value={form.image_url || ''} />
                                </div>
                                <div>
                                    <label className="label">Category</label>
                                    <select value={form.category} onChange={set('category')} className="input-field">
                                        {['Fine Dining', 'Restaurant', 'Casual', 'Seafood', 'Cafe', 'Fast Food', 'Bakery'].map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Price Range</label>
                                    <select value={form.price_range} onChange={set('price_range')} className="input-field">
                                        {['$', '$$', '$$$', '$$$$'].map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="mb-4">
                                <label className="label">Description</label>
                                <textarea value={form.description || ''} onChange={set('description')} rows={3}
                                    className="input-field resize-none" placeholder="Restaurant description..." />
                            </div>
                            <div className="flex items-center gap-3 mb-5">
                                <input type="checkbox" id="featured" checked={form.featured} onChange={set('featured')}
                                    className="w-4 h-4 accent-brand-500" />
                                <label htmlFor="featured" className="text-sm text-dark-300 cursor-pointer">Mark as Featured</label>
                            </div>
                            <div className="flex gap-3">
                                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                                    <Check size={14} /> {saving ? 'Saving...' : 'Save'}
                                </button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Restaurants Table */}
                {activeTab === 'restaurants' && (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-dark-800/50 border-b border-dark-700">
                                    <tr>
                                        {['Name', 'Location', 'Category', 'Rating', 'Featured', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {restaurants.map(r => (
                                        <tr key={r.id} className="hover:bg-dark-800/30 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    {r.image_url && (
                                                        <img src={r.image_url} alt={r.name}
                                                            className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
                                                    )}
                                                    <span className="text-white font-medium text-sm">{r.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-dark-400 text-sm">{r.location}</td>
                                            <td className="px-4 py-3">
                                                <span className="badge bg-dark-800 text-dark-300 text-[10px]">{r.category}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Star size={11} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-white text-sm">{Number(r.avg_rating || 0).toFixed(1)}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleFeatured(r.id, r.featured)}
                                                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${r.featured ? 'bg-brand-500' : 'bg-dark-700'
                                                        }`}
                                                >
                                                    <span
                                                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${r.featured ? 'translate-x-5' : 'translate-x-1'
                                                            }`}
                                                    />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => openEdit(r)}
                                                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-dark-700 text-dark-400 hover:text-white transition-colors">
                                                        <Edit2 size={13} />
                                                    </button>
                                                    <button onClick={() => handleDelete(r.id)}
                                                        className="p-1.5 rounded-lg bg-dark-800 hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors">
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Reviews Table */}
                {activeTab === 'reviews' && (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-dark-800/50 border-b border-dark-700">
                                    <tr>
                                        {['User', 'Restaurant', 'Rating', 'Comment', 'Actions'].map(h => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-dark-400 uppercase tracking-wider">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dark-800">
                                    {reviews.length === 0 ? (
                                        <tr><td colSpan={5} className="px-4 py-10 text-center text-dark-400 text-sm">No reviews found</td></tr>
                                    ) : reviews.map(r => (
                                        <tr key={r.id} className="hover:bg-dark-800/30 transition-colors">
                                            <td className="px-4 py-3 text-sm text-white">{r.profiles?.name || 'User'}</td>
                                            <td className="px-4 py-3 text-sm text-dark-300">{r.restaurants?.name || '—'}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-1">
                                                    <Star size={11} className="text-amber-400 fill-amber-400" />
                                                    <span className="text-white text-sm">{r.rating}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-dark-400 text-xs max-w-xs truncate">{r.comment}</td>
                                            <td className="px-4 py-3">
                                                <button onClick={() => handleDeleteReview(r.id)}
                                                    className="p-1.5 rounded-lg bg-dark-800 hover:bg-red-500/20 text-dark-400 hover:text-red-400 transition-colors">
                                                    <Trash2 size={13} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
