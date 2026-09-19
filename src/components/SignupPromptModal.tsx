import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, UserPlus } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function SignupPromptModal() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    async function check() {
      const hasOrdered = localStorage.getItem('essayz_has_ordered') === 'true'
      const justOrderedThisVisit = sessionStorage.getItem('essayz_just_ordered_this_visit') === 'true'
      const dismissed = localStorage.getItem('essayz_signup_dismissed') === 'true'
      if (!hasOrdered || justOrderedThisVisit || dismissed) return

      const { data } = await supabase.auth.getSession()
      if (data.session) return // already signed in

      const timer = setTimeout(() => setOpen(true), 1200)
      return () => clearTimeout(timer)
    }
    check()
  }, [])

  function dismiss(permanently: boolean) {
    if (permanently) localStorage.setItem('essayz_signup_dismissed', 'true')
    setOpen(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/40 flex items-end sm:items-center justify-center p-5"
          onClick={() => dismiss(false)}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface border hairline rounded-xl p-7 text-center relative"
          >
            <button
              onClick={() => dismiss(false)}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 text-ink-muted"
            >
              <X size={18} />
            </button>
            <UserPlus className="mx-auto mb-4 text-brand-blue" size={30} strokeWidth={1.5} />
            <h2 className="font-serif-display text-xl text-ink mb-2">Don't lose your history</h2>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              Create a free account so your past assignments and reviews are saved and easy to find
              next time.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  dismiss(false)
                  navigate('/account/login')
                }}
                className="bg-brand-blue text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98]"
              >
                Create Account
              </button>
              <button
                onClick={() => dismiss(true)}
                className="text-sm font-medium text-ink-muted hover:text-ink py-2"
              >
                Don't ask again
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
