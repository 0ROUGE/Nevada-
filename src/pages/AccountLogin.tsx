import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'

export default function AccountLogin() {
  const [mode, setMode] = useState<'signup' | 'login'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      // Link any orders/reviews made before this account existed
      await supabase.rpc('claim_anonymous_activity', { p_session_id: getSessionId() })
      navigate('/account')
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      await supabase.rpc('claim_anonymous_activity', { p_session_id: getSessionId() })
      navigate('/account')
    }
    setLoading(false)
  }

  return (
    <section className="max-w-[420px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="text-center mb-8">
        <p className="eyebrow mb-3">Your Account</p>
        <h1 className="font-serif-display text-3xl text-ink">
          {mode === 'signup' ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-ink-muted text-sm mt-2">
          {mode === 'signup'
            ? 'Keep track of your assignments and reviews.'
            : 'Sign in to see your history.'}
        </p>
      </div>

      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border hairline bg-surface p-6 sm:p-8 space-y-4"
      >
        <div>
          <label htmlFor="acc-email" className="block text-sm font-semibold text-ink mb-1.5">
            Email
          </label>
          <input
            id="acc-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border hairline px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
          />
        </div>
        <div>
          <label htmlFor="acc-password" className="block text-sm font-semibold text-ink mb-1.5">
            Password
          </label>
          <input
            id="acc-password"
            type="password"
            required
            minLength={6}
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
          {loading ? 'Please wait…' : mode === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signup' ? 'login' : 'signup')
            setError('')
          }}
          className="w-full text-sm font-medium text-ink-muted hover:text-brand-blue"
        >
          {mode === 'signup' ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
        </button>
      </motion.form>
    </section>
  )
}
