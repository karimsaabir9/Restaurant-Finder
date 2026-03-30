import { supabase } from '../lib/supabase'

export const restaurantService = {
    SELECT_STRING: `
        *,
        featured_by_profile:profiles!featured_by(name)
    `,

    // Get all restaurants with optional filters
    async getRestaurants({ search = '', category = '', sortBy = 'created_at' } = {}) {
        let query = supabase
            .from('restaurants')
            .select(restaurantService.SELECT_STRING)
            .order(sortBy, { ascending: false })

        if (search) {
            query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%,cuisine.ilike.%${search}%`)
        }
        if (category && category !== 'All') {
            query = query.eq('category', category)
        }

        const { data, error } = await query
        if (error) throw error
        return data || []
    },

    // Get single restaurant by ID
    async getRestaurantById(id) {
        const { data, error } = await supabase
            .from('restaurants')
            .select(restaurantService.SELECT_STRING)
            .eq('id', id)
            .single()
        if (error) throw error
        return data
    },

    // Get featured restaurants
    async getFeaturedRestaurants() {
        const { data, error } = await supabase
            .from('restaurants')
            .select(restaurantService.SELECT_STRING)
            .eq('featured', true)
            .order('created_at', { ascending: false })
            .limit(8)
        if (error) throw error
        return data || []
    },

    // Create restaurant (admin only)
    async createRestaurant(restaurant) {
        const { data, error } = await supabase
            .from('restaurants')
            .insert([restaurant])
            .select(restaurantService.SELECT_STRING)
            .single()
        if (error) throw error
        return data
    },

    // Update restaurant (admin only)
    async updateRestaurant(id, updates) {
        const { data, error } = await supabase
            .from('restaurants')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select(restaurantService.SELECT_STRING)
            .single()
        if (error) throw error
        return data
    },

    // Delete restaurant (admin only)
    async deleteRestaurant(id) {
        const { error } = await supabase
            .from('restaurants')
            .delete()
            .eq('id', id)
        if (error) throw error
    }
}
