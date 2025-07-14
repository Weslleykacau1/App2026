
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These variables should be stored in your .env.local file.
// See the Supabase documentation for how to find these values.
const supabaseUrl = 'https://fyrlctyzrzwrqbhmnpef.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5cmxjdHl6cnp3cnFiaG1ucGVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI0MTE3NzAsImV4cCI6MjA2Nzk4Nzc3MH0.HLnPkMUIqiofPOxhmanmFj-F38W7EpbJaoT8STVlmaM'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
