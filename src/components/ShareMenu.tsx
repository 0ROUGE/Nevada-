import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Share2, Copy, Check } from 'lucide-react'

export default function ShareMenu({ dark = false }: { dark?: boolean }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const link = typeof window !== 'undefined' ? window.location.origin : ''

  function copyLink() {
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Share Essayz"
        title="Share Essayz"
        className={`p-2 rounded-full transition-colors ${
          dark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-ink-muted hover:text-brand-blue hover:bg-black/5'
        }`}
      >
        <Share2 size={19} strokeWidth={1.75} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-5"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-surface border hairline rounded-xl overflow-hidden relative"
            >
              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-white"
              >
                <X size={16} />
              </button>
              <img src="/share-image.png" alt="Essayz" className="w-full aspect-[1200/630] object-cover" />
              <div className="p-6">
                <h2 className="font-serif-display text-lg text-ink mb-1">Share Essayz</h2>
                <p className="text-sm text-ink-muted mb-4">
                  Anyone who opens this link lands straight on the site, with this preview shown
                  on WhatsApp and social apps.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    readOnly
                    value={link}
                    className="flex-1 min-w-0 rounded-lg border hairline px-3 py-2 text-sm text-ink-muted bg-black/[0.02]"
                  />
                  <button
                    onClick={copyLink}
                    className="shrink-0 flex items-center gap-1.5 bg-brand-blue text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-brand-blue-light transition-all active:scale-[0.97]"
                  >
                    {copied ? <Check size={15} /> : <Copy size={15} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
