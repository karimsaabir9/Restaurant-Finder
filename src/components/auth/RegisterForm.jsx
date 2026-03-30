import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, User, ChefHat } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function RegisterForm({ onSwitchToLogin, onClose }) {
    const { signUp } = useAuth()
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.name || !form.email || !form.password) {
            toast.error('Please fill in all fields')
            return
        }
        if (form.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        if (form.password !== form.confirm) {
            toast.error('Passwords do not match')
            return
        }
        setLoading(true)
        const result = await signUp({ email: form.email, password: form.password, name: form.name })

        // Supabase returns success even if email exists but identities are empty (security)
        const isExists = result.success && result.data?.user?.identities?.length === 0

        if (result.success && !isExists) {
            toast.success('Account created! Check your email to verify. 🎉')
            onClose?.()
        } else {
            let errorMsg = result.error || 'Registration failed'

            if (result.error?.toLowerCase().includes('already registered') || isExists) {
                errorMsg = 'This email is already registered. Please use a different one.'
            } else if (result.error?.toLowerCase().includes('rate limit')) {
                errorMsg = 'Too many attempts. Please wait a few minutes and try again.'
            }

            toast.error(errorMsg)
        }
        setLoading(false)
    }

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    return (
        <div className="p-6">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <ChefHat size={22} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Create account</h2>
                <p className="text-dark-400 text-sm mt-1">Join RestaurantFinder today</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                    <label className="label">Full Name</label>
                    <div className="relative">
                        <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input type="text" value={form.name} onChange={set('name')}
                            placeholder="John Doe" className="input-field pl-10" autoComplete="name" />
                    </div>
                </div>

                <div>
                    <label className="label">Email</label>
                    <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input type="email" value={form.email} onChange={set('email')}
                            placeholder="you@example.com" className="input-field pl-10" autoComplete="email" />
                    </div>
                </div>

                <div>
                    <label className="label">Password</label>
                    <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={set('password')}
                            placeholder="Min. 6 characters" className="input-field pl-10 pr-10" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>

                <div>
                    <label className="label">Confirm Password</label>
                    <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input type={showConfirmPassword ? 'text' : 'password'} value={form.confirm} onChange={set('confirm')}
                            placeholder="Repeat password" className="input-field pl-10 pr-10" autoComplete="new-password" />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                            {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                    {loading ? 'Creating account...' : 'Create Account'}
                </button>
            </form>

            <p className="text-center text-dark-400 text-sm mt-5">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    Sign in
                </button>
            </p>
        </div>
    )
}
