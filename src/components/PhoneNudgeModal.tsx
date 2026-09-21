import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, PhoneCall } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function PhoneNudgeModal() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined

    async function check() {
      if (location.pathname === '/account' || location.pathname === '/account/login') return
      const justOrderedThisVisit = sessionStorage.getItem('essayz_just_ordered_this_visit') === 'true'
      const dismissed = localStorage.getItem('essayz_phone_nudge_dismissed') === 'true'
      if (justOrderedThisVisit || dismissed) return

      const { data: sessionData } = await supabase.auth.getSession()
      const session = sessionData.session
      if (!session) return // nudge only applies to signed-in customers

      const [{ data: profile }, { count: orderCount }] = await Promise.all([
        supabase
          .from('customer_profiles')
          .select('phone_verified')
          .eq('user_id', session.user.id)
          .maybeSingle(),
        supabase
          .from('customer_orders')
          .select('id', { count: 'exact', head: true }),
      ])

      if (profile?.phone_verified) return // already verified
      if (!orderCount || orderCount === 0) return // only nudge after a first order

      timer = setTimeout(() => setOpen(true), 1200)
    }

    check()
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [])

  function dismiss(permanently: boolean) {
    if (permanently) localStorage.setItem('essayz_phone_nudge_dismissed', 'true')
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
            <PhoneCall className="mx-auto mb-4 text-brand-blue" size={30} strokeWidth={1.5} />
            <h2 className="font-serif-display text-xl text-ink mb-2">Never miss an update</h2>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              Add and verify your phone number to get SMS updates about your assignments.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  dismiss(false)
                  navigate('/account')
                }}
                className="bg-brand-blue text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98]"
              >
                Add Phone Number
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
