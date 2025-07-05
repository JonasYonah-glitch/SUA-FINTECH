import type { Request } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

export async function PUT(req: Request) {
  try {
    const { newsId, heroPosition }: { newsId?: string; heroPosition: number | null } = await req.json()

    if (!newsId || (heroPosition !== null && (heroPosition < 1 || heroPosition > 3))) {
      return new Response(JSON.stringify({ error: "Dados inválidos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Se vamos atribuir a posição 1/2/3 primeiro liberamos quem já está lá
    if (heroPosition !== null) {
      await admin.from("news").update({ hero_position: null }).eq("hero_position", heroPosition)
    }

    const { error, data } = await admin
      .from("news")
      .update({ hero_position: heroPosition })
      .eq("id", newsId)
      .select()
      .single()

    if (error) {
      console.error(error)
      return new Response(
        JSON.stringify({ error: typeof error === "string" ? error : ((error as any)?.message ?? "Erro desconhecido") }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      )
    }

    if (!data) {
      return new Response(JSON.stringify({ error: "Notícia não encontrada" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err: any) {
    console.error(err)
    return new Response(JSON.stringify({ error: (err as any)?.message ?? "Erro inesperado" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
