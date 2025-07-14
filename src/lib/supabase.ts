
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These variables should be stored in your .env.local file.
// See the Supabase documentation for how to find these values.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
