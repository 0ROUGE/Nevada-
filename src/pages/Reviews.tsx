import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Reviews() {
  const [name, setName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase
      .from('reviews')
      .insert({ name, rating, comment, status: 'pending' })
    setStatus(error ? 'error' : 'sent')
    if (!error) {
      setName('')
      setComment('')
      setRating(5)
    }
  }

  return (
    <section className="max-w-xl mx-auto px-6 py-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-2 text-center"
      >
        Leave a Review
      </motion.h1>
      <p className="text-black/60 text-center mb-8">
        Your feedback helps others trust our work.
      </p>

      {status === 'sent' ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glow-blue rounded-2xl bg-white border border-black/5 p-8 text-center"
        >
          <p className="font-semibold text-brand-blue">Thank you for your review!</p>
          <p className="text-sm text-black/60 mt-1">
            It'll appear publicly once approved by our team.
          </p>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glow-blue rounded-2xl bg-white border border-black/5 p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Your Name</label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rating</label>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setRating(i + 1)}
                >
                  <Star
                    size={26}
                    fill={i < rating ? '#2563eb' : 'none'}
                    stroke="#2563eb"
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-blue"
            />
          </div>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="w-full bg-brand-blue text-white font-medium py-3 rounded-full hover:bg-brand-blue-light transition-colors disabled:opacity-60"
          >
            {status === 'sending' ? 'Submitting…' : 'Submit Review'}
          </button>
          {status === 'error' && (
            <p className="text-red-500 text-sm text-center">Something went wrong — try again.</p>
          )}
        </motion.form>
      )}
    </section>
  )
}
