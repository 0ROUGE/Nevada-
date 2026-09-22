import { useEffect, useRef, useState } from 'react'

export default function OtpInput({
  onComplete,
  disabled = false,
}: {
  onComplete: (code: string) => void
  disabled?: boolean
}) {
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

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
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el
          }}
          value={d}
          disabled={disabled}
          onChange={(e) => setDigit(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          inputMode="numeric"
          maxLength={1}
          autoComplete="one-time-code"
          className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-semibold rounded-lg border hairline focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow disabled:opacity-50"
        />
      ))}
    </div>
  )
}
