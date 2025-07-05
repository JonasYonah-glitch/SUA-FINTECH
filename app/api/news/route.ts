import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const admin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
})

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^a-z0-9\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim()
}

async function ensureUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug
  let counter = 1

  while (true) {
    const { data } = await admin.from("news").select("id").eq("slug", slug).single()

    if (!data) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

export async function POST(request: Request) {
  try {
    console.log("=== POST /api/news ===")

    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    // Validação dos campos obrigatórios
    if (!body.title || !body.content || !body.category) {
      console.log("Validation failed: missing required fields")
      return NextResponse.json({ error: "Título, conteúdo e categoria são obrigatórios" }, { status: 400 })
    }

    // Gerar slug único
    const baseSlug = body.slug || generateSlug(body.title)
    const uniqueSlug = await ensureUniqueSlug(baseSlug)

    // Preparar dados para inserção
    const newsData = {
      title: body.title.trim(),
      slug: uniqueSlug,
      summary: body.summary?.trim() || null,
      content: body.content.trim(),
      image_url: body.image_url?.trim() || null,
      images: body.images || [],
      category: body.category,
      author: body.author || "Redação SUA FINTECH",
      is_featured: Boolean(body.is_featured),
      is_published: Boolean(body.is_published),
      hero_position: body.hero_position || null,
      is_vertical_list: Boolean(body.is_vertical_list),
      views: 0,
      view_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log("Data to insert:", JSON.stringify(newsData, null, 2))

    // Inserir no banco
    const { data, error } = await admin.from("news").insert([newsData]).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: `Erro ao salvar no banco: ${error.message}` }, { status: 500 })
    }

    console.log("Successfully inserted:", data)

    return NextResponse.json({
      success: true,
      message: "Notícia criada com sucesso!",
      data: data,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : "Erro desconhecido"}` },
      { status: 500 },
    )
  }
}

export async function PUT(request: Request) {
  try {
    console.log("=== PUT /api/news ===")

    const body = await request.json()
    console.log("Request body:", JSON.stringify(body, null, 2))

    if (!body.id) {
      return NextResponse.json({ error: "ID da notícia é obrigatório para atualização" }, { status: 400 })
    }

    // Validação dos campos obrigatórios
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json({ error: "Título, conteúdo e categoria são obrigatórios" }, { status: 400 })
    }

    // Se o slug foi alterado, garantir que seja único
    let finalSlug = body.slug
    if (body.slug) {
      const { data: existing } = await admin.from("news").select("id").eq("slug", body.slug).neq("id", body.id).single()

      if (existing) {
        finalSlug = await ensureUniqueSlug(body.slug)
      }
    }

    // Preparar dados para atualização
    const updateData = {
      title: body.title.trim(),
      slug: finalSlug,
      summary: body.summary?.trim() || null,
      content: body.content.trim(),
      image_url: body.image_url?.trim() || null,
      images: body.images || [],
      category: body.category,
      author: body.author || "Redação SUA FINTECH",
      is_featured: Boolean(body.is_featured),
      is_published: Boolean(body.is_published),
      hero_position: body.hero_position || null,
      is_vertical_list: Boolean(body.is_vertical_list),
      updated_at: new Date().toISOString(),
    }

    console.log("Data to update:", JSON.stringify(updateData, null, 2))

    // Atualizar no banco
    const { data, error } = await admin.from("news").update(updateData).eq("id", body.id).select().single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: `Erro ao atualizar no banco: ${error.message}` }, { status: 500 })
    }

    console.log("Successfully updated:", data)

    return NextResponse.json({
      success: true,
      message: "Notícia atualizada com sucesso!",
      data: data,
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json(
      { error: `Erro interno: ${error instanceof Error ? error.message : "Erro desconhecido"}` },
      { status: 500 },
    )
  }
}
