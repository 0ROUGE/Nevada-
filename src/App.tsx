import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import WhatWeDo from './pages/WhatWeDo'
import MyAssignments from './pages/MyAssignments'
import Writers from './pages/Writers'
import Reviews from './pages/Reviews'
import Testimonials from './pages/Testimonials'
import Contact from './pages/Contact'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <footer className="text-center text-sm text-black/40 py-8 border-t border-black/5">
        © {new Date().getFullYear()} Essayz. All rights reserved.
      </footer>
    </div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
        <Route path="/what-we-do" element={<PublicLayout><WhatWeDo /></PublicLayout>} />
        <Route path="/my-assignments" element={<PublicLayout><MyAssignments /></PublicLayout>} />
        <Route path="/writers" element={<PublicLayout><Writers /></PublicLayout>} />
        <Route path="/reviews" element={<PublicLayout><Reviews /></PublicLayout>} />
        <Route path="/testimonials" element={<PublicLayout><Testimonials /></PublicLayout>} />
        <Route path="/contact" element={<PublicLayout><Contact /></PublicLayout>} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </AnimatePresence>
  )
}
