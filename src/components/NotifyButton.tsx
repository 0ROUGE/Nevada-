import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, BellRing, BellOff } from 'lucide-react'
import { supabase } from '../lib/supabase'
import NewFeatureDot from './NewFeatureDot'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string
const LAST_SEEN_KEY = 'essayz_last_seen_notification_at'

type NotificationRow = {
  id: string
  title: string
  body: string | null
  url: string | null
  created_at: string
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
}

async function insertSubscription(sub: PushSubscription, role: 'public' | 'admin', adminEmail?: string) {
  const json = sub.toJSON()
  return supabase.from('push_subscriptions').upsert(
    {
      endpoint: json.endpoint,
      p256dh: json.keys?.p256dh,
      auth: json.keys?.auth,
      role,
      admin_email: adminEmail ?? null,
    },
    { onConflict: 'endpoint' }
  )
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

export default function NotifyButton() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [hasUnread, setHasUnread] = useState(false)

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY
    setSupported(ok)
    if (ok) {
      navigator.serviceWorker.register('/sw.js').then(async (reg) => {
        const existing = await reg.pushManager.getSubscription()
        if (!existing) {
          setSubscribed(false)
          return
        }
        const { data } = await supabase
          .from('push_subscriptions')
          .select('id')
          .eq('endpoint', existing.endpoint)
          .maybeSingle()

        if (data) {
          setSubscribed(true)
        } else {
          const { error: healError } = await insertSubscription(existing, 'public')
          setSubscribed(!healError)
        }
      })
    }

    supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15)
      .then(({ data }) => {
        const rows = data ?? []
        setNotifications(rows)
        try {
          const lastSeen = localStorage.getItem(LAST_SEEN_KEY)
          const newest = rows[0]?.created_at
          setHasUnread(!!newest && (!lastSeen || new Date(newest) > new Date(lastSeen)))
        } catch {
          setHasUnread(false)
        }
      })
  }, [])

  async function subscribe() {
    if (!supported || loading) return
    setLoading(true)
    setError(false)
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setLoading(false)
        return
      }
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const { error: insertError } = await insertSubscription(sub, 'public')
      if (insertError) {
        setError(true)
        await sub.unsubscribe()
        return
      }
      setSubscribed(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  function toggleOpen() {
    setOpen((o) => !o)
    if (!open && notifications[0]) {
      try {
        localStorage.setItem(LAST_SEEN_KEY, notifications[0].created_at)
      } catch {
        // ignore
      }
      setHasUnread(false)
    }
  }

  return (
    <div className="relative">
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleOpen}
        title="Notifications"
        className="relative p-2 rounded-full transition-colors text-ink-muted hover:text-brand-blue hover:bg-black/5"
      >
        {subscribed ? <BellRing size={20} className="text-brand-blue" /> : <Bell size={20} />}
        <NewFeatureDot show={hasUnread} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 max-h-[70vh] overflow-y-auto bg-surface border hairline rounded-xl shadow-lg z-50"
            >
              {supported && !subscribed && (
                <div className="p-3 border-b hairline">
                  <button
                    onClick={subscribe}
                    disabled={loading}
                    className="w-full text-xs font-semibold bg-brand-blue text-white py-2 rounded-lg hover:bg-brand-blue-light disabled:opacity-60"
                  >
                    {loading ? 'Enabling…' : error ? 'Try again' : 'Enable push notifications'}
                  </button>
                </div>
              )}
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-ink-muted text-sm flex flex-col items-center gap-2">
                  <BellOff size={20} />
                  No notifications yet
                </div>
              ) : (
                <div className="divide-y hairline">
                  {notifications.map((n) => (
                    <div key={n.id} className="p-3.5">
                      <p className="text-sm font-semibold text-ink">{n.title}</p>
                      {n.body && <p className="text-xs text-ink-muted mt-0.5">{n.body}</p>}
                      <p className="text-[11px] text-ink-muted/70 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
