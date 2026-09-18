import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../../lib/supabase'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      navigate('/admin')
    }
  }

  async function loginWithGoogle() {
    setError('')
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/admin` },
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink px-6">
      <motion.form
        onSubmit={login}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-xl bg-white p-8 sm:p-10 space-y-5"
      >
        <div className="text-center mb-2">
          <p className="font-serif-display text-3xl font-semibold text-ink">Essayz</p>
          <p className="text-xs uppercase tracking-widest text-ink-muted mt-1">Admin</p>
        </div>
        <div>
          <label htmlFor="admin-email" className="block text-sm font-semibold text-ink mb-1.5">Email</label>
          <input
            id="admin-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border hairline px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-sm font-semibold text-ink mb-1.5">Password</label>
          <input
            id="admin-password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border hairline px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
          />
        </div>
        {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-blue text-white text-sm font-semibold py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-hairline" />
          <span className="text-xs text-ink-muted">OR</span>
          <div className="h-px flex-1 bg-hairline" />
        </div>

        <button
          type="button"
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center gap-2 border hairline py-3 rounded-lg text-sm font-semibold hover:bg-black/[0.03] transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z" />
            <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.34 0-4.33-1.58-5.04-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
            <path fill="#FBBC05" d="M3.96 10.71A5.4 5.4 0 0 1 3.68 9c0-.59.1-1.17.28-1.71V4.96H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.04l3-2.33Z" />
            <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.96l3 2.33C4.67 5.16 6.66 3.58 9 3.58Z" />
          </svg>
          Continue with Google
        </button>
      </motion.form>
    </div>
  )
}
