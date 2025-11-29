import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_URL environment variable. ' +
    'Please create a .env file in the root directory with your Supabase URL. ' +
    'See .env.example for reference.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing REACT_APP_SUPABASE_ANON_KEY environment variable. ' +
    'Please create a .env file in the root directory with your Supabase anon key. ' +
    'See .env.example for reference.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'sqale-auth-token',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  }
})
