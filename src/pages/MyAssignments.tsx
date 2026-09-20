import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function MyAssignments() {
  const [text, setText] = useState('')

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('my_assignments_text')
      .eq('id', 1)
      .single()
      .then(({ data }) => setText(data?.my_assignments_text ?? ''))
  }, [])

  return (
    <section className="max-w-[720px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <p className="eyebrow mb-3">Essayz</p>
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-serif-display text-4xl text-ink mb-6"
      >
        My Assignments
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-ink-muted leading-relaxed text-lg"
      >
        {text}
      </motion.p>
    </section>
  )
}
