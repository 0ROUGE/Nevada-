import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import FloatingWhatsApp from './components/FloatingWhatsApp'
import PageSkeleton from './components/PageSkeleton'

const Home = lazy(() => import('./pages/Home'))
const WhatWeDo = lazy(() => import('./pages/WhatWeDo'))
const MyAssignments = lazy(() => import('./pages/MyAssignments'))
const Writers = lazy(() => import('./pages/Writers'))
const Reviews = lazy(() => import('./pages/Reviews'))
const Testimonials = lazy(() => import('./pages/Testimonials'))
const Contact = lazy(() => import('./pages/Contact'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <FloatingWhatsApp />
      <Footer />
    </div>
  )
}

export default function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageSkeleton />}>
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
      </Suspense>
    </AnimatePresence>
  )
}
