import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'

export default function FloatingWhatsApp() {
  const [number, setNumber] = useState('')
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('whatsapp_number')
      .eq('id', 1)
      .single()
      .then(({ data }) => {
        if (data?.whatsapp_number) {
          setNumber(data.whatsapp_number)
          setVisible(true)
        }
      })
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={`https://wa.me/${number}`}
          target="_blank"
          rel="noreferrer"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full bg-brand-blue flex items-center justify-center text-white shadow-lg"
          style={{ boxShadow: '0 0 0 0 rgba(37,99,235,0.6)' }}
          aria-label="Chat on WhatsApp"
        >
          <span className="absolute inset-0 rounded-full bg-brand-blue animate-ping opacity-40" />
          <MessageCircle size={26} className="relative" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
