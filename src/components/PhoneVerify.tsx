import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import KenyaPhoneInput from './KenyaPhoneInput'
import OtpInput from './OtpInput'

type Channel = 'sms' | 'whatsapp' | 'email'

export default function PhoneVerify({
  label,
  value,
  onChange,
  verified,
  onVerified,
  context,
}: {
  label: string
  value: string
  onChange: (canonical: string) => void
  verified: boolean
  onVerified: () => void
  context: string
}) {
  const [channel, setChannel] = useState<Channel>('email')
  const [emailAddress, setEmailAddress] = useState('')
  const [stage, setStage] = useState<'idle' | 'sent'>('idle')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')
  const [otpKey, setOtpKey] = useState(0)

  async function sendCode() {
    if (channel === 'whatsapp') {
      setError('WhatsApp sending isn\u2019t set up yet \u2014 use SMS or Email for now.')
      return
    }
    setSending(true)
    setError('')
    try {
      const body =
        channel === 'email'
          ? { email: emailAddress, channel: 'email', context }
          : { phone: value, channel: 'sms', context }
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', { body })
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message || 'Failed to send code')
      setStage('sent')
      setOtpKey((k) => k + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send code')
    } finally {
      setSending(false)
    }
  }

  async function verifyCode(code: string) {
    setVerifying(true)
    setError('')
    try {
      const body =
        channel === 'email' ? { email: emailAddress, code, context } : { phone: value, code, context }
      const { data, error: fnError } = await supabase.functions.invoke('verify-otp', { body })
      if (fnError || !data?.verified) throw new Error(data?.error || fnError?.message || 'Incorrect code')
      onVerified()
      setStage('idle')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Incorrect code')
    } finally {
      setVerifying(false)
    }
  }

  if (verified) {
    return (
      <div>
        {label && <p className="text-sm font-medium mb-1">{label}</p>}
        <p className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
          <CheckCircle2 size={15} /> {value ? `+254 ${value.slice(3)} verified` : 'Verified'}
        </p>
      </div>
    )
  }

  const canSend = channel === 'email' ? !!emailAddress : !!value

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {stage === 'idle' ? (
          <motion.div
            key="entry"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex gap-1.5 mb-3">
              {(['email', 'sms', 'whatsapp'] as Channel[]).map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setChannel(c)
                    setError('')
                  }}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    channel === c ? 'bg-brand-blue text-white' : 'bg-brand-blue-tint text-brand-blue'
                  }`}
                >
                  {c === 'sms' ? 'SMS' : c === 'whatsapp' ? 'WhatsApp' : 'Email'}
                </button>
              ))}
            </div>

            {channel === 'email' ? (
              <div>
                {label && <label className="block text-sm font-medium mb-1">{label}</label>}
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-black/10 px-4 py-2.5 text-sm"
                />
              </div>
            ) : (
              <KenyaPhoneInput label={label} value={value} onChange={onChange} />
            )}

            {canSend && (
              <button
                type="button"
                onClick={sendCode}
                disabled={sending}
                className="w-full mt-2 bg-brand-blue text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98] disabled:opacity-60"
              >
                {sending ? 'Sending…' : 'Send Code'}
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.2 }}
            className="text-center"
          >
            <button
              type="button"
              onClick={() => {
                setStage('idle')
                setError('')
              }}
              className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink mb-3"
            >
              <ArrowLeft size={13} /> Change {channel === 'email' ? 'email' : 'number'}
            </button>
            <p className="text-sm text-ink mb-1 font-medium">Enter the code we sent</p>
            <p className="text-xs text-ink-muted mb-4">
              {channel === 'email' ? emailAddress : `+254 ${value.slice(3)}`}
            </p>
            <OtpInput key={otpKey} onComplete={verifyCode} disabled={verifying} />
            <div className="flex items-center justify-center gap-3 mt-4">
              {verifying && <span className="text-xs text-ink-muted">Verifying…</span>}
              <button type="button" onClick={sendCode} disabled={sending} className="text-xs text-brand-blue font-semibold underline disabled:opacity-60">
                {sending ? 'Resending…' : 'Resend code'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}
