import { supabase } from '../lib/supabase'

export const favoritesService = {
    // Get all favorites for a user (with restaurant details)
    async getFavorites(userId) {
        const { data, error } = await supabase
            .from('favorites')
            .select(`
        *,
        restaurants (*)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    // Get just the restaurant IDs that user has favorited
    async getFavoriteIds(userId) {
        const { data, error } = await supabase
            .from('favorites')
            .select('restaurant_id')
            .eq('user_id', userId)
        if (error) throw error
        return (data || []).map(f => f.restaurant_id)
    },

    // Add a restaurant to favorites
    async addFavorite(userId, restaurantId) {
        const { data, error } = await supabase
            .from('favorites')
            .insert([{ user_id: userId, restaurant_id: restaurantId }])
            .select()
            .single()
        if (error) throw error
        return data
    },

    // Remove a restaurant from favorites
    async removeFavorite(userId, restaurantId) {
        const { error } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', userId)
            .eq('restaurant_id', restaurantId)
        if (error) throw error
    },

    // Check if a restaurant is favorited
    async isFavorite(userId, restaurantId) {
        const { data, error } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', userId)
            .eq('restaurant_id', restaurantId)
            .single()
        if (error && error.code !== 'PGRST116') throw error
        return !!data
    }
}
