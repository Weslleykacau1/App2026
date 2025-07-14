
import { createClient } from '@supabase/supabase-js'

// IMPORTANT: These variables should be stored in your .env.local file.
// See the Supabase documentation for how to find these values.
const supabaseUrl = 'https://cfwmzfhdkaivevpidgcm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmd216Zmhka2FpdmV2cGlkZ2NtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDM1MDksImV4cCI6MjA2ODA3OTUwOX0.N371AmYrePXHKjiteHlZu9pkWjD4r1wh3yjyL9sLL8s'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
