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
    <section className="max-w-xl mx-auto px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glow-blue rounded-2xl bg-white border border-black/5 p-10"
      >
        <MessageCircle className="mx-auto mb-4 text-brand-blue" size={40} />
        <h1 className="text-2xl font-extrabold mb-2">Contact Seller</h1>
        <p className="text-black/60 mb-6">
          Have a question or a custom request? Message us directly on WhatsApp.
        </p>
        <a
          href={`https://wa.me/${number}`}
          target="_blank"
          rel="noreferrer"
          className="inline-block bg-brand-blue text-white font-medium px-8 py-3 rounded-full hover:bg-brand-blue-light transition-colors"
        >
          Chat on WhatsApp
        </a>
      </motion.div>
    </section>
  )
}
