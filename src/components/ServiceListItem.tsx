import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { Service } from '../lib/supabase'

export default function ServiceListItem({
  service,
  index = 0,
  highlighted = false,
}: {
  service: Service
  index?: number
  highlighted?: boolean
}) {
  const [open, setOpen] = useState(highlighted)
  const navigate = useNavigate()

  return (
    <motion.div
      id={`service-${service.id}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.3) }}
      className={`rounded-2xl bg-surface border-l-4 border overflow-hidden transition-colors ${
        highlighted ? 'border-l-brand-blue border-brand-blue/40 ring-2 ring-brand-blue/30' : 'border-l-brand-blue hairline'
      }`}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          {service.category && (
            <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-brand-blue bg-brand-blue-tint px-2 py-0.5 rounded-full mb-1.5">
              {service.category}
            </span>
          )}
          <h3 className="font-serif-display text-xl sm:text-2xl font-semibold text-ink truncate">
            {service.title}
          </h3>
        </div>
        <ChevronDown
          size={20}
          className={`shrink-0 text-ink-muted transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4 pt-1">
              <button
                onClick={() => navigate(`/service/${service.id}`)}
                className="w-full bg-brand-blue text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98]"
              >
                See More
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
