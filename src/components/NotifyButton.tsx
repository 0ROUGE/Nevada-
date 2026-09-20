import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, BellRing } from 'lucide-react'
import { supabase } from '../lib/supabase'

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

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

export default function NotifyButton() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY
    setSupported(ok)
    if (!ok) return

    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      if (!existing) {
        setSubscribed(false)
        return
      }
      // Don't trust the browser alone — confirm a matching row actually exists.
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('endpoint', existing.endpoint)
        .maybeSingle()

      if (data) {
        setSubscribed(true)
      } else {
        // Stale browser permission with no DB record — heal it silently.
        const { error: healError } = await insertSubscription(existing, 'public')
        setSubscribed(!healError)
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

  if (!supported) return null

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={subscribe}
      disabled={subscribed || loading}
      title={
        error
          ? 'Something went wrong — tap to try again'
          : subscribed
            ? "You're subscribed to updates"
            : 'Get notified about new services'
      }
      className={`p-2 rounded-full transition-colors ${
        error
          ? 'text-red-500'
          : subscribed
            ? 'text-brand-blue'
            : 'text-ink-muted hover:text-brand-blue hover:bg-black/5'
      }`}
    >
      {subscribed ? <BellRing size={20} /> : <Bell size={20} />}
    </motion.button>
  )
}
