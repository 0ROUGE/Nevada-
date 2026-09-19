import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Star, LogOut } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Review } from '../lib/supabase'

type Order = {
  id: string
  service_title: string
  created_at: string
}

export default function Account() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [email, setEmail] = useState('')
  const [orders, setOrders] = useState<Order[]>([])
  const [reviews, setReviews] = useState<Review[]>([])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        navigate('/account/login')
        return
      }
      setEmail(data.session.user.email ?? '')
      const [{ data: orderData }, { data: reviewData }] = await Promise.all([
        supabase
          .from('customer_orders')
          .select('id, service_title, created_at')
          .order('created_at', { ascending: false }),
        supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      ])
      setOrders(orderData ?? [])
      setReviews(reviewData ?? [])
      setChecking(false)
    })
  }, [navigate])

  async function logout() {
    await supabase.auth.signOut()
    navigate('/')
  }

  if (checking) return null

  return (
    <section className="max-w-[720px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <p className="eyebrow mb-2">Your Account</p>
          <h1 className="font-serif-display text-3xl text-ink">{email}</h1>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-red-500 transition-colors"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <Package size={18} className="text-brand-blue" />
          <h2 className="font-serif-display text-xl text-ink">My Assignments</h2>
        </div>
        {orders.length === 0 ? (
          <p className="text-sm text-ink-muted">
            No assignments yet — orders you place will show up here.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-lg border hairline p-4">
                <span className="text-sm font-medium text-ink">{o.service_title}</span>
                <span className="text-xs text-ink-muted">
                  {new Date(o.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <div className="flex items-center gap-2 mb-4">
          <Star size={18} className="text-brand-blue" />
          <h2 className="font-serif-display text-xl text-ink">My Reviews</h2>
        </div>
        {reviews.length === 0 ? (
          <p className="text-sm text-ink-muted">You haven't left a review yet.</p>
        ) : (
          <div className="space-y-2">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-lg border hairline p-4">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={13} fill={i < r.rating ? '#2563eb' : 'none'} stroke="#2563eb" />
                    ))}
                  </div>
                  <span
                    className={`text-xs font-medium capitalize ${
                      r.status === 'approved'
                        ? 'text-green-600'
                        : r.status === 'rejected'
                          ? 'text-red-500'
                          : 'text-yellow-600'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-ink-muted">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
