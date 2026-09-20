import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { supabase } from '../lib/supabase'
import type { Service } from '../lib/supabase'
import ServiceListItem from '../components/ServiceListItem'
import { CardSkeleton } from '../components/PageSkeleton'

export default function Home() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [searchParams] = useSearchParams()
  const highlightId = searchParams.get('service')

  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setServices(data ?? [])
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    if (!highlightId || loading) return
    const el = document.getElementById(`service-${highlightId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [highlightId, loading])

  const categories = useMemo(
    () => Array.from(new Set(services.map((s) => s.category).filter(Boolean))) as string[],
    [services]
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return services.filter((s) => {
      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        (s.description ?? '').toLowerCase().includes(q) ||
        (s.category ?? '').toLowerCase().includes(q)
      const matchesCategory = !category || s.category === category
      return matchesQuery && matchesCategory
    })
  }, [services, query, category])

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b hairline">
        <div
          aria-hidden
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand-blue/[0.06] blur-[100px] rounded-full"
        />
        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12 text-center">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="eyebrow mb-3"
          >
            Essayz
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="font-serif-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-tight text-ink mb-4"
          >
            Words worth reading.
            <br />
            Ideas worth remembering.
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-ink-muted max-w-lg mx-auto mb-6 text-[15px] leading-relaxed"
          >
            Thoughtful essays, assignments and original writing crafted with clarity, structure
            and purpose.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
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
      <section id="services" className="max-w-[760px] mx-auto px-5 sm:px-8 py-10 sm:py-12">
        <div className="text-center mb-6">
          <p className="eyebrow mb-2">What we offer</p>
          <h2 className="font-serif-display text-2xl sm:text-3xl text-ink">Our Services</h2>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search services…"
            className="w-full rounded-xl border hairline pl-10 pr-9 py-2.5 text-sm bg-surface focus:outline-none focus:ring-2 focus:ring-brand-blue/40 focus:border-brand-blue transition-shadow"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            <button
              onClick={() => setCategory(null)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                category === null ? 'bg-brand-blue text-white' : 'bg-brand-blue-tint text-brand-blue'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                  category === c ? 'bg-brand-blue text-white' : 'bg-brand-blue-tint text-brand-blue'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-ink-muted py-8">
            {services.length === 0 ? 'No services listed yet — check back soon.' : 'No services match your search.'}
          </p>
        ) : (
          <div className="space-y-3">
            {filtered.map((s, i) => (
              <ServiceListItem key={s.id} service={s} index={i} highlighted={highlightId === s.id} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
