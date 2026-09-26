import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

export default function OtpInput({
  onComplete,
  disabled = false,
  shakeKey = 0,
}: {
  onComplete: (code: string) => void
  disabled?: boolean
  /** Increment this from the parent whenever a submitted code was wrong, to trigger a shake. */
  shakeKey?: number
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const [pulseIndex, setPulseIndex] = useState<number | null>(null)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  // Auto-focus the first box as soon as it mounts
  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  // WebOTP: on supporting browsers (Chrome on Android), this auto-reads a code
  // from an incoming SMS without the user touching anything, as long as the SMS
  // body ends with a line like "@essayz.vercel.app #123456".
  useEffect(() => {
    if (!('OTPCredential' in window)) return
    const ac = new AbortController()
    const getOtp = navigator.credentials.get as (opts: {
      otp: { transport: string[] }
      signal: AbortSignal
    }) => Promise<{ code?: string } | null>

    getOtp({ otp: { transport: ['sms'] }, signal: ac.signal })
      .then((otp) => {
        if (otp?.code) {
          const clean = otp.code.replace(/\D/g, '').slice(0, 6)
          setDigits(clean.padEnd(6, '').split('').slice(0, 6))
          if (clean.length === 6) onComplete(clean)
        }
      })
      .catch(() => {})
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function setDigit(index: number, value: string) {
    const clean = value.replace(/\D/g, '')
    if (!clean) {
      const next = [...digits]
      next[index] = ''
      setDigits(next)
      return
    }
    const next = [...digits]
    next[index] = clean[clean.length - 1]
    setDigits(next)
    setPulseIndex(index)
    if (index < 5) inputRefs.current[index + 1]?.focus()
    if (next.every((d) => d !== '')) onComplete(next.join(''))
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (!pasted) return
    e.preventDefault()
    const next = pasted.padEnd(6, '').split('').slice(0, 6)
    setDigits(next)
    const lastFilled = Math.min(pasted.length, 6) - 1
    inputRefs.current[Math.max(lastFilled, 0)]?.focus()
    if (pasted.length === 6) onComplete(pasted)
  }

  return (
    <motion.div
      className="flex gap-2 justify-center"
      onPaste={handlePaste}
      animate={shakeKey > 0 ? { x: [0, -8, 8, -6, 6, -3, 3, 0] } : {}}
      transition={{ duration: 0.4 }}
      key={shakeKey > 0 ? `shake-${shakeKey}` : 'still'}
    >
      {digits.map((d, i) => (
        <motion.input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          initial={{ opacity: 0, y: 8 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: pulseIndex === i ? [1, 1.12, 1] : 1,
          }}
          transition={{
            opacity: { duration: 0.25, delay: i * 0.04 },
            y: { duration: 0.25, delay: i * 0.04 },
            scale: { duration: 0.22 },
          }}
          onAnimationComplete={() => {
            if (pulseIndex === i) setPulseIndex(null)
          }}
          value={d}
          disabled={disabled}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-lg border-2 focus:outline-none transition-colors disabled:opacity-50 ${
            d ? 'border-brand-blue bg-brand-blue-tint text-brand-blue' : 'hairline bg-surface'
          } focus:border-brand-blue focus:ring-4 focus:ring-brand-blue/15`}
        />
      ))}
    </motion.div>
  )
}
