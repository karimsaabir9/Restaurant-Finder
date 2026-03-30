import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { RestaurantProvider } from './context/RestaurantContext'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import Modal from './components/ui/Modal'
import LoginForm from './components/auth/LoginForm'
import RegisterForm from './components/auth/RegisterForm'
import ProtectedRoute from './components/routes/ProtectedRoute'
import AdminRoute from './components/routes/AdminRoute'

// Pages
import Home from './pages/Home'
import Restaurants from './pages/Restaurants'
import RestaurantDetails from './pages/RestaurantDetails'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import About from './pages/About'
import AdminDashboard from './pages/admin/AdminDashboard'
import NotFound from './pages/NotFound'

// Scroll to top on navigation
function ScrollToTop() {
    const { pathname } = useLocation()
    useEffect(() => { window.scrollTo(0, 0) }, [pathname])
    return null
}

// Auth Modal wrapper
function AuthModal({ isOpen, mode, onClose, onSwitch }) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            {mode === 'login' ? (
                <LoginForm onSwitchToRegister={() => onSwitch('register')} onClose={onClose} />
            ) : (
                <RegisterForm onSwitchToLogin={() => onSwitch('login')} onClose={onClose} />
            )}
        </Modal>
    )
}

function AppContent() {
    const [authModal, setAuthModal] = useState({ open: false, mode: 'login' })
    const location = useLocation()

    // Open auth modal if redirected here with authRequired
    useEffect(() => {
        if (location.state?.authRequired) {
            setAuthModal({ open: true, mode: 'login' })
        }
    }, [location.state])

    const openAuth = (mode = 'login') => setAuthModal({ open: true, mode })
    const closeAuth = () => setAuthModal({ open: false, mode: 'login' })
    const switchAuth = (mode) => setAuthModal({ open: true, mode })

    return (
        <div className="flex flex-col min-h-screen">
            <Navbar onAuthClick={openAuth} />

            <main className="flex-1">
                <Routes>
                    <Route path="/" element={<Home onAuthClick={openAuth} />} />
                    <Route path="/restaurants" element={<Restaurants onAuthClick={openAuth} />} />
                    <Route path="/restaurants/:id" element={<RestaurantDetails onAuthClick={openAuth} />} />
                    <Route path="/about" element={<About />} />

                    {/* Protected routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute><Dashboard onAuthClick={openAuth} /></ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute><Profile /></ProtectedRoute>
                    } />

                    {/* Admin route */}
                    <Route path="/admin" element={
                        <AdminRoute><AdminDashboard /></AdminRoute>
                    } />

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </main>

            <Footer />

            {/* Auth Modal */}
            <AuthModal
                isOpen={authModal.open}
                mode={authModal.mode}
                onClose={closeAuth}
                onSwitch={switchAuth}
            />

            {/* Toast notifications */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#1e293b',
                        color: '#f1f5f9',
                        border: '1px solid #334155',
                        borderRadius: '12px',
                        fontSize: '14px',
                    },
                    success: { iconTheme: { primary: '#f97316', secondary: '#fff' } },
                }}
            />
        </div>
    )
}

export default function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <AuthProvider>
                <RestaurantProvider>
                    <ScrollToTop />
                    <AppContent />
                </RestaurantProvider>
            </AuthProvider>
        </BrowserRouter>
    )
}
