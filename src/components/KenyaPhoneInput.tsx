import { useState, useEffect } from 'react'

/** Value is always the canonical form "254XXXXXXXXX" (no +, no spaces) or '' */
export default function KenyaPhoneInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (canonical: string) => void
}) {
  const [local, setLocal] = useState(value.startsWith('254') ? value.slice(3) : value)
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    setLocal(value.startsWith('254') ? value.slice(3) : value)
  }, [value])

  const isValid = /^(7|1)\d{8}$/.test(local)
  const showError = touched && local.length > 0 && !isValid

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 9)
    setLocal(digits)
    onChange(digits.length === 9 && /^(7|1)\d{8}$/.test(digits) ? `254${digits}` : '')
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div
        className={`flex items-center rounded-xl border px-3 py-2.5 ${
          showError ? 'border-red-400' : 'border-black/10'
        }`}
      >
        <span className="text-lg mr-1.5" aria-hidden>
          🇰🇪
        </span>
        <span className="text-sm text-black/60 font-medium mr-1.5 shrink-0">+254</span>
        <input
          type="tel"
          inputMode="numeric"
          placeholder="712345678"
          value={local}
          onChange={(e) => handleChange(e.target.value)}
          onBlur={() => setTouched(true)}
          className="flex-1 min-w-0 outline-none text-sm bg-transparent"
        />
      </div>
      {showError && (
        <p className="text-red-500 text-xs mt-1">
          Enter a valid Kenyan number — 9 digits starting with 7 or 1 (e.g. 712345678).
        </p>
      )}
    </div>
  )
}
