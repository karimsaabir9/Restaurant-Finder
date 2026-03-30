import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { PageLoader } from '../ui/LoadingSpinner'

export default function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, loading } = useAuth()

    if (loading) return <PageLoader />
    if (!isAuthenticated || !isAdmin) return <Navigate to="/" replace />
    return children
}
