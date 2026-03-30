import { createContext, useContext, useReducer, useCallback } from 'react'
import { restaurantService } from '../services/restaurantService'
import { favoritesService } from '../services/favoritesService'
import { mockRestaurants } from '../lib/mockData'

const RESTAURANT_ACTIONS = {
    SET_RESTAURANTS: 'SET_RESTAURANTS',
    SET_LOADING: 'SET_LOADING',
    SET_ERROR: 'SET_ERROR',
    SET_FILTERS: 'SET_FILTERS',
    SET_FAVORITES: 'SET_FAVORITES',
    ADD_FAVORITE: 'ADD_FAVORITE',
    REMOVE_FAVORITE: 'REMOVE_FAVORITE',
    SET_SEARCH: 'SET_SEARCH',
    ADD_RESTAURANT: 'ADD_RESTAURANT',
    UPDATE_RESTAURANT: 'UPDATE_RESTAURANT',
    DELETE_RESTAURANT: 'DELETE_RESTAURANT',
}

const initialState = {
    restaurants: [],
    loading: false,
    error: null,
    search: '',
    category: 'All',
    sortBy: 'created_at',
    favorites: [],
    favoriteIds: new Set(),
}

function restaurantReducer(state, action) {
    switch (action.type) {
        case RESTAURANT_ACTIONS.SET_RESTAURANTS:
            return { ...state, restaurants: action.payload, loading: false, error: null }
        case RESTAURANT_ACTIONS.SET_LOADING:
            return { ...state, loading: action.payload }
        case RESTAURANT_ACTIONS.SET_ERROR:
            return { ...state, error: action.payload, loading: false }
        case RESTAURANT_ACTIONS.SET_FILTERS:
            return { ...state, ...action.payload }
        case RESTAURANT_ACTIONS.SET_SEARCH:
            return { ...state, search: action.payload }
        case RESTAURANT_ACTIONS.SET_FAVORITES:
            return {
                ...state,
                favorites: action.payload,
                favoriteIds: new Set(action.payload.map(f => f.restaurant_id || f.id)),
            }
        case RESTAURANT_ACTIONS.ADD_FAVORITE:
            return {
                ...state,
                favoriteIds: new Set([...state.favoriteIds, action.payload]),
            }
        case RESTAURANT_ACTIONS.REMOVE_FAVORITE:
            const newIds = new Set(state.favoriteIds)
            newIds.delete(action.payload)
            return {
                ...state,
                favoriteIds: newIds,
                favorites: state.favorites.filter(f => (f.restaurant_id || f.id) !== action.payload),
            }
        case RESTAURANT_ACTIONS.ADD_RESTAURANT:
            return { ...state, restaurants: [action.payload, ...state.restaurants] }
        case RESTAURANT_ACTIONS.UPDATE_RESTAURANT:
            return {
                ...state,
                restaurants: state.restaurants.map(r => r.id === action.payload.id ? action.payload : r)
            }
        case RESTAURANT_ACTIONS.DELETE_RESTAURANT:
            return {
                ...state,
                restaurants: state.restaurants.filter(r => r.id !== action.payload)
            }
        default:
            return state
    }
}

const RestaurantContext = createContext(null)

export function RestaurantProvider({ children }) {
    const [state, dispatch] = useReducer(restaurantReducer, initialState)

    const fetchRestaurants = useCallback(async (filters = {}) => {
        dispatch({ type: RESTAURANT_ACTIONS.SET_LOADING, payload: true })

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout')), 5000)
        )

        try {
            const data = await Promise.race([
                restaurantService.getRestaurants(filters),
                timeoutPromise
            ])
            dispatch({ type: RESTAURANT_ACTIONS.SET_RESTAURANTS, payload: data })
        } catch (err) {
            console.error('Context: fetchRestaurants error or timeout:', err.message)
            // Fallback to mock data if Supabase isn't configured or hangs
            dispatch({ type: RESTAURANT_ACTIONS.SET_RESTAURANTS, payload: mockRestaurants })
        }
    }, [])

    const fetchFavorites = useCallback(async (userId) => {
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timeout')), 5000)
        )

        try {
            const data = await Promise.race([
                favoritesService.getFavorites(userId),
                timeoutPromise
            ])
            dispatch({ type: RESTAURANT_ACTIONS.SET_FAVORITES, payload: data })
        } catch (err) {
            console.error('Context: fetchFavorites error or timeout:', err.message)
            dispatch({ type: RESTAURANT_ACTIONS.SET_FAVORITES, payload: [] })
        }
    }, [])

    const toggleFavorite = async (userId, restaurantId) => {
        const isFav = state.favoriteIds.has(restaurantId)
        try {
            if (isFav) {
                await favoritesService.removeFavorite(userId, restaurantId)
                dispatch({ type: RESTAURANT_ACTIONS.REMOVE_FAVORITE, payload: restaurantId })
            } else {
                await favoritesService.addFavorite(userId, restaurantId)
                dispatch({ type: RESTAURANT_ACTIONS.ADD_FAVORITE, payload: restaurantId })
                // Refresh full favorites list
                await fetchFavorites(userId)
            }
            return { success: true }
        } catch (error) {
            return { success: false, error: error.message }
        }
    }

    const setFilters = (filters) => {
        dispatch({ type: RESTAURANT_ACTIONS.SET_FILTERS, payload: filters })
    }

    const setSearch = (search) => {
        dispatch({ type: RESTAURANT_ACTIONS.SET_SEARCH, payload: search })
    }

    const addRestaurant = (restaurant) => {
        dispatch({ type: RESTAURANT_ACTIONS.ADD_RESTAURANT, payload: restaurant })
    }

    const updateRestaurant = (restaurant) => {
        dispatch({ type: RESTAURANT_ACTIONS.UPDATE_RESTAURANT, payload: restaurant })
    }

    const deleteRestaurant = (id) => {
        dispatch({ type: RESTAURANT_ACTIONS.DELETE_RESTAURANT, payload: id })
    }

    const value = {
        ...state,
        fetchRestaurants,
        fetchFavorites,
        toggleFavorite,
        setFilters,
        setSearch,
        addRestaurant,
        updateRestaurant,
        deleteRestaurant,
    }

    return <RestaurantContext.Provider value={value}>{children}</RestaurantContext.Provider>
}

export function useRestaurants() {
    const context = useContext(RestaurantContext)
    if (!context) throw new Error('useRestaurants must be used within RestaurantProvider')
    return context
}

export default RestaurantContext
