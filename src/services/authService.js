import { supabase } from '../lib/supabase'

export const authService = {
    // Sign up new user
    async signUp({ email, password, name }) {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { name }
            }
        })
        if (error) throw error
        return data
    },

    // Sign in existing user
    async signIn({ email, password }) {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        })
        if (error) throw error
        return data
    },

    // Sign out
    async signOut() {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
    },

    // Get current session
    async getSession() {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        return session
    },

    // Get current user profile
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
        if (error) throw error
        return data
    },

    // Update user profile
    async updateProfile(userId, updates) {
        const { data, error } = await supabase
            .from('profiles')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', userId)
            .select()
            .single()
        if (error) throw error
        return data
    },

    // Get total user count (regular users only)
    async getUserCount() {
        try {
            const { count, error } = await supabase
                .from('profiles')
                .select('*', { count: 'exact' })
                .eq('role', 'user')
                .limit(1)
            if (error) throw error
            return count || 0
        } catch (err) {
            console.error('Error counting users:', err)
            return 0
        }
    },

    // Listen for auth state changes
    onAuthStateChange(callback) {
        return supabase.auth.onAuthStateChange(callback)
    }
}
