import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'

const DEFAULT_MESSAGE = "Hi! I have a question about your services."

export default function Contact() {
  const [number, setNumber] = useState('')
  const [businessNumber, setBusinessNumber] = useState('')

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('whatsapp_number, whatsapp_business_number')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        setNumber(data?.whatsapp_number ?? '')
        setBusinessNumber(data?.whatsapp_business_number ?? '')
      })
  }, [])

  function chatLink(num: string) {
    return `https://wa.me/${num}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`
  }

  return (
    <section className="max-w-[640px] mx-auto px-5 sm:px-8 py-12 sm:py-16 text-center">
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
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {number && (
            <a
              href={chatLink(number)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-7 py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.97]"
            >
              <MessageCircle size={16} />
              Chat on WhatsApp
            </a>
          )}
          {businessNumber && (
            <a
              href={chatLink(businessNumber)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 border hairline text-ink text-sm font-semibold px-7 py-3 rounded-lg hover:border-ink/30 transition-all active:scale-[0.97]"
            >
              <Briefcase size={16} />
              WhatsApp Business
            </a>
          )}
        </div>
      </motion.div>
    </section>
  )
}
