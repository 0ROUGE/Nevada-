import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
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
    const t = setInterval(() => setIndex((i) => (i + 1) % reviews.length), 5500)
    return () => clearInterval(t)
  }, [reviews.length])

  function prev() {
    setIndex((i) => (i - 1 + reviews.length) % reviews.length)
  }
  function next() {
    setIndex((i) => (i + 1) % reviews.length)
  }

  return (
    <section className="max-w-[640px] mx-auto px-5 sm:px-8 py-20 sm:py-24 text-center">
      <p className="eyebrow mb-3">Kind Words</p>
      <h1 className="font-serif-display text-4xl text-ink mb-14">Testimonials</h1>

      {reviews.length === 0 ? (
        <p className="text-ink-muted">No testimonials yet.</p>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={prev}
              aria-label="Previous testimonial"
              className="hidden sm:flex shrink-0 w-10 h-10 rounded-full border hairline items-center justify-center hover:border-ink/30 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>

            <div className="relative min-h-[220px] flex-1 flex items-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={reviews[index].id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="rounded-xl bg-surface border hairline p-8 sm:p-10 w-full"
                >
                  <p className="font-serif-display text-4xl text-brand-blue/25 leading-none mb-2">
                    &ldquo;
                  </p>
                  <p className="font-serif-display text-xl text-ink leading-snug mb-5 -mt-4">
                    {reviews[index].comment}
                  </p>
                  <div className="flex justify-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        fill={i < reviews[index].rating ? '#2563eb' : 'none'}
                        stroke="#2563eb"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-semibold text-ink">{reviews[index].name}</p>
                </motion.div>
              </AnimatePresence>
            </div>

            <button
              onClick={next}
              aria-label="Next testimonial"
              className="hidden sm:flex shrink-0 w-10 h-10 rounded-full border hairline items-center justify-center hover:border-ink/30 transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {reviews.length > 1 && (
            <div className="flex sm:hidden justify-center gap-3 mt-6">
              <button onClick={prev} aria-label="Previous testimonial" className="p-2">
                <ChevronLeft size={20} />
              </button>
              <button onClick={next} aria-label="Next testimonial" className="p-2">
                <ChevronRight size={20} />
              </button>
            </div>
          )}

          {reviews.length > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  aria-label={`Go to testimonial ${i + 1}`}
                  aria-current={i === index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === index ? 'bg-brand-blue' : 'bg-ink/15'
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
