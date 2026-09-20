import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import KenyaPhoneInput from './KenyaPhoneInput'

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
  const [stage, setStage] = useState<'idle' | 'sent'>('idle')
  const [code, setCode] = useState('')
  const [sending, setSending] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [error, setError] = useState('')

  async function sendCode() {
    setSending(true)
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-otp', {
        body: { phone: value, context },
      })
      if (fnError || data?.error) throw new Error(data?.error || fnError?.message || 'Failed to send code')
      setStage('sent')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to send code')
    } finally {
      setSending(false)
    }
  }

  async function verifyCode() {
    setVerifying(true)
    setError('')
    try {
      const { data, error: fnError } = await supabase.functions.invoke('verify-otp', {
        body: { phone: value, code, context },
      })
      if (fnError || !data?.verified) throw new Error(data?.error || fnError?.message || 'Incorrect code')
      onVerified()
      setStage('idle')
      setCode('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Incorrect code')
    } finally {
      setVerifying(false)
    }
  }

  return (
    <div>
      <KenyaPhoneInput
        label={label}
        value={value}
        onChange={(v) => {
          onChange(v)
          setStage('idle')
        }}
      />
      {value && verified && (
        <p className="flex items-center gap-1.5 text-sm text-green-600 font-medium mt-1.5">
          <CheckCircle2 size={15} /> Verified
        </p>
      )}
      {value && !verified && stage === 'idle' && (
        <button
          type="button"
          onClick={sendCode}
          disabled={sending}
          className="text-sm font-semibold text-brand-blue mt-1.5 disabled:opacity-60"
        >
          {sending ? 'Sending code…' : 'Send verification code'}
        </button>
      )}
      {value && !verified && stage === 'sent' && (
        <div className="flex items-center gap-2 mt-2">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6-digit code"
            className="w-32 rounded-lg border border-black/10 px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={verifyCode}
            disabled={verifying || code.length !== 6}
            className="bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60"
          >
            {verifying ? 'Verifying…' : 'Verify'}
          </button>
          <button type="button" onClick={sendCode} className="text-xs text-ink-muted underline">
            Resend
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}
