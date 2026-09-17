import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Review } from '../lib/supabase'

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    supabase
      .from('reviews')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false })
      .then(({ data }) => setReviews(data ?? []))
  }, [])

  useEffect(() => {
    if (reviews.length < 2) return
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 4500)
    return () => clearInterval(t)
  }, [reviews.length])

  return (
    <section className="max-w-2xl mx-auto px-6 py-20 text-center">
      <h1 className="text-3xl font-extrabold mb-10">Testimonials</h1>
      {reviews.length === 0 ? (
        <p className="text-black/40">No testimonials yet.</p>
      ) : (
        <div className="relative min-h-[200px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={reviews[index].id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.4 }}
              className="glow-blue rounded-2xl bg-white border border-black/5 p-8"
            >
              <div className="flex justify-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    fill={i < reviews[index].rating ? '#2563eb' : 'none'}
                    stroke="#2563eb"
                  />
                ))}
              </div>
              <p className="text-lg text-black/80 mb-4">"{reviews[index].comment}"</p>
              <p className="font-semibold text-brand-blue">{reviews[index].name}</p>
            </motion.div>
          </AnimatePresence>

          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === index ? 'bg-brand-blue' : 'bg-black/15'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  )
}
