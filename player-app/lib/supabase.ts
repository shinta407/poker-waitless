import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Ensure the player has an authenticated session (anonymous sign-in).
// Must be called before any write operations to satisfy RLS policies.
let authInitPromise: Promise<void> | null = null

export function ensureAuth(): Promise<void> {
  if (authInitPromise) return authInitPromise

  authInitPromise = (async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      const { error } = await supabase.auth.signInAnonymously()
      if (error) {
        console.error('Anonymous sign-in failed:', error.message)
        authInitPromise = null
      }
    }
  })()

  return authInitPromise
}

// Mock user for development (before LIFF integration)
export const getMockUser = () => ({
  userId: 'mock_user_001',
  displayName: 'テストユーザー',
  pictureUrl: undefined,
})
