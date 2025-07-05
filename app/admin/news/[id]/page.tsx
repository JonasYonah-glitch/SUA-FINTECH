"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, redirect } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewsEditor } from "@/components/news-editor"
import { supabase, type News } from "@/lib/supabase"
import { getAuthToken } from "@/lib/auth"
import Link from "next/link"
import Image from "next/image"

export default function EditNewsPage() {
  const router = useRouter()
  const params = useParams()
  const [newsData, setNewsData] = useState<News | null>(null)
  const [loading, setLoading] = useState(true)

  // Guard: if the route param is NOT a valid UUID, send the user to the "new" page
  const isUuid = (value: string) =>
    /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value)

  if (!isUuid(params.id as string)) {
    redirect("/admin/news/new")
  }

  useEffect(() => {
    // Check authentication
    const user = getAuthToken()
    if (!user) {
      router.push("/admin/login")
      return
    }

    fetchNewsData()
  }, [params.id, router])

  const fetchNewsData = async () => {
    try {
      const { data, error } = await supabase.from("news").select("*").eq("id", params.id).single()

      if (error) throw error

      setNewsData(data)
    } catch (error) {
      console.error("Error fetching news:", error)
      router.push("/admin")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = (data: any) => {
    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push("/admin")
    }, 2000)
  }

  const handleDelete = async () => {
    if (confirm("Tem certeza que deseja excluir esta notícia?")) {
      try {
        const { error } = await supabase.from("news").delete().eq("id", params.id)
        if (error) throw error
        router.push("/admin")
      } catch (error) {
        console.error("Error deleting news:", error)
        alert("Erro ao excluir notícia")
      }
    }
  }

  const handleCancel = () => {
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!newsData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Notícia não encontrada</p>
          <Link href="/admin">
            <Button className="mt-4">Voltar ao Admin</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Image src="/logo-sua-fintech.png" alt="SUA FINTECH" width={120} height={40} className="dark:invert" />
              <h1 className="text-lg font-bold text-foreground">Editar Notícia</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <NewsEditor
          mode="edit"
          initialData={newsData}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={handleCancel}
        />
      </main>
    </div>
  )
}
