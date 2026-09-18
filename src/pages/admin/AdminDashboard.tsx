import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Briefcase, MessageSquare, Users, Settings as SettingsIcon, LogOut, ShieldCheck, Menu, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Service, Writer, Review, SiteSettings } from '../../lib/supabase'

type Tab = 'overview' | 'services' | 'reviews' | 'writers' | 'settings' | 'admins'

type Admin = { id: string; email: string; role: 'master' | 'admin'; created_at: string }

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [checking, setChecking] = useState(true)
  const [tab, setTab] = useState<Tab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [services, setServices] = useState<Service[]>([])
  const [writers, setWriters] = useState<Writer[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [admins, setAdmins] = useState<Admin[]>([])
  const [currentEmail, setCurrentEmail] = useState<string>('')
  const [isMaster, setIsMaster] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        navigate('/admin/login')
      } else {
        setCurrentEmail(data.session.user.email ?? '')
        setChecking(false)
        loadAll()
      }
    })
  }, [])

  async function loadAll() {
    const [s, w, r, st, a] = await Promise.all([
      supabase.from('services').select('*').order('created_at', { ascending: false }),
      supabase.from('writers').select('*').order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').order('created_at', { ascending: false }),
      supabase.from('site_settings').select('*').eq('id', 1).single(),
      supabase.from('admins').select('*').order('created_at', { ascending: true }),
    ])
    setServices(s.data ?? [])
    setWriters(w.data ?? [])
    setReviews(r.data ?? [])
    setSettings(st.data ?? null)
    setAdmins(a.data ?? [])
    const { data: sessionData } = await supabase.auth.getSession()
    const email = sessionData.session?.user.email
    setIsMaster((a.data ?? []).some((row) => row.email === email && row.role === 'master'))
  }

  async function logout() {
    await supabase.auth.signOut()
    navigate('/admin/login')
  }

  if (checking) return null

  const pending = reviews.filter((r) => r.status === 'pending')

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'services', label: 'Services', icon: <Briefcase size={18} /> },
    { id: 'reviews', label: 'Reviews', icon: <MessageSquare size={18} /> },
    { id: 'writers', label: 'Writers', icon: <Users size={18} /> },
    { id: 'settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
    ...(isMaster ? [{ id: 'admins' as Tab, label: 'Admins', icon: <ShieldCheck size={18} /> }] : []),
  ]

  function selectTab(t: Tab) {
    setTab(t)
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen bg-ink text-white flex w-full">
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-ink border-b border-white/10 flex items-center justify-between px-4">
        <h1 className="font-bold text-lg">
          <span className="font-serif-display font-semibold">Essayz</span>
        </h1>
        <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
          <Menu size={22} />
        </button>
      </div>

      {/* Sidebar: fixed drawer on mobile, static column on desktop */}
      <AnimatePresence>
        {(sidebarOpen || true) && (
          <motion.aside
            initial={false}
            animate={{ x: sidebarOpen ? 0 : undefined }}
            className={`fixed md:static top-0 left-0 z-50 h-full md:h-auto w-64 md:w-56 bg-ink border-r border-white/10 flex flex-col p-4 transition-transform duration-300 md:translate-x-0 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
          >
            <div className="flex items-center justify-between mb-8 px-2">
              <h1 className="font-bold text-xl">
                <span className="font-serif-display font-semibold">Essayz</span>
              </h1>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden" aria-label="Close menu">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  onClick={() => selectTab(t.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-brand-blue text-white' : 'text-white/60 hover:bg-white/5'
                  }`}
                >
                  {t.icon}
                  {t.label}
                  {t.id === 'reviews' && pending.length > 0 && (
                    <span className="ml-auto bg-red-500 text-xs rounded-full px-1.5">
                      {pending.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
            <button
              onClick={logout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/60 hover:bg-white/5"
            >
              <LogOut size={18} /> Logout
            </button>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Overlay behind mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Content */}
      <main className="flex-1 w-full bg-[#f5f7fb] text-black p-4 sm:p-6 lg:p-8 pt-20 md:pt-8 overflow-y-auto overflow-x-hidden">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-6xl 2xl:max-w-7xl mx-auto"
        >
          {tab === 'overview' && (
            <Overview services={services} pending={pending} writers={writers} />
          )}
          {tab === 'services' && <ServicesManager services={services} reload={loadAll} />}
          {tab === 'reviews' && <ReviewsManager reviews={reviews} reload={loadAll} />}
          {tab === 'writers' && <WritersManager writers={writers} reload={loadAll} />}
          {tab === 'settings' && settings && (
            <SettingsManager settings={settings} reload={loadAll} />
          )}
          {tab === 'admins' && isMaster && (
            <AdminsManager admins={admins} currentEmail={currentEmail} reload={loadAll} />
          )}
        </motion.div>
      </main>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border hairline bg-white p-6">
      <p className="text-sm text-black/50">{label}</p>
      <p className="text-3xl font-extrabold text-brand-blue mt-1">{value}</p>
    </div>
  )
}

function Overview({
  services,
  pending,
  writers,
}: {
  services: Service[]
  pending: Review[]
  writers: Writer[]
}) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Services" value={services.length} />
        <StatCard label="Pending Reviews" value={pending.length} />
        <StatCard label="Writers" value={writers.length} />
      </div>
    </div>
  )
}

function ServicesManager({ services, reload }: { services: Service[]; reload: () => void }) {
  const empty = { title: '', description: '', price_range: '', category: '', image_url: '' }
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      await supabase.from('services').update(form).eq('id', editingId)
    } else {
      await supabase.from('services').insert(form)
    }
    setForm(empty)
    setEditingId(null)
    reload()
  }

  function edit(s: Service) {
    setEditingId(s.id)
    setForm({
      title: s.title,
      description: s.description ?? '',
      price_range: s.price_range ?? '',
      category: s.category ?? '',
      image_url: s.image_url ?? '',
    })
  }

  async function remove(id: string) {
    await supabase.from('services').delete().eq('id', id)
    reload()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Services</h2>
      <form onSubmit={save} className="rounded-xl border hairline bg-white p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <input placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <input placeholder="Price Range (e.g. KES 500 - 2000)" value={form.price_range} onChange={(e) => setForm({ ...form, price_range: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <input placeholder="Image URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5 sm:col-span-2" rows={3} />
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="bg-brand-blue text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-blue-light">
            {editingId ? 'Update Service' : 'Add Service'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="px-6 py-2.5 rounded-lg border hairline">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {services.map((s) => (
          <div key={s.id} className="flex items-center justify-between bg-white rounded-xl border border-black/5 p-4">
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-black/50">{s.category} · {s.price_range}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(s)} className="text-sm text-brand-blue font-medium">Edit</button>
              <button onClick={() => remove(s.id)} className="text-sm text-red-500 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReviewsManager({ reviews, reload }: { reviews: Review[]; reload: () => void }) {
  async function setStatus(id: string, status: 'approved' | 'rejected') {
    await supabase.from('reviews').update({ status }).eq('id', id)
    reload()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Reviews</h2>
      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white rounded-xl border border-black/5 p-4 flex items-center justify-between">
            <div>
              <p className="font-semibold">{r.name} · {r.rating}★</p>
              <p className="text-sm text-black/60">{r.comment}</p>
              <span className={`text-xs font-medium ${r.status === 'approved' ? 'text-green-600' : r.status === 'rejected' ? 'text-red-500' : 'text-yellow-600'}`}>
                {r.status}
              </span>
            </div>
            {r.status === 'pending' && (
              <div className="flex gap-2">
                <button onClick={() => setStatus(r.id, 'approved')} className="text-sm text-green-600 font-medium">Approve</button>
                <button onClick={() => setStatus(r.id, 'rejected')} className="text-sm text-red-500 font-medium">Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function WritersManager({ writers, reload }: { writers: Writer[]; reload: () => void }) {
  const empty = { name: '', specialty: '', bio: '', rating: 5, avatar_url: '' }
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (editingId) {
      await supabase.from('writers').update(form).eq('id', editingId)
    } else {
      await supabase.from('writers').insert(form)
    }
    setForm(empty)
    setEditingId(null)
    reload()
  }

  function edit(w: Writer) {
    setEditingId(w.id)
    setForm({ name: w.name, specialty: w.specialty ?? '', bio: w.bio ?? '', rating: w.rating, avatar_url: w.avatar_url ?? '' })
  }

  async function remove(id: string) {
    await supabase.from('writers').delete().eq('id', id)
    reload()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Writers</h2>
      <form onSubmit={save} className="rounded-xl border hairline bg-white p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <input placeholder="Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <input placeholder="Specialty" value={form.specialty} onChange={(e) => setForm({ ...form, specialty: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <input type="number" min={1} max={5} step={0.1} placeholder="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <input placeholder="Avatar URL" value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <textarea placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5 sm:col-span-2" rows={3} />
        <div className="sm:col-span-2 flex gap-2">
          <button type="submit" className="bg-brand-blue text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-blue-light">
            {editingId ? 'Update Writer' : 'Add Writer'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm(empty) }} className="px-6 py-2.5 rounded-lg border hairline">
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="space-y-3">
        {writers.map((w) => (
          <div key={w.id} className="flex items-center justify-between bg-white rounded-xl border border-black/5 p-4">
            <div>
              <p className="font-semibold">{w.name}</p>
              <p className="text-sm text-black/50">{w.specialty} · {w.rating}★</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => edit(w)} className="text-sm text-brand-blue font-medium">Edit</button>
              <button onClick={() => remove(w.id)} className="text-sm text-red-500 font-medium">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminsManager({
  admins,
  currentEmail,
  reload,
}: {
  admins: Admin[]
  currentEmail: string
  reload: () => void
}) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'master'>('admin')
  const [error, setError] = useState('')

  async function addAdmin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const { error } = await supabase.from('admins').insert({ email: email.trim().toLowerCase(), role })
    if (error) {
      setError(error.message)
    } else {
      setEmail('')
      setRole('admin')
      reload()
    }
  }

  async function removeAdmin(id: string, adminEmail: string) {
    if (adminEmail === currentEmail) {
      setError("You can't remove your own master account.")
      return
    }
    await supabase.from('admins').delete().eq('id', id)
    reload()
  }

  async function changeRole(id: string, newRole: 'admin' | 'master') {
    await supabase.from('admins').update({ role: newRole }).eq('id', id)
    reload()
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Admins</h2>
      <p className="text-sm text-black/50 mb-6">
        As master admin, you control who else can manage Essayz. Note: adding someone here only
        grants them dashboard access once they also have a Supabase Auth login for that email —
        create their login in the Supabase dashboard first.
      </p>

      <form onSubmit={addAdmin} className="rounded-xl border hairline bg-white p-6 flex flex-col sm:flex-row gap-3 mb-8">
        <input
          type="email"
          placeholder="new-admin@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded-xl border border-black/10 px-4 py-2.5"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'admin' | 'master')}
          className="rounded-xl border border-black/10 px-4 py-2.5"
        >
          <option value="admin">Admin</option>
          <option value="master">Master</option>
        </select>
        <button type="submit" className="bg-brand-blue text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-blue-light">
          Add Admin
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="space-y-3">
        {admins.map((a) => (
          <div key={a.id} className="flex items-center justify-between bg-white rounded-xl border border-black/5 p-4">
            <div>
              <p className="font-semibold">{a.email}</p>
              <p className="text-sm text-black/50 capitalize">{a.role}{a.email === currentEmail ? ' · you' : ''}</p>
            </div>
            <div className="flex gap-2 items-center">
              <select
                value={a.role}
                onChange={(e) => changeRole(a.id, e.target.value as 'admin' | 'master')}
                className="text-sm rounded-lg border border-black/10 px-2 py-1"
              >
                <option value="admin">Admin</option>
                <option value="master">Master</option>
              </select>
              <button onClick={() => removeAdmin(a.id, a.email)} className="text-sm text-red-500 font-medium">
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SettingsManager({ settings, reload }: { settings: SiteSettings; reload: () => void }) {
  const [form, setForm] = useState({
    whatsapp_number: settings.whatsapp_number ?? '',
    what_we_do_text: settings.what_we_do_text ?? '',
    my_assignments_text: settings.my_assignments_text ?? '',
  })
  const [saved, setSaved] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('site_settings').update(form).eq('id', 1)
    setSaved(true)
    reload()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <form onSubmit={save} className="rounded-xl border hairline bg-white p-6 space-y-4 max-w-xl">
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp Number (with country code, no + or spaces, e.g. 254712345678)</label>
            <input value={form.whatsapp_number} onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })} className="w-full rounded-xl border border-black/10 px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">What We Do text</label>
            <textarea value={form.what_we_do_text} onChange={(e) => setForm({ ...form, what_we_do_text: e.target.value })} rows={3} className="w-full rounded-xl border border-black/10 px-4 py-2.5" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">My Assignments text</label>
            <textarea value={form.my_assignments_text} onChange={(e) => setForm({ ...form, my_assignments_text: e.target.value })} rows={3} className="w-full rounded-xl border border-black/10 px-4 py-2.5" />
          </div>
          <button type="submit" className="bg-brand-blue text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-blue-light">
            Save Settings
          </button>
          {saved && <p className="text-green-600 text-sm">Saved!</p>}
        </form>
      </div>

      <AnnouncementSender />
    </div>
  )
}

function AnnouncementSender() {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { error } = await supabase.functions.invoke('send-push', {
      body: { title, body: body, url: '/' },
    })
    setStatus(error ? 'error' : 'sent')
    if (!error) {
      setTitle('')
      setBody('')
      setTimeout(() => setStatus('idle'), 2500)
    }
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Push Notification</h2>
      <p className="text-sm text-black/50 mb-4">
        Send a browser notification to everyone who's subscribed on the site.
      </p>
      <form onSubmit={send} className="rounded-xl border hairline bg-white p-6 space-y-4 max-w-xl">
        <input
          placeholder="Title (e.g. New service added!)"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-2.5"
        />
        <textarea
          placeholder="Message"
          required
          rows={2}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={status === 'sending'}
          className="bg-brand-blue text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-blue-light disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send Notification'}
        </button>
        {status === 'sent' && <p className="text-green-600 text-sm">Sent!</p>}
        {status === 'error' && <p className="text-red-500 text-sm">Failed to send — check Edge Function is deployed with VAPID secrets set.</p>}
      </form>
    </div>
  )
}
