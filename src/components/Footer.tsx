import { Link } from 'react-router-dom'

const links = [
  { to: '/what-we-do', label: 'What We Do' },
  { to: '/my-assignments', label: 'My Assignments' },
  { to: '/writers', label: 'Favourite Writers' },
  { to: '/testimonials', label: 'Testimonials' },
  { to: '/reviews', label: 'Leave a Review' },
  { to: '/contact', label: 'Contact' },
  { to: '/account', label: 'My Account' },
]

export default function Footer() {
  return (
    <footer className="border-t hairline mt-auto">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
          <div className="max-w-xs">
            <p className="font-serif-display text-2xl font-semibold text-ink mb-2">Essayz</p>
            <p className="text-sm text-ink-muted leading-relaxed">
              Thoughtful writing and assignment support, delivered with clarity and care.
            </p>
          </div>
          <nav className="grid grid-cols-2 gap-x-8 gap-y-2 sm:gap-x-10">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="text-sm text-ink-muted hover:text-brand-blue transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="border-t hairline mt-10 pt-6 flex items-center justify-between">
          <p className="text-xs text-ink-muted">
            © {new Date().getFullYear()} Essayz. All rights reserved.
          </p>
          <Link to="/admin/login" className="text-xs text-ink-muted/60 hover:text-ink-muted transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
