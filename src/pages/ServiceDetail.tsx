import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { getSessionId } from '../lib/session'
import { formatPrice } from '../lib/price'
import type { Service } from '../lib/supabase'
import ReviewPromptModal from '../components/ReviewPromptModal'

export default function ServiceDetail() {
  const { id } = useParams()
  const [service, setService] = useState<Service | null>(null)
  const [whatsappNumber, setWhatsappNumber] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showReviewPrompt, setShowReviewPrompt] = useState(false)

  useEffect(() => {
    async function load() {
      const [{ data: serviceData }, { data: settingsData }] = await Promise.all([
        supabase.from('services').select('*').eq('id', id).maybeSingle(),
        supabase.from('site_settings').select('whatsapp_number').eq('id', 1).single(),
      ])
      if (!serviceData) {
        setNotFound(true)
      } else {
        setService(serviceData)
      }
      setWhatsappNumber(settingsData?.whatsapp_number ?? '')
      setLoading(false)
    }
    load()
  }, [id])

  function contactMe() {
    if (!service) return
    supabase
      .from('customer_orders')
      .insert({
        session_id: getSessionId(),
        service_id: service.id,
        service_title: service.title,
      })
      .then(() => {})

    localStorage.setItem('essayz_has_ordered', 'true')
    sessionStorage.setItem('essayz_just_ordered_this_visit', 'true')

    const message = `Hi! I'd like to order the "${service.title}" service.`
    window.open(
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    )
    setShowReviewPrompt(true)
  }

  if (loading) return null

  if (notFound || !service) {
    return (
      <section className="max-w-[560px] mx-auto px-5 sm:px-8 py-24 text-center">
        <p className="text-ink-muted mb-4">This service couldn't be found.</p>
        <Link to="/" className="text-brand-blue font-semibold text-sm">
          Back to services
        </Link>
      </section>
    )
  }

  const price = formatPrice(service)

  return (
    <section className="max-w-[640px] mx-auto px-5 sm:px-8 py-12 sm:py-16">
      <Link
        to="/"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted hover:text-ink mb-6"
      >
        <ArrowLeft size={16} />
        Back to services
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-surface border hairline overflow-hidden"
      >
        {service.image_url && (
          <img src={service.image_url} alt="" className="w-full h-56 sm:h-64 object-cover" />
        )}
        <div className="p-6 sm:p-8">
          {service.category && (
            <span className="inline-block text-[11px] font-bold uppercase tracking-wide text-brand-blue bg-brand-blue-tint px-2.5 py-1 rounded-full mb-3">
              {service.category}
            </span>
          )}
          <h1 className="font-serif-display text-3xl text-ink mb-4">{service.title}</h1>
          <p className="text-ink-muted leading-relaxed mb-6 whitespace-pre-line">
            {service.description}
          </p>

          <div className="flex items-center justify-between border-t hairline pt-5">
            {price ? (
              <span className="text-lg font-bold text-ink">{price}</span>
            ) : (
              <span />
            )}
            <button
              onClick={contactMe}
              className="inline-flex items-center gap-2 bg-brand-blue text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.97]"
            >
              <MessageCircle size={16} />
              Contact Me
            </button>
          </div>
        </div>
      </motion.div>

      <ReviewPromptModal open={showReviewPrompt} onClose={() => setShowReviewPrompt(false)} />
    </section>
  )
}
