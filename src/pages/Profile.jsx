import { useState, useEffect } from 'react'
import { User, Mail, FileText, Save, Camera, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { storageService } from '../services/storageService'
import toast from 'react-hot-toast'

export default function Profile() {
    const { profile, updateProfile, user } = useAuth()
    const [form, setForm] = useState({ name: '', bio: '' })
    const [saving, setSaving] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [edited, setEdited] = useState(false)

    // Sync form with profile once it loads
    useEffect(() => {
        if (profile) {
            setForm({
                name: profile.name || '',
                bio: profile.bio || '',
            })
        }
    }, [profile])

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        if (!file.type.startsWith('image/')) return toast.error('Please select an image file')

        setUploading(true)
        try {
            const publicUrl = await storageService.uploadFile('avatars', file, user.id)
            await updateProfile({ avatar_url: publicUrl })
            setEdited(true)
            toast.success('Avatar updated!')
        } catch (err) {
            toast.error('Failed to upload avatar: ' + (err.message || 'Unknown error'))
        } finally {
            setUploading(false)
        }
    }

    const set = (field) => (e) => {
        setForm({ ...form, [field]: e.target.value })
        setEdited(true)
    }

    const handleSave = async (e) => {
        e.preventDefault()
        if (!form.name.trim()) { toast.error('Name cannot be empty'); return }
        setSaving(true)
        const result = await updateProfile(form)
        if (result.success) {
            toast.success('Profile updated! ✅')
            setEdited(false)
        } else {
            toast.error(result.error || 'Failed to update profile')
        }
        setSaving(false)
    }

    const initial = (profile?.name || 'U')[0].toUpperCase()

    return (
        <div className="min-h-screen pt-20">
            <div className="bg-gradient-to-b from-dark-900 to-dark-950 border-b border-dark-800 py-10">
                <div className="page-container">
                    <h1 className="section-title">My Profile</h1>
                    <p className="section-subtitle">Manage your personal information</p>
                </div>
            </div>

            <div className="page-container py-10">
                <div className="max-w-2xl mx-auto">
                    <form onSubmit={handleSave} className="space-y-6">
                        {/* Avatar */}
                        <div className="card p-6 flex items-center gap-5">
                            <div className="relative">
                                {profile?.avatar_url ? (
                                    <img src={profile.avatar_url} alt={profile.name} className="w-20 h-20 rounded-2xl object-cover shadow-glow" />
                                ) : (
                                    <div className="w-20 h-20 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center text-white text-3xl font-black shadow-glow">
                                        {initial}
                                    </div>
                                )}

                                <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-dark-700 hover:bg-dark-600 border border-dark-600 rounded-full flex items-center justify-center text-dark-300 hover:text-white transition-colors cursor-pointer">
                                    {uploading ? <Loader2 size={13} className="animate-spin" /> : <Camera size={13} />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
                                </label>
                            </div>
                            <div>
                                <h2 className="font-bold text-white text-lg">{profile?.name || 'Your Name'}</h2>
                                <p className="text-dark-400 text-sm">{user?.email}</p>
                                {profile?.role === 'admin' && (
                                    <span className="badge bg-brand-500/10 text-brand-400 border border-brand-500/20 mt-1">Admin</span>
                                )}
                            </div>
                        </div>

                        {/* Fields */}
                        <div className="card p-6 space-y-5">
                            <h3 className="font-semibold text-white text-base">Personal Information</h3>

                            <div>
                                <label className="label flex items-center gap-1.5">
                                    <User size={13} /> Full Name
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={set('name')}
                                    placeholder="Your full name"
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="label flex items-center gap-1.5">
                                    <Mail size={13} /> Email Address
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    readOnly
                                    className="input-field opacity-50 cursor-not-allowed"
                                />
                                <p className="text-dark-600 text-xs mt-1.5">Email cannot be changed here.</p>
                            </div>

                            <div>
                                <label className="label flex items-center gap-1.5">
                                    <FileText size={13} /> Bio
                                </label>
                                <textarea
                                    value={form.bio}
                                    onChange={set('bio')}
                                    rows={4}
                                    className="input-field resize-none"
                                    placeholder="Tell others a bit about yourself and your food preferences..."
                                    maxLength={300}
                                />
                                <p className="text-dark-600 text-xs mt-1.5 text-right">{form.bio.length}/300</p>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={saving || !edited}
                                className="btn-primary flex items-center gap-2 px-8"
                            >
                                <Save size={15} />
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
