import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

type Status = 'waiting' | 'ready' | 'invalid' | 'saving' | 'done'

export default function ResetPassword() {
  const [status, setStatus] = useState<Status>('waiting')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Supabase parses the recovery token from the URL and fires this event
    // once a temporary recovery session is established.
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready')
      }
    })

    // Fallback: the event can fire before this listener attaches. If a
    // session already exists shortly after mount, treat it as ready too.
    const timer = setTimeout(async () => {
      const { data } = await supabase.auth.getSession()
      setStatus((s) => (s === 'waiting' ? (data.session ? 'ready' : 'invalid') : s))
    }, 2500)

    return () => {
      sub.subscription.unsubscribe()
      clearTimeout(timer)
    }
  }, [])

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords don\u2019t match.')
      return
    }
    setStatus('saving')
    const { error: updateError } = await supabase.auth.updateUser({ password })
    if (updateError) {
      setError(updateError.message)
      setStatus('ready')
      return
    }

    // Route back to the right dashboard depending on account type
    const { data: sessionData } = await supabase.auth.getSession()
    const email = sessionData.session?.user.email
    const { data: adminRow } = email
      ? await supabase.from('admins').select('id').eq('email', email).maybeSingle()
      : { data: null }

    setStatus('done')
    setTimeout(() => navigate(adminRow ? '/admin' : '/account'), 1200)
  }

  return (
    <section className="max-w-[420px] mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
      <p className="eyebrow mb-3">Account Security</p>
      <h1 className="font-serif-display text-3xl text-ink mb-8">Reset Password</h1>

      {status === 'waiting' && <p className="text-ink-muted text-sm">Checking your link…</p>}

      {status === 'invalid' && (
        <div className="rounded-xl border hairline bg-surface p-6">
          <p className="text-sm text-ink-muted mb-4">
            This reset link is invalid or has expired. Request a new one from the sign-in page.
          </p>
        </div>
      )}

      {status === 'done' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border hairline bg-surface p-6"
        >
          <p className="text-sm font-semibold text-green-600">Password updated!</p>
          <p className="text-xs text-ink-muted mt-1">Taking you to your dashboard…</p>
        </motion.div>
      )}

      {(status === 'ready' || status === 'saving') && (
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border hairline bg-surface p-6 sm:p-8 space-y-4 text-left"
        >
          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-ink mb-1.5">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border hairline px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-ink mb-1.5">
              Confirm password
            </label>
            <input
              id="confirm-password"
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full rounded-lg border hairline px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
            />
          </div>
          {error && <p className="text-red-500 text-sm" role="alert">{error}</p>}
          <button
            type="submit"
            disabled={status === 'saving'}
            className="w-full bg-brand-blue text-white text-sm font-semibold py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {status === 'saving' ? 'Saving…' : 'Update Password'}
          </button>
        </motion.form>
      )}
    </section>
  )
}
