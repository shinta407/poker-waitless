import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Types based on database schema
export interface Store {
  id: string
  name: string
  location: { lat: number; lng: number }
  rates: string[]
  created_at: string
  updated_at: string
}

export interface Table {
  id: string
  store_id: string
  rate: string
  max_seats: number
  current_players: number
  status: 'open' | 'closed'
  created_at: string
  updated_at: string
}

export interface WaitlistEntry {
  id: string
  store_id: string
  user_id: string
  user_name: string
  rate_preference: string | null
  status: 'waiting' | 'called' | 'arrived' | 'seated' | 'cancelled'
  called_at: string | null
  arrival_estimation_minutes: number | null
  created_at: string
  updated_at: string
}
