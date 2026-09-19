import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Writer } from '../lib/supabase'
import { CardSkeleton } from '../components/PageSkeleton'

export default function Writers() {
  const [writers, setWriters] = useState<Writer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('writers')
      .select('*')
      .order('rating', { ascending: false })
      .then(({ data }) => {
        setWriters(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <section className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 sm:py-24">
      <div className="text-center mb-14">
        <p className="eyebrow mb-3">The Team</p>
        <h1 className="font-serif-display text-4xl text-ink">Favourite Writers</h1>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : writers.length === 0 ? (
        <p className="text-center text-ink-muted">No writers listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {writers.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="card-lift rounded-xl bg-surface border hairline p-6 text-center"
            >
              <img
                src={w.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${w.name}`}
                alt=""
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover grayscale"
              />
              <h3 className="font-serif-display text-lg text-ink">{w.name}</h3>
              {w.specialty && (
                <p className="text-xs font-semibold text-brand-blue uppercase tracking-wide mt-1 mb-3">{w.specialty}</p>
              )}
              <p className="text-sm text-ink-muted leading-relaxed mb-4">{w.bio}</p>
              <div className="flex justify-center gap-0.5">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    size={16}
                    fill={idx < Math.round(w.rating) ? '#2563eb' : 'none'}
                    stroke="#2563eb"
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </section>
  )
}
