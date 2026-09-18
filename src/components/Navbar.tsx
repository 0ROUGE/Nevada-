import { useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ArrowRight } from 'lucide-react'
import NotifyButton from './NotifyButton'

const links = [
  { to: '/what-we-do', label: 'What We Do' },
  { to: '/my-assignments', label: 'My Assignments' },
  { to: '/writers', label: 'Favourite Writers' },
  { to: '/reviews', label: 'Leave a Review' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/contact', label: 'Contact Seller' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <header className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b hairline">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="font-serif-display text-2xl italic tracking-tight text-ink">
          Essayz
        </Link>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-[13px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-brand-blue' : 'text-ink/60 hover:text-ink'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <NotifyButton />
          <button
            onClick={() => setOpen(true)}
            className="md:hidden p-2 -mr-2 rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={22} strokeWidth={1.75} />
          </button>
        </div>
      </div>

      {/* Full-panel mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-paper md:hidden"
          >
            <div className="flex items-center justify-between px-5 h-16 border-b hairline">
              <span className="font-serif-display text-2xl italic text-ink">Essayz</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 -mr-2 rounded-lg hover:bg-black/5 transition-colors"
                aria-label="Close menu"
              >
                <X size={22} strokeWidth={1.75} />
              </button>
            </div>

            <nav className="px-5 pt-4">
              {links.map((l, i) => {
                const isActive = location.pathname === l.to
                return (
                  <motion.div
                    key={l.to}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: i * 0.04, ease: 'easeOut' }}
                    className="border-b hairline"
                  >
                    <NavLink
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-4 group"
                    >
                      <span
                        className={`text-lg font-medium ${
                          isActive ? 'text-brand-blue' : 'text-ink'
                        }`}
                      >
                        {l.label}
                      </span>
                      <ArrowRight
                        size={18}
                        className={`transition-transform group-hover:translate-x-1 ${
                          isActive ? 'text-brand-blue' : 'text-ink/30'
                        }`}
                      />
                    </NavLink>
                  </motion.div>
                )
              })}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
