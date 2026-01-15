import { Database } from './supabase'

export type Tea = Database['public']['Tables']['teas']['Row']
export type Article = Database['public']['Tables']['articles']['Row']
