import { useState } from 'react'
import { Eye, EyeOff, Mail, Lock, ChefHat } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function LoginForm({ onSwitchToRegister, onClose }) {
    const { signIn } = useAuth()
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) {
            toast.error('Please fill in all fields')
            return
        }
        setLoading(true)
        const result = await signIn(form)
        if (result.success) {
            toast.success('Welcome back! 🍽️')
            onClose?.()
        } else {
            toast.error(result.error || 'Sign in failed')
        }
        setLoading(false)
    }

    return (
        <div className="p-6">
            <div className="text-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <ChefHat size={22} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-white">Welcome back</h2>
                <p className="text-dark-400 text-sm mt-1">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="label">Email</label>
                    <div className="relative">
                        <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input
                            type="email"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="you@example.com"
                            className="input-field pl-10"
                            autoComplete="email"
                        />
                    </div>
                </div>

                <div>
                    <label className="label">Password</label>
                    <div className="relative">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                            placeholder="••••••••"
                            className="input-field pl-10 pr-10"
                            autoComplete="current-password"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors">
                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            <p className="text-center text-dark-400 text-sm mt-5">
                Don&apos;t have an account?{' '}
                <button onClick={onSwitchToRegister} className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
                    Sign up
                </button>
            </p>
        </div>
    )
}
