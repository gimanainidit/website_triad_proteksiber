import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface Resource {
  id: string
  title: string
  slug: string
  description: string
  category: string
  tags: string[]
  file_url: string
  file_size: string
  file_type: string
  created_at: string
  content?: string
}