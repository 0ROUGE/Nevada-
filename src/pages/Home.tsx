import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '../lib/supabase'
import type { Service, SiteSettings } from '../lib/supabase'
import ServiceCard from '../components/ServiceCard'
import { CardSkeleton } from '../components/PageSkeleton'

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)

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
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-brand-blue/20 blur-[100px] rounded-full"
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-20 pb-16 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4"
          >
            Quality academic help,{' '}
            <span className="text-brand-blue">one message away</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-black/60 max-w-xl mx-auto mb-8"
          >
            Browse our services below and order directly on WhatsApp — no accounts, no hassle.
          </motion.p>
          <motion.a
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            href="#services"
            className="inline-block bg-brand-blue text-white font-medium px-6 py-3 rounded-full hover:bg-brand-blue-light transition-colors glow-blue"
          >
            Explore Services
          </motion.a>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <h2 className="text-2xl font-bold mb-8 text-center">Our Services</h2>
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : services.length === 0 ? (
          <p className="text-center text-black/40">No services listed yet — check back soon.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <ServiceCard
                key={s.id}
                service={s}
                whatsappNumber={settings?.whatsapp_number || ''}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
