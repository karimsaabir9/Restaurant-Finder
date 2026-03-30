import { supabase } from '../lib/supabase'

export const reviewService = {
    // Get reviews for a restaurant
    async getReviewsByRestaurant(restaurantId) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        profiles (id, name, avatar_url)
      `)
            .eq('restaurant_id', restaurantId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    // Get reviews by user
    async getReviewsByUser(userId) {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
        *,
        restaurants (id, name, image_url, location)
      `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    },

    // Add a review
    async addReview({ userId, restaurantId, rating, comment }) {
        const { data, error } = await supabase
            .from('reviews')
            .insert([{ user_id: userId, restaurant_id: restaurantId, rating, comment }])
            .select(`*, profiles (id, name, avatar_url)`)
            .single()
        if (error) throw error
        return data
    },

    // Update a review
    async updateReview(reviewId, { rating, comment }) {
        const { data, error } = await supabase
            .from('reviews')
            .update({ rating, comment, updated_at: new Date().toISOString() })
            .eq('id', reviewId)
            .select(`*, profiles (id, name, avatar_url)`)
            .single()
        if (error) throw error
        return data
    },

    // Delete a review
    async deleteReview(reviewId) {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId)
        if (error) throw error
    },

    // Get all reviews (admin)
    async getAllReviews() {
        const { data, error } = await supabase
            .from('reviews')
            .select(`*, profiles (name, email), restaurants (name)`)
            .order('created_at', { ascending: false })
        if (error) throw error
        return data || []
    }
}
