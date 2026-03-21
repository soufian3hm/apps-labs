'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-80px)] items-center justify-center p-6 bg-bg">
      <div className="w-full max-w-sm rounded-2xl border border-edge bg-surface shadow-2xl p-8">
        <div className="mb-8 font-display text-2xl font-bold text-fg text-center">
          Apps Labs Admin
        </div>
        
        {error && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-4 text-sm font-medium text-red-500 border border-red-500/20 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-edge bg-bg px-4 py-3 text-sm text-fg placeholder-fg-tertiary focus:border-accent focus:ring-0 transition-colors"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-fg mb-1.5" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-edge bg-bg px-4 py-3 text-sm text-fg placeholder-fg-tertiary focus:border-accent focus:ring-0 transition-colors"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-accent px-4 py-3.5 text-sm font-bold text-white transition-colors hover:bg-accent-hover disabled:opacity-50 mt-4"
          >
            {loading ? 'Authenticating...' : 'Secure Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
