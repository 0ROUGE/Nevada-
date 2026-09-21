import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Briefcase, MessageSquare, Users, Settings as SettingsIcon, LogOut, ShieldCheck, Menu, X } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import type { Service, Writer, Review, SiteSettings } from '../../lib/supabase'
import ImageUpload from '../../components/ImageUpload'
import PhoneVerify from '../../components/PhoneVerify'
import KenyaPhoneInput from '../../components/KenyaPhoneInput'
import { formatPrice } from '../../lib/price'
import ShareMenu from '../../components/ShareMenu'

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
        <h1 className="font-bold text-lg flex items-center gap-2">
          <img src="/favicon.svg" alt="" className="w-6 h-6 rounded" />
          <span className="font-serif-display font-semibold">Essayz</span>
        </h1>
        <div className="flex items-center gap-1">
          <ShareMenu dark />
          <button onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={22} />
          </button>
        </div>
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
              <h1 className="font-bold text-xl flex items-center gap-2">
                <img src="/favicon.svg" alt="" className="w-7 h-7 rounded-md" />
                <span className="font-serif-display font-semibold">Essayz</span>
              </h1>
              <div className="flex items-center gap-1">
                <ShareMenu dark />
                <button onClick={() => setSidebarOpen(false)} className="md:hidden" aria-label="Close menu">
                  <X size={20} />
                </button>
              </div>
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

function generateDescription(title: string, category: string): string {
  if (!title.trim()) return ''
  const cat = category.trim() ? category.trim().toLowerCase() : 'writing'
  return `Professional ${cat} help with ${title.trim().toLowerCase()}, delivered with clarity, accuracy, and attention to detail.`
}

async function generateDescriptionAI(title: string, category: string): Promise<string> {
  if (!title.trim()) return ''
  try {
    const { data, error } = await supabase.functions.invoke('generate-description', {
      body: { title, category },
    })
    if (error || data?.error || !data?.description) throw new Error('AI generation unavailable')
    return data.description
  } catch {
    // Falls back to the template if the AI call fails (e.g. no API credit)
    return generateDescription(title, category)
  }
}

