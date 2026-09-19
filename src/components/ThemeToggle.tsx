import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export function getInitialTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light'
  return localStorage.getItem('essayz-theme') === 'dark' ? 'dark' : 'light'
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('essayz-theme', theme)
  }, [theme])

  return (
    <button
      onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      className="p-2 rounded-lg hover:bg-black/5 transition-colors text-ink"
    >
      {theme === 'light' ? (
        <Moon size={19} strokeWidth={1.75} />
      ) : (
        <Sun size={19} strokeWidth={1.75} />
      )}
    </button>
  )
}
