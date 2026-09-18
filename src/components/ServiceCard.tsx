import { motion } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import type { Service } from '../lib/supabase'

export default function ServiceCard({
  service,
  whatsappNumber,
  index = 0,
}: {
  service: Service
  whatsappNumber: string
  index?: number
}) {
  function orderViaWhatsApp() {
    const message = `Hi! I'd like to order the "${service.title}" service.`
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.05, 0.35) }}
      className="card-lift rounded-xl bg-white border hairline p-6 flex flex-col justify-between w-full"
    >
      {service.image_url && (
        <img
          src={service.image_url}
          alt=""
          className="w-full h-36 object-cover rounded-lg mb-4"
        />
      )}
      <div>
        {service.category && (
          <p className="eyebrow mb-3">{service.category}</p>
        )}
        <h3 className="font-serif-display text-xl text-ink mb-2">{service.title}</h3>
        <p className="text-[14px] text-ink-muted leading-relaxed line-clamp-3">
          {service.description}
        </p>
      </div>
      <div className="flex items-center justify-between mt-6 pt-4 border-t hairline">
        {service.price_range ? (
          <span className="text-sm font-semibold text-ink">{service.price_range}</span>
        ) : (
          <span />
        )}
        <button
          type="button"
          onClick={orderViaWhatsApp}
          className="inline-flex items-center gap-1 text-sm font-semibold text-brand-blue hover:gap-2 transition-all active:scale-[0.97]"
        >
          Order via WhatsApp
          <ArrowUpRight size={15} />
        </button>
      </div>
    </motion.article>
  )
}
