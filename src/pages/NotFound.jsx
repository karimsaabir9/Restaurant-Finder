import { Link } from 'react-router-dom'
import { ChefHat, Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4">
            <div className="text-center animate-in">
                <div className="text-8xl font-black gradient-text mb-4">404</div>
                <div className="w-16 h-16 bg-dark-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <ChefHat size={28} className="text-dark-500 animate-float" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Page Not Found</h1>
                <p className="text-dark-400 mb-8 max-w-xs mx-auto">
                    Looks like you wandered off the menu. This page doesn't exist.
                </p>
                <div className="flex items-center justify-center gap-3">
                    <Link to="/" className="btn-primary flex items-center gap-2">
                        <Home size={15} /> Go Home
                    </Link>
                    <Link to="/restaurants" className="btn-secondary flex items-center gap-2">
                        <ArrowLeft size={15} /> Browse Restaurants
                    </Link>
                </div>
            </div>
        </div>
    )
}
