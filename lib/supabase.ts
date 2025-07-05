import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type News = {
  id: string
  title: string
  slug?: string
  summary?: string
  content: string
  image_url?: string
  images?: string[]
  category: string
  author: string
  is_featured: boolean
  is_published: boolean
  hero_position?: number | null
  is_vertical_list: boolean
  views: number
  view_count: number
  created_at: string
  updated_at: string
}

export type Category = {
  id: string
  name: string
  color: string
  created_at: string
}

// Utility functions
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9\s-]/g, "") // Remove special chars
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens
    .trim()
}

// Substitua a função antiga por esta implementação simples
export async function incrementViewCount(_: string, __?: string) {
  // Contador de views desativado – função intencionalmente vazia
  return
}
