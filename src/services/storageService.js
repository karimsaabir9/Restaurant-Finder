import { supabase } from '../lib/supabase'

export const storageService = {
    /**
     * Uploads a file to a Supabase storage bucket.
     * @param {string} bucket - The name of the bucket (e.g., 'restaurants', 'avatars').
     * @param {File} file - The file to upload.
     * @param {string} path - Optional folder path or specific filename.
     * @returns {Promise<string>} - The public URL of the uploaded image.
     */
    async uploadFile(bucket, file, path = '') {
        const fileExt = file.name.split('.').pop()
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
        const filePath = path ? `${path}/${fileName}` : fileName

        // 1. Upload the file
        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file)

        if (uploadError) throw uploadError

        // 2. Get the public URL
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath)

        return publicUrl
    },

    /**
     * Deletes a file from a Supabase storage bucket given its public URL.
     * @param {string} bucket - The name of the bucket.
     * @param {string} publicUrl - The full public URL of the file.
     */
    async deleteFileByUrl(bucket, publicUrl) {
        if (!publicUrl) return

        try {
            // Extract the path from the URL
            // URL format: https://[project-id].supabase.co/storage/v1/object/public/[bucket]/[path]
            const urlParts = publicUrl.split(`/public/${bucket}/`)
            if (urlParts.length < 2) return

            const filePath = urlParts[1]
            const { error } = await supabase.storage.from(bucket).remove([filePath])
            if (error) console.error('Error deleting file:', error)
        } catch (err) {
            console.error('Error parsing storage URL for deletion:', err)
        }
    }
}
