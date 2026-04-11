import { createClient as createSupabaseClient } from '@supabase/supabase-js'

let supabase = null

export const createClient = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY.')
  }

  if (!supabase) {
    supabase = createSupabaseClient(supabaseUrl, supabaseKey)
  }

  return supabase
}
