import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, MessageSquareHeart } from 'lucide-react'

export default function ReviewPromptModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const navigate = useNavigate()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-5"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-surface border hairline rounded-xl p-7 text-center relative"
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-black/5 text-ink-muted"
            >
              <X size={18} />
            </button>
            <MessageSquareHeart className="mx-auto mb-4 text-brand-blue" size={30} strokeWidth={1.5} />
            <h2 className="font-serif-display text-xl text-ink mb-2">Thanks for reaching out!</h2>
            <p className="text-sm text-ink-muted mb-6 leading-relaxed">
              We've noted your request. Once we've worked together, we'd love to hear how it went.
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => {
                  onClose()
                  navigate('/reviews')
                }}
                className="bg-brand-blue text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.98]"
              >
                Leave a Review
              </button>
              <button
                onClick={onClose}
                className="text-sm font-medium text-ink-muted hover:text-ink py-2"
              >
                Maybe later
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
