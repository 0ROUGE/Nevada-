import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t hairline mt-auto">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-5 flex items-center justify-between flex-wrap gap-2">
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <img src="/favicon.svg" alt="" className="w-4 h-4 rounded" />
          © {new Date().getFullYear()} Essayz
        </p>
        <div className="flex items-center gap-4">
          <Link to="/terms" className="text-xs text-ink-muted/60 hover:text-ink-muted transition-colors">
            Terms
          </Link>
          <Link to="/admin/login" className="text-xs text-ink-muted/60 hover:text-ink-muted transition-colors">
            Admin
          </Link>
        </div>
      </div>
    </footer>
  )
}
