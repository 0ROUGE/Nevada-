import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Service } from '../lib/supabase'

export default function ServiceCard({
  service,
  whatsappNumber,
}: {
  service: Service
  whatsappNumber: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientY - rect.top - rect.height / 2) / 12
    const y = (e.clientX - rect.left - rect.width / 2) / -12
    setTilt({ x, y })
  }

  function resetTilt() {
    setTilt({ x: 0, y: 0 })
  }

  function orderViaWhatsApp() {
    const message = `Hi! I'd like to order the "${service.title}" service.`
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={resetTilt}
      style={{
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
      }}
      className="tilt-card glow-blue glow-blue-hover rounded-2xl bg-white border border-black/5 p-6 flex flex-col justify-between cursor-pointer"
      onClick={orderViaWhatsApp}
    >
      {service.image_url && (
        <img
          src={service.image_url}
          alt={service.title}
          className="w-full h-36 object-cover rounded-xl mb-4"
        />
      )}
      <div>
        {service.category && (
          <span className="inline-block text-xs font-semibold text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-full mb-3">
            {service.category}
          </span>
        )}
        <h3 className="font-bold text-lg mb-1">{service.title}</h3>
        <p className="text-sm text-black/60 line-clamp-3">{service.description}</p>
      </div>
      <div className="flex items-center justify-between mt-5">
        {service.price_range && (
          <span className="font-semibold text-brand-blue">{service.price_range}</span>
        )}
        <span className="text-sm font-medium bg-brand-blue text-white px-4 py-2 rounded-full hover:bg-brand-blue-light transition-colors">
          Order via WhatsApp
        </span>
      </div>
    </motion.div>
  )
}
