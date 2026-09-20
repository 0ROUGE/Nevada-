import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'

export default function Reviews() {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { data: sessionData } = await supabase.auth.getSession()
    const { error } = await supabase.from('reviews').insert({
      name,
      rating,
      comment,
      status: 'pending',
      session_id: getSessionId(),
      user_id: sessionData.session?.user.id ?? null,
    })
    setStatus(error ? 'error' : 'sent')
    if (!error) {
      setName('')
      setComment('')
      setRating(5)
    }
  }

  return (
    <section className="max-w-[560px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <div className="text-center mb-6">
        <p className="eyebrow mb-3">Your Voice</p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-serif-display text-4xl text-ink mb-3"
        >
          Leave a Review
        </motion.h1>
        <p className="text-ink-muted">Your feedback helps others trust our work.</p>
      </div>

      {status === 'sent' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl bg-surface border hairline p-8 text-center"
          role="status"
        >
          <p className="font-semibold text-brand-blue">Thank you for your review!</p>
          <p className="text-sm text-ink-muted mt-1">
            It'll appear publicly once approved by our team.
          </p>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-surface border hairline p-6 sm:p-8 space-y-5"
        >
          <div>
            <label htmlFor="review-name" className="block text-sm font-semibold text-ink mb-1.5">
              Your Name
            </label>
            <input
              id="review-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border hairline px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
            />
          </div>
          <div>
            <span className="block text-sm font-semibold text-ink mb-1.5">Rating</span>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setRating(i + 1)}
                  aria-label={`${i + 1} star${i === 0 ? '' : 's'}`}
                  aria-pressed={i < rating}
                  className="p-0.5"
                >
                  <Star size={24} fill={i < rating ? '#2563eb' : 'none'} stroke="#2563eb" strokeWidth={1.5} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="review-comment" className="block text-sm font-semibold text-ink mb-1.5">
              Comment
            </label>
            <textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-lg border hairline px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-brand-blue text-white text-sm font-semibold py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98] disabled:opacity-60"
          >
            {status === 'sending' ? 'Submitting…' : 'Submit Review'}
          </button>
          {status === 'error' && (
            <p className="text-red-500 text-sm text-center" role="alert">
              Something went wrong — try again.
            </p>
          )}
        </motion.form>
      )}
    </section>
  )
}
