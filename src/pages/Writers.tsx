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
    <section className="max-w-6xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-extrabold mb-10 text-center">Favourite Writers</h1>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : writers.length === 0 ? (
        <p className="text-center text-black/40">No writers listed yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {writers.map((w, i) => (
            <motion.div
              key={w.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="glow-blue rounded-2xl bg-white border border-black/5 p-6 text-center"
            >
              <img
                src={w.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${w.name}`}
                alt={w.name}
                className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-2 border-brand-blue/20"
              />
              <h3 className="font-bold text-lg">{w.name}</h3>
              {w.specialty && (
                <p className="text-sm text-brand-blue font-medium mb-2">{w.specialty}</p>
              )}
              <p className="text-sm text-black/60 mb-3">{w.bio}</p>
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
