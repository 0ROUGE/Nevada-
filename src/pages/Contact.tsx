import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function Contact() {
  const [number, setNumber] = useState('')

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('whatsapp_number')
      .eq('id', 1)
      .single()
      .then(({ data }) => setNumber(data?.whatsapp_number ?? ''))
  }, [])

  return (
    <section className="max-w-[640px] mx-auto px-5 sm:px-8 py-20 sm:py-24 text-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-brand-blue-tint border hairline p-10 sm:p-14"
      >
        <MessageCircle className="mx-auto mb-5 text-brand-blue" size={32} strokeWidth={1.5} />
        <p className="eyebrow mb-3">Have a question?</p>
        <h1 className="font-serif-display text-3xl text-ink mb-3">Contact Seller</h1>
        <p className="text-ink-muted mb-8 max-w-sm mx-auto">
          Need a custom request or want to discuss your next project? Get in touch directly.
        </p>
        <a
          href={`https://wa.me/${number}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-7 py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.97]"
        >
          Chat on WhatsApp
        </a>
      </motion.div>
    </section>
  )
}
