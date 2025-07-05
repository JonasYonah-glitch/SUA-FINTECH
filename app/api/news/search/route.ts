import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const category = searchParams.get("category")

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          error: "Query deve ter pelo menos 2 caracteres",
        },
        { status: 400 },
      )
    }

    const offset = (page - 1) * limit

    // Construir query base
    let supabaseQuery = admin.from("news").select("*", { count: "exact" }).eq("is_published", true)

    // Busca por texto (título, resumo, conteúdo)
    const searchTerm = `%${query.trim()}%`
    supabaseQuery = supabaseQuery.or(
      `title.ilike.${searchTerm},summary.ilike.${searchTerm},content.ilike.${searchTerm}`,
    )

    // Filtro por categoria se especificado
    if (category && category !== "all") {
      supabaseQuery = supabaseQuery.eq("category", category)
    }

    // Ordenação e paginação
    const { data, error, count } = await supabaseQuery
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        {
          error: "Erro ao buscar notícias",
        },
        { status: 500 },
      )
    }

    const totalPages = Math.ceil((count || 0) / limit)

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
      query: {
        search: query,
        category: category || "all",
      },
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
