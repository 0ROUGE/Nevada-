import type { Service } from './supabase'

export function formatPrice(service: Pick<Service, 'price_min' | 'price_max' | 'price_range'>): string {
  const { price_min, price_max, price_range } = service
  if (price_min != null && price_max != null) {
    return `KES ${price_min.toLocaleString()} - ${price_max.toLocaleString()}`
  }
  if (price_min != null) return `From KES ${price_min.toLocaleString()}`
  if (price_max != null) return `Up to KES ${price_max.toLocaleString()}`
  return price_range ?? ''
}
