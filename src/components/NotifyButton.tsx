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

export default function NotifyButton() {
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY
    setSupported(ok)
    if (!ok) return
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      setSubscribed(!!existing)
    })
  }, [])

  async function subscribe() {
    if (!supported || loading) return
    setLoading(true)
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
      const json = sub.toJSON()
      await supabase.from('push_subscriptions').insert({
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
      })
      setSubscribed(true)
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
      title={subscribed ? "You're subscribed to updates" : 'Get notified about new services'}
      className={`p-2 rounded-full transition-colors ${
        subscribed ? 'text-brand-blue' : 'text-black/60 hover:text-brand-blue hover:bg-black/5'
      }`}
    >
      {subscribed ? <BellRing size={20} /> : <Bell size={20} />}
    </motion.button>
  )
}
