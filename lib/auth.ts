import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const adminClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
})

export type AdminUser = {
  id: string
  username: string
  email: string
  is_active: boolean
  created_at: string
}

export async function authenticateAdmin(username: string, password: string): Promise<AdminUser | null> {
  try {
    const { data: user, error } = await adminClient
      .from("admin_users")
      .select("*")
      .eq("username", username)
      .eq("is_active", true)
      .single()

    if (error || !user) {
      return null
    }

    // Simple password check (in production, use bcrypt or similar)
    if (password === "admin123") {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        created_at: user.created_at,
      }
    }

    return null
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export function setAuthToken(user: AdminUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem("admin_user", JSON.stringify(user))
    // Set cookie for middleware
    document.cookie = `admin_token=${user.id}; path=/; max-age=86400` // 24 hours
  }
}

export function getAuthToken(): AdminUser | null {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("admin_user")
    return stored ? JSON.parse(stored) : null
  }
  return null
}

export function removeAuthToken() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_user")
    // Remove cookie
    document.cookie = "admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }
}
