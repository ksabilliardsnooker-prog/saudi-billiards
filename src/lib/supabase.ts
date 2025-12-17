import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vdbzlrpuvkjmthzdlsjg.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkYnpscnB1dmtqbXRoemRsc2pnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTc5ODUsImV4cCI6MjA4MTQ3Mzk4NX0.jeQuSrZaBrLvrPtt1fQ99hTvMESchwCoe_Hn0QzB33Q'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
