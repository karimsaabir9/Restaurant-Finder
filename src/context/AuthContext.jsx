import { createContext, useContext, useReducer, useEffect } from 'react'
import { authService } from '../services/authService'

// Action types
const AUTH_ACTIONS = {
    SET_LOADING: 'SET_LOADING',
    SET_USER: 'SET_USER',
    SET_PROFILE: 'SET_PROFILE',
    CLEAR_USER: 'CLEAR_USER',
    SET_ERROR: 'SET_ERROR',
}

// Initial state
const initialState = {
    user: null,
    profile: JSON.parse(localStorage.getItem('rf_profile')) || null,
    loading: true,
    error: null,
}

// Reducer
function authReducer(state, action) {
    switch (action.type) {
        case AUTH_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload }
        case AUTH_ACTIONS.SET_USER:
            return { ...state, user: action.payload, loading: false, error: null }
        case AUTH_ACTIONS.SET_PROFILE:
            if (action.payload) {
                localStorage.setItem('rf_profile', JSON.stringify(action.payload))
            } else {
                localStorage.removeItem('rf_profile')
            }
            return { ...state, profile: action.payload }
        case AUTH_ACTIONS.CLEAR_USER:
            localStorage.removeItem('rf_profile')
            return { ...state, user: null, profile: null, loading: false, error: null }
        case AUTH_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false }
        default:
            return state
    }
}

// Context
const AuthContext = createContext(null)

// Provider
export function AuthProvider({ children }) {
    const [state, dispatch] = useReducer(authReducer, initialState)

    // Fetch profile helper
    const fetchProfile = async (userId) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
        )

        try {
            const profile = await Promise.race([
                authService.getUserProfile(userId),
                timeoutPromise
            ])
            dispatch({ type: AUTH_ACTIONS.SET_PROFILE, payload: profile })
            return profile
        } catch (err) {
            console.error('AuthContext: Profile fetch error or timeout:', err.message)
            return null
        }
    }

    // Initialize auth on mount
    useEffect(() => {
        const init = async () => {
            try {
                const session = await authService.getSession()
                if (session?.user) {
                    dispatch({ type: AUTH_ACTIONS.SET_USER, payload: session.user })
                    await fetchProfile(session.user.id)
                } else {
                    dispatch({ type: AUTH_ACTIONS.CLEAR_USER })
                }
            } catch {
                dispatch({ type: AUTH_ACTIONS.CLEAR_USER })
            }
        }
        init()

        // Listen for auth changes
        const { data: { subscription } } = authService.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                dispatch({ type: AUTH_ACTIONS.SET_USER, payload: session.user })
                await fetchProfile(session.user.id)
            } else if (event === 'SIGNED_OUT') {
                dispatch({ type: AUTH_ACTIONS.CLEAR_USER })
            } else if (event === 'USER_UPDATED' && session?.user) {
                dispatch({ type: AUTH_ACTIONS.SET_USER, payload: session.user })
                await fetchProfile(session.user.id)
            }
        })

        return () => subscription?.unsubscribe()
    }, [])

    // Auth actions
    const signUp = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        try {
            const data = await authService.signUp(credentials)
            return { success: true, data }
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message })
            return { success: false, error: error.message }
        }
    }

    const signIn = async (credentials) => {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        try {
            const data = await authService.signIn(credentials)
            return { success: true, data }
        } catch (error) {
            dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: error.message })
            return { success: false, error: error.message }
        }
    }

    const signOut = async () => {
        try {
            await authService.signOut()
            dispatch({ type: AUTH_ACTIONS.CLEAR_USER })
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const updateProfile = async (updates) => {
        if (!state.user) return { success: false, error: 'Not authenticated' }
        try {
            const updated = await authService.updateProfile(state.user.id, updates)
            dispatch({ type: AUTH_ACTIONS.SET_PROFILE, payload: updated })
            return { success: true, data: updated }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const isAdmin = state.profile?.role === 'admin'

    const value = {
        ...state,
        isAdmin,
        isAuthenticated: !!state.user,
        signUp,
        signIn,
        signOut,
        updateProfile,
        refreshProfile: () => state.user && fetchProfile(state.user.id),
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within AuthProvider')
    return context
}

export default AuthContext