function ServicesManager({ services, reload }: { services: Service[]; reload: () => void }) {
  const empty = { title: '', description: '', price_min: '', price_max: '', category: '', image_url: '' }
  const [form, setForm] = useState(empty)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [autoFilling, setAutoFilling] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      image_url: form.image_url,
      price_min: form.price_min === '' ? null : Number(form.price_min),
      price_max: form.price_max === '' ? null : Number(form.price_max),
    }
    if (editingId) {
      await supabase.from('services').update(payload).eq('id', editingId)
    } else {
      await supabase.from('services').insert(payload)
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
      price_min: s.price_min?.toString() ?? '',
      price_max: s.price_max?.toString() ?? '',
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
        <input
          placeholder="Title"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          onBlur={async () => {
            if (!editingId && !form.description && form.title) {
              const desc = await generateDescriptionAI(form.title, form.category)
              setForm((f) => (f.description ? f : { ...f, description: desc }))
            }
          }}
          className="rounded-xl border border-black/10 px-4 py-2.5"
        />
        <input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-xl border border-black/10 px-4 py-2.5" />
        <div className="flex gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min price (KES)"
            value={form.price_min}
            onChange={(e) => setForm({ ...form, price_min: e.target.value })}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5"
          />
          <input
            type="number"
            min={0}
            placeholder="Max price (KES)"
            value={form.price_max}
            onChange={(e) => setForm({ ...form, price_max: e.target.value })}
            className="w-full rounded-xl border border-black/10 px-4 py-2.5"
          />
        </div>
        <ImageUpload value={form.image_url} onChange={(url) => setForm({ ...form, image_url: url })} folder="services" />
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium">Description</label>
            <button
              type="button"
              onClick={async () => {
                setAutoFilling(true)
                const desc = await generateDescriptionAI(form.title, form.category)
                setForm((f) => ({ ...f, description: desc }))
                setAutoFilling(false)
              }}
              disabled={!form.title || autoFilling}
              className="text-xs font-semibold text-brand-blue disabled:opacity-40"
            >
              {autoFilling ? 'Generating…' : '✨ Auto-fill'}
            </button>
          </div>
          <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-xl border border-black/10 px-4 py-2.5" rows={3} />
          <p className="text-xs text-black/40 mt-1">AI-generated via Claude — falls back to a quick template if unavailable.</p>
        </div>
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
          <div key={s.id} className="flex items-center justify-between bg-white rounded-2xl border border-black/5 p-4">
            <div>
              <p className="font-semibold">{s.title}</p>
              <p className="text-sm text-black/50">{s.category} · {formatPrice(s)}</p>
            </div>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => {
                  const url = `${window.location.origin}/?service=${s.id}`
                  navigator.clipboard.writeText(url)
                  setCopiedId(s.id)
                  setTimeout(() => setCopiedId(null), 1500)
                }}
                className="text-sm text-ink-muted hover:text-brand-blue font-medium"
                title="Copy a direct link to this service"
              >
                {copiedId === s.id ? 'Copied!' : 'Share'}
              </button>
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
        <ImageUpload value={form.avatar_url} onChange={(url) => setForm({ ...form, avatar_url: url })} folder="writers" />
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
    whatsapp_business_number: settings.whatsapp_business_number ?? '',
    what_we_do_text: settings.what_we_do_text ?? '',
    my_assignments_text: settings.my_assignments_text ?? '',
  })
  const [personalVerified, setPersonalVerified] = useState(!!settings.whatsapp_number_verified)
  const [businessVerified, setBusinessVerified] = useState(!!settings.whatsapp_business_number_verified)
  const [saved, setSaved] = useState(false)

  async function save(e: React.FormEvent) {
    e.preventDefault()
    await supabase.from('site_settings').update({
      ...form,
      whatsapp_number_verified: personalVerified,
      whatsapp_business_number_verified: businessVerified,
    }).eq('id', 1)
    setSaved(true)
    reload()
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Settings</h2>
        <form onSubmit={save} className="rounded-xl border hairline bg-white p-6 space-y-4 max-w-xl">
          <PhoneVerify
            label="WhatsApp Number (Personal) — used for ordering services"
            value={form.whatsapp_number}
            onChange={(v) => {
              setForm({ ...form, whatsapp_number: v })
              if (v !== settings.whatsapp_number) setPersonalVerified(false)
            }}
            verified={personalVerified}
            onVerified={() => setPersonalVerified(true)}
            context="admin_whatsapp_personal"
          />
          <PhoneVerify
            label="WhatsApp Business Number (optional)"
            value={form.whatsapp_business_number}
            onChange={(v) => {
              setForm({ ...form, whatsapp_business_number: v })
              if (v !== settings.whatsapp_business_number) setBusinessVerified(false)
            }}
            verified={businessVerified}
            onVerified={() => setBusinessVerified(true)}
            context="admin_whatsapp_business"
          />
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

      <AdminAlertToggle />
      <AnnouncementSender />
      <SmsSender />
    </div>
  )
}

