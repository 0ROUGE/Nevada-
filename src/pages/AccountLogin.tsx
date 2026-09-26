import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, Mail } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import OtpInput from '../components/OtpInput'

function safeRedirect(path: string | null): string {
  if (!path) return '/account'
  // Only allow internal, same-origin paths — never an absolute or protocol-relative URL.
  if (!path.startsWith('/') || path.startsWith('//')) return '/account'
  return path
}

type Mode = 'signup' | 'login' | 'forgot' | 'code-request' | 'code-verify'

export default function AccountLogin() {
  const [mode, setMode] = useState<Mode>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [agreed, setAgreed] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [otpKey, setOtpKey] = useState(0)
  const [shakeKey, setShakeKey] = useState(0)
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirectTo = safeRedirect(searchParams.get('redirect'))
  const cameFromService = redirectTo.startsWith('/service/')

  async function afterAuthSuccess() {
    await supabase.rpc('claim_anonymous_activity', { p_session_id: getSessionId() })
    navigate(redirectTo)
  }

  async function sendLoginCode() {
    if (!agreed) {
      setError('Please agree to the Terms & Conditions to continue.')
      return
    }
    setLoading(true)
    setError('')
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    })
    setLoading(false)
    if (otpError) {
      setError(otpError.message)
      return
    }
    setMode('code-verify')
  }

  async function verifyLoginCode(code: string) {
    setLoading(true)
    setError('')
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    })
    if (verifyError) {
      setError('Incorrect or expired code.')
      setShakeKey((k) => k + 1)
      setOtpKey((k) => k + 1)
      setLoading(false)
      return
    }
    await afterAuthSuccess()
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()

    if (mode === 'forgot') {
      setLoading(true)
      setError('')
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      setLoading(false)
      if (resetError) {
        setError(resetError.message)
        return
      }
      setResetSent(true)
      return
    }

    if (mode === 'code-request') {
      await sendLoginCode()
      return
    }

    if (mode === 'signup' && !agreed) {
      setError('Please agree to the Terms & Conditions to continue.')
      return
    }
    setLoading(true)
    setError('')

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({ email, password })
      if (signUpError) {
        setError(signUpError.message)
        setLoading(false)
        return
      }
      await afterAuthSuccess()
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
      if (signInError) {
        setError(signInError.message)
        setLoading(false)
        return
      }
      await afterAuthSuccess()
    }
    setLoading(false)
  }

  const title =
    mode === 'signup'
      ? 'Create an account'
      : mode === 'forgot'
        ? 'Reset your password'
        : mode === 'code-request'
          ? 'Sign in with a code'
          : mode === 'code-verify'
            ? 'Enter your code'
            : 'Welcome back'

  const subtitle =
    mode === 'forgot'
      ? "We'll email you a link to set a new password."
      : mode === 'code-request'
        ? "We'll email you a one-time code — no password needed."
        : mode === 'code-verify'
          ? `Enter the 6-digit code sent to ${email}`
          : cameFromService
            ? 'Create a free account to see the full details of this service.'
            : mode === 'signup'
              ? 'Keep track of your assignments and reviews.'
              : 'Sign in to see your history.'

  return (
    <section className="max-w-[420px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="text-center mb-8">
        <p className="eyebrow mb-3">Your Account</p>
        <h1 className="font-serif-display text-3xl text-ink">{title}</h1>
        <p className="text-ink-muted text-sm mt-2">{subtitle}</p>
      </div>

      <AnimatePresence mode="wait">
        {resetSent ? (
          <motion.div
            key="reset-sent"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl border hairline bg-surface p-6 text-center"
          >
            <p className="text-sm font-semibold text-brand-blue">Check your email</p>
            <p className="text-xs text-ink-muted mt-1">
              We've sent a reset link to {email}. It expires shortly, so use it soon.
            </p>
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setResetSent(false)
              }}
              className="text-sm font-medium text-ink-muted hover:text-brand-blue mt-4"
            >
              Back to sign in
            </button>
          </motion.div>
        ) : mode === 'code-verify' ? (
          <motion.div
            key="code-verify"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
            className="rounded-xl border hairline bg-surface p-6 sm:p-8 text-center"
          >
            <button
              type="button"
              onClick={() => {
                setMode('code-request')
                setError('')
              }}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink mb-5"
            >
              <ArrowLeft size={13} /> Change email
            </button>
            <OtpInput key={otpKey} onComplete={verifyLoginCode} disabled={loading} shakeKey={shakeKey} />
            {error && (
              <p className="text-red-500 text-xs mt-3" role="alert">
                {error}
              </p>
            )}
            <button
              type="button"
              onClick={sendLoginCode}
              disabled={loading}
              className="text-xs text-brand-blue font-semibold underline mt-4 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Resend code'}
            </button>
          </motion.div>
        ) : (
          <motion.form
            key={mode}
            onSubmit={submit}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
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

            {mode !== 'forgot' && mode !== 'code-request' && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="acc-password" className="block text-sm font-semibold text-ink">
                    Password
                  </label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot')
                        setError('')
                      }}
                      className="text-xs font-medium text-brand-blue hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
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
            )}

            {(mode === 'signup' || mode === 'code-request') && (
              <label className="flex items-start gap-2.5 text-sm text-ink-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 accent-brand-blue"
                />
                <span>
                  I agree to the{' '}
                  <Link to="/terms" target="_blank" className="text-brand-blue font-medium underline">
                    Terms &amp; Conditions
                  </Link>
                </span>
              </label>
            )}

            {error && (
              <p className="text-red-500 text-sm" role="alert">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading || ((mode === 'signup' || mode === 'code-request') && !agreed)}
              className="w-full bg-brand-blue text-white text-sm font-semibold py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98] disabled:opacity-60"
            >
              {loading
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create Account'
                  : mode === 'forgot'
                    ? 'Send Reset Link'
                    : mode === 'code-request'
                      ? 'Send Code'
                      : 'Sign In'}
            </button>

            {mode === 'code-request' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
                className="w-full text-sm font-medium text-ink-muted hover:text-brand-blue"
              >
                Use a password instead
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'login' : mode === 'forgot' ? 'login' : 'signup')
                  setError('')
                }}
                className="w-full text-sm font-medium text-ink-muted hover:text-brand-blue"
              >
                {mode === 'signup'
                  ? 'Already have an account? Sign in'
                  : mode === 'forgot'
                    ? 'Back to sign in'
                    : "Don't have an account? Sign up"}
              </button>
            )}

            {(mode === 'login' || mode === 'signup') && (
              <button
                type="button"
                onClick={() => {
                  setMode('code-request')
                  setError('')
                }}
                className="w-full flex items-center justify-center gap-1.5 text-xs font-medium text-ink-muted hover:text-brand-blue border-t hairline pt-3"
              >
                <Mail size={13} />
                Sign in with a code instead
              </button>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </section>
  )
}
