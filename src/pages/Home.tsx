import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { Service, SiteSettings } from '../lib/supabase'
import ServiceCard from '../components/ServiceCard'
import { CardSkeleton } from '../components/PageSkeleton'
import ReviewPromptModal from '../components/ReviewPromptModal'

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: servicesData }, { data: settingsData }] = await Promise.all([
        supabase.from('services').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*').eq('id', 1).single(),
      ])
      setServices(servicesData ?? [])
      setSettings(settingsData ?? null)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b hairline">
        <div
          aria-hidden
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-brand-blue/[0.06] blur-[120px] rounded-full"
        />
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-20 sm:pb-24 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="eyebrow mb-5"
          >
            Essayz
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-serif-display text-4xl sm:text-5xl md:text-6xl leading-[1.1] tracking-tight text-ink mb-6"
          >
            Words worth reading.
            <br />
            Ideas worth remembering.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-ink-muted max-w-lg mx-auto mb-10 text-[15px] leading-relaxed"
          >
            Thoughtful essays, assignments and original writing crafted with clarity, structure
            and purpose.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="flex items-center justify-center gap-3 flex-wrap"
          >
            <a
              href="#services"
              className="inline-flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.97]"
            >
              Explore Services
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 border hairline text-ink text-sm font-semibold px-6 py-3 rounded-lg hover:border-ink/30 transition-all active:scale-[0.97]"
            >
              Contact Us
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-[1200px] mx-auto px-5 sm:px-8 py-20 sm:py-24">
        <div className="text-center mb-14">
          <p className="eyebrow mb-3">What we offer</p>
          <h2 className="font-serif-display text-3xl sm:text-4xl text-ink">Our Services</h2>
        </div>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-ink-muted">No services listed yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <ServiceCard
                key={s.id}
                service={s}
                whatsappNumber={settings?.whatsapp_number || ''}
                index={i}
                onOrdered={() => setShowReviewPrompt(true)}
              />
            ))}
          </div>
        )}
      </section>

      <ReviewPromptModal open={showReviewPrompt} onClose={() => setShowReviewPrompt(false)} />
    </div>
  )
}
