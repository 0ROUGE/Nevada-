import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'

export default function WhatWeDo() {
  const [text, setText] = useState('')

  useEffect(() => {
    supabase
      .from('site_settings')
      .select('what_we_do_text')
      .eq('id', 1)
      .single()
      .then(({ data }) => setText(data?.what_we_do_text ?? ''))
  }, [])

  return (
    <section className="max-w-3xl mx-auto px-6 py-20">
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-extrabold mb-6"
      >
        What We Do
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-black/70 leading-relaxed text-lg"
      >
        {text}
      </motion.p>
    </section>
  )
}