function AdminAlertToggle() {
  const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string
  const [supported, setSupported] = useState(false)
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    const ok = 'serviceWorker' in navigator && 'PushManager' in window && !!VAPID_PUBLIC_KEY
    setSupported(ok)
    if (!ok) return
    navigator.serviceWorker.register('/sw.js').then(async (reg) => {
      const existing = await reg.pushManager.getSubscription()
      if (!existing) {
        setSubscribed(false)
        return
      }
      const { data } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('endpoint', existing.endpoint)
        .maybeSingle()

      if (data) {
        setSubscribed(true)
        return
      }
      // Stale browser permission with no DB record — heal it silently.
      const { data: sessionData } = await supabase.auth.getSession()
      const email = sessionData.session?.user.email
      if (!email) return
      const { error: healError } = await supabase.from('push_subscriptions').insert({
        endpoint: existing.endpoint,
        p256dh: existing.toJSON().keys?.p256dh,
        auth: existing.toJSON().keys?.auth,
        role: 'admin',
        admin_email: email,
      })
      setSubscribed(!healError)
    })
  }, [])

  function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
  }

  async function enable() {
    setLoading(true)
    setError(false)
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const email = sessionData.session?.user.email
      if (!email) throw new Error('no session')

      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setLoading(false)
        return
      }
      const reg = await navigator.serviceWorker.register('/sw.js')
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
      const json = sub.toJSON()
      const { error: insertError } = await supabase.from('push_subscriptions').insert({
        endpoint: json.endpoint,
        p256dh: json.keys?.p256dh,
        auth: json.keys?.auth,
        role: 'admin',
        admin_email: email,
      })
      if (insertError) {
        setError(true)
        await sub.unsubscribe()
        return
      }
      setSubscribed(true)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }

  if (!supported) return null

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">Admin Alerts</h2>
      <p className="text-sm text-black/50 mb-4">
        Get a browser notification on this device whenever a new review comes in for approval.
      </p>
      <div className="rounded-xl border hairline bg-white p-6 max-w-xl flex items-center justify-between">
        <span className="text-sm font-medium">
          {subscribed ? 'Alerts are on for this device' : 'Alerts are off for this device'}
        </span>
        <button
          onClick={enable}
          disabled={subscribed || loading}
          className="bg-brand-blue text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-blue-light disabled:opacity-60"
        >
          {loading ? 'Enabling…' : subscribed ? 'Enabled' : 'Enable'}
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-2">Something went wrong — try again.</p>}
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

function SmsSender() {
  const [message, setMessage] = useState('')
  const [target, setTarget] = useState<'all' | 'single'>('all')
  const [singlePhone, setSinglePhone] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [resultText, setResultText] = useState('')

  async function send(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const { data, error } = await supabase.functions.invoke('send-sms', {
      body: target === 'single' ? { message, target, phone: singlePhone } : { message, target },
    })
    if (error || data?.error) {
      setStatus('error')
      setResultText(data?.error || error?.message || 'Something went wrong.')
      return
    }
    setStatus('sent')
    setResultText(
      data?.note ? data.note : `Sent to ${data?.sent ?? 0} recipient${data?.sent === 1 ? '' : 's'}.`
    )
    setMessage('')
    setTimeout(() => setStatus('idle'), 3000)
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-1">SMS Notification</h2>
      <p className="text-sm text-black/50 mb-4">
        Send a real SMS via Infobip to customers with a verified phone number — or to one specific
        number.
      </p>
      <form onSubmit={send} className="rounded-xl border hairline bg-white p-6 space-y-4 max-w-xl">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTarget('all')}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg border ${
              target === 'all' ? 'bg-brand-blue text-white border-brand-blue' : 'hairline text-ink-muted'
            }`}
          >
            All verified customers
          </button>
          <button
            type="button"
            onClick={() => setTarget('single')}
            className={`flex-1 text-sm font-semibold py-2 rounded-lg border ${
              target === 'single' ? 'bg-brand-blue text-white border-brand-blue' : 'hairline text-ink-muted'
            }`}
          >
            One number
          </button>
        </div>

        {target === 'single' && (
          <KenyaPhoneInput label="Phone number" value={singlePhone} onChange={setSinglePhone} />
        )}

        <textarea
          placeholder="Message"
          required
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-2.5"
        />
        <button
          type="submit"
          disabled={status === 'sending' || (target === 'single' && !singlePhone)}
          className="bg-brand-blue text-white font-medium px-6 py-2.5 rounded-lg hover:bg-brand-blue-light disabled:opacity-60"
        >
          {status === 'sending' ? 'Sending…' : 'Send SMS'}
        </button>
        {status === 'sent' && <p className="text-green-600 text-sm">{resultText}</p>}
        {status === 'error' && <p className="text-red-500 text-sm">{resultText}</p>}
      </form>
    </div>
  )
}
