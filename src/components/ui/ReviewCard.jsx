import { useState } from 'react'
import { Star, ThumbsUp, MoreVertical, Trash2, Edit2, X, Check } from 'lucide-react'
import { reviewService } from '../../services/reviewService'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import clsx from 'clsx'
import StarRating from './StarRating'

function formatDate(dateStr) {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export default function ReviewCard({ review, onDelete, onUpdate }) {
    const { user } = useAuth()
    const [editing, setEditing] = useState(false)
    const [editRating, setEditRating] = useState(review.rating)
    const [editComment, setEditComment] = useState(review.comment || '')
    const [loading, setLoading] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const isOwner = user?.id === review.user_id
    const authorName = review.profiles?.name || 'Anonymous'
    const initial = authorName[0]?.toUpperCase()

    const handleUpdate = async () => {
        if (!editComment.trim()) return toast.error('Review cannot be empty')
        setLoading(true)
        try {
            const updated = await reviewService.updateReview(review.id, {
                rating: editRating,
                comment: editComment,
            })
            onUpdate?.(updated)
            setEditing(false)
            toast.success('Review updated!')
        } catch (err) {
            toast.error(err.message || 'Failed to update review')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        setLoading(true)
        try {
            await reviewService.deleteReview(review.id)
            onDelete?.(review.id)
            toast.success('Review deleted')
        } catch (err) {
            toast.error(err.message || 'Failed to delete review')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card p-5 animate-in">
            <div className="flex items-start justify-between gap-3">
                {/* Author */}
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {initial}
                    </div>
                    <div>
                        <p className="text-white font-semibold text-sm">{authorName}</p>
                        <p className="text-dark-500 text-xs">{formatDate(review.created_at)}</p>
                    </div>
                </div>

                {/* Right: rating + menu */}
                <div className="flex items-center gap-2">
                    {!editing && (
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map(i => (
                                <Star key={i} size={13}
                                    className={i <= review.rating ? 'text-amber-400 fill-amber-400' : 'text-dark-700'} />
                            ))}
                        </div>
                    )}
                    {isOwner && !editing && (
                        <div className="relative">
                            <button onClick={() => setMenuOpen(!menuOpen)}
                                className="p-1.5 rounded-lg hover:bg-dark-800 text-dark-400 hover:text-white transition-colors">
                                <MoreVertical size={14} />
                            </button>
                            {menuOpen && (
                                <div className="absolute right-0 mt-1 w-36 glass-dark rounded-xl border border-dark-700 shadow-card-hover py-1 z-10 animate-slide-down">
                                    <button
                                        onClick={() => { setEditing(true); setMenuOpen(false) }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                                        <Edit2 size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => { handleDelete(); setMenuOpen(false) }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-dark-800 transition-colors">
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Content or Edit */}
            {editing ? (
                <div className="mt-4 space-y-3">
                    <StarRating value={editRating} onChange={setEditRating} />
                    <textarea
                        value={editComment}
                        onChange={(e) => setEditComment(e.target.value)}
                        rows={3}
                        className="input-field resize-none text-sm"
                        placeholder="Update your review..."
                    />
                    <div className="flex gap-2">
                        <button onClick={handleUpdate} disabled={loading}
                            className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1">
                            <Check size={12} /> Save
                        </button>
                        <button onClick={() => setEditing(false)}
                            className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1">
                            <X size={12} /> Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <p className="text-dark-300 text-sm mt-3 leading-relaxed">{review.comment}</p>
            )}
        </div>
    )
}
