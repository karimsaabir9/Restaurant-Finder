import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, ChefHat, User, LogOut, LayoutDashboard, Shield, Heart, ChevronDown } from 'lucide-react'
import clsx from 'clsx'

export default function Navbar({ onAuthClick }) {
    const { isAuthenticated, profile, isAdmin, signOut } = useAuth()
    const navigate = useNavigate()
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const dropdownRef = useRef(null)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleSignOut = async () => {
        await signOut()
        setDropdownOpen(false)
        navigate('/')
    }

    const navLinks = [
        { to: '/', label: 'Home' },
        { to: '/restaurants', label: 'Restaurants' },
        { to: '/about', label: 'About' },
    ]

    const avatarInitial = (profile?.name || 'U')[0].toUpperCase()

    return (
        <nav
            className={clsx(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-dark-950/95 backdrop-blur-md border-b border-dark-800/60 shadow-xl'
                    : 'bg-transparent'
            )}
        >
            <div className="page-container">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2.5 group">
                        <div className="w-9 h-9 bg-gradient-to-br from-brand-400 to-brand-600 rounded-xl flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform">
                            <ChefHat size={18} className="text-white" />
                        </div>
                        <span className="font-bold text-lg text-white">
                            Restaurant<span className="gradient-text">Finder</span>
                        </span>
                    </Link>

                    {/* Desktop Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {navLinks.map(link => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.to === '/'}
                                className={({ isActive }) => clsx(
                                    'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                                    isActive
                                        ? 'text-brand-400 bg-brand-500/10'
                                        : 'text-dark-300 hover:text-white hover:bg-dark-800'
                                )}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="hidden md:flex items-center gap-3">
                        {isAuthenticated ? (
                            <>
                                {!isAdmin && (
                                    <Link to="/dashboard" className="btn-ghost text-sm flex items-center gap-1.5">
                                        <LayoutDashboard size={15} />
                                        Dashboard
                                    </Link>
                                )}
                                {/* User Dropdown */}
                                <div className="relative" ref={dropdownRef}>
                                    <button
                                        onClick={() => setDropdownOpen(!dropdownOpen)}
                                        className="flex items-center gap-2 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded-xl px-3 py-1.5 transition-all"
                                    >
                                        <div className="w-7 h-7 rounded-lg overflow-hidden flex-shrink-0 border border-dark-700">
                                            {profile?.avatar_url ? (
                                                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
                                                    {avatarInitial}
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-sm text-dark-200 max-w-[100px] truncate ml-0.5">
                                            {isAdmin ? 'Admin' : (profile?.name || 'User')}
                                        </span>
                                        <ChevronDown size={14} className={clsx('text-dark-400 transition-transform', dropdownOpen && 'rotate-180')} />
                                    </button>

                                    {dropdownOpen && (
                                        <div className="absolute right-0 mt-2 w-52 glass-dark rounded-xl border border-dark-700 shadow-card-hover animate-slide-down py-1 z-50">
                                            <Link to="/profile" onClick={() => setDropdownOpen(false)}
                                                className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-200 hover:text-white hover:bg-dark-800 transition-colors">
                                                <User size={14} /> Profile
                                            </Link>
                                            {!isAdmin && (
                                                <Link to="/dashboard" onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-dark-200 hover:text-white hover:bg-dark-800 transition-colors">
                                                    <Heart size={14} /> My Favorites
                                                </Link>
                                            )}
                                            {isAdmin && (
                                                <Link to="/admin" onClick={() => setDropdownOpen(false)}
                                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-400 hover:bg-dark-800 transition-colors">
                                                    <Shield size={14} /> Admin Panel
                                                </Link>
                                            )}
                                            <div className="border-t border-dark-700 my-1" />
                                            <button onClick={handleSignOut}
                                                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-dark-800 transition-colors text-left">
                                                <LogOut size={14} /> Sign Out
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <button onClick={() => onAuthClick('login')} className="btn-ghost text-sm">Sign In</button>
                                <button onClick={() => onAuthClick('register')} className="btn-primary text-sm py-2 px-4">Get Started</button>
                            </>
                        )}
                    </div>

                    {/* Mobile hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden p-2 rounded-lg text-dark-300 hover:text-white hover:bg-dark-800 transition-colors"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileOpen && (
                <div className="md:hidden bg-dark-950/98 backdrop-blur-md border-t border-dark-800 animate-slide-down">
                    <div className="page-container py-4 space-y-1">
                        {navLinks.map(link => (
                            <NavLink key={link.to} to={link.to} end={link.to === '/'}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) => clsx(
                                    'block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive ? 'text-brand-400 bg-brand-500/10' : 'text-dark-300 hover:text-white hover:bg-dark-800'
                                )}>
                                {link.label}
                            </NavLink>
                        ))}
                        {isAuthenticated ? (
                            <>
                                {!isAdmin && (
                                    <Link to="/dashboard" onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                                        Dashboard
                                    </Link>
                                )}
                                <Link to="/profile" onClick={() => setMobileOpen(false)}
                                    className="block px-4 py-2.5 rounded-lg text-sm text-dark-300 hover:text-white hover:bg-dark-800 transition-colors">
                                    Profile
                                </Link>
                                {isAdmin && (
                                    <Link to="/admin" onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-2.5 rounded-lg text-sm text-brand-400 hover:bg-dark-800 transition-colors">
                                        Admin Panel
                                    </Link>
                                )}
                                <button onClick={() => { handleSignOut(); setMobileOpen(false) }}
                                    className="w-full text-left px-4 py-2.5 rounded-lg text-sm text-red-400 hover:bg-dark-800 transition-colors">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <div className="flex gap-2 pt-2">
                                <button onClick={() => { onAuthClick('login'); setMobileOpen(false) }} className="flex-1 btn-secondary text-sm">Sign In</button>
                                <button onClick={() => { onAuthClick('register'); setMobileOpen(false) }} className="flex-1 btn-primary text-sm">Register</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    )
}
