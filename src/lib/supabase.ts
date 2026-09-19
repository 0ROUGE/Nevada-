import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Add them in Vercel → Project Settings → Environment Variables, then redeploy.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    experimental: { passkey: true },
  },
})

export type Service = {
  id: string
  title: string
  description: string | null
  price_range: string | null
  category: string | null
  image_url: string | null
  created_at: string
}

export type Writer = {
  id: string
  name: string
  specialty: string | null
  bio: string | null
  rating: number
  avatar_url: string | null
  created_at: string
}

export type Review = {
  id: string
  name: string
  rating: number
  comment: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export type SiteSettings = {
  id: number
  whatsapp_number: string | null
  whatsapp_business_number: string | null
  what_we_do_text: string | null
  my_assignments_text: string | null
}
