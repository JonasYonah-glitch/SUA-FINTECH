"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, RefreshCw, Search, Crown, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, type News, type Category } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { getAuthToken, removeAuthToken } from "@/lib/auth"
import Link from "next/link"
import Image from "next/image"

export default function AdminPanel() {
  const router = useRouter()
  const [news, setNews] = useState<News[]>([])
  const [filteredNews, setFilteredNews] = useState<News[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    // Check authentication
    const user = getAuthToken()
    if (!user) {
      router.push("/admin/login")
      return
    }

    fetchData()
  }, [router])

  useEffect(() => {
    filterNews()
  }, [news, searchTerm, filterCategory, filterStatus])

  const handleLogout = () => {
    removeAuthToken()
    router.push("/admin/login")
  }

  const fetchData = async () => {
    try {
      setError(null)
      setLoading(true)

      const [newsResponse, categoriesResponse] = await Promise.all([
        supabase.from("news").select("*").order("created_at", { ascending: false }),
        supabase.from("categories").select("*").order("name"),
      ])

      if (newsResponse.error) {
        throw new Error(`Erro ao carregar notícias: ${newsResponse.error.message}`)
      }

      if (categoriesResponse.error) {
        throw new Error(`Erro ao carregar categorias: ${categoriesResponse.error.message}`)
      }

      setNews(newsResponse.data || [])
      setCategories(categoriesResponse.data || [])
    } catch (error) {
      console.error("Error fetching data:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  const filterNews = () => {
    let filtered = [...news]

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((item) => item.category === filterCategory)
    }

    if (filterStatus === "published") {
      filtered = filtered.filter((item) => item.is_published)
    } else if (filterStatus === "draft") {
      filtered = filtered.filter((item) => !item.is_published)
    } else if (filterStatus === "featured") {
      filtered = filtered.filter((item) => item.is_featured)
    } else if (filterStatus === "hero") {
      filtered = filtered.filter((item) => item.hero_position !== null)
    }

    setFilteredNews(filtered)
  }

  const togglePublished = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("news")
        .update({ is_published: !currentStatus, updated_at: new Date().toISOString() })
        .eq("id", id)

      if (error) throw error

      setNews((prevNews) => prevNews.map((item) => (item.id === id ? { ...item, is_published: !currentStatus } : item)))
    } catch (error) {
      console.error("Error updating news:", error)
      alert("Erro ao atualizar status de publicação")
    }
  }

  const setHeroPosition = async (newsId: string, position: number | null) => {
    try {
      const res = await fetch("/api/news/hero", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newsId, heroPosition: position }),
      })

      let body: { error?: string } | string = ""
      try {
        body = await res.json()
      } catch {
        body = await res.text()
      }

      if (!res.ok) {
        const message = typeof body === "string" ? body : (body.error ?? "Erro ao definir posição hero")
        throw new Error(message)
      }

      // Atualizar estado local
      setNews((prevNews) =>
        prevNews.map((item) => {
          if (item.id === newsId) {
            return { ...item, hero_position: position }
          }
          // Limpar posição hero de outras notícias na mesma posição
          if (position !== null && item.hero_position === position) {
            return { ...item, hero_position: null }
          }
          return item
        }),
      )

      alert(`Notícia ${position ? `definida como Hero ${position}` : "removida do Hero"} com sucesso!`)
    } catch (error) {
      console.error("Error setting hero position:", error)
      alert(error instanceof Error ? error.message : "Erro ao definir posição hero")
    }
  }

  const deleteNews = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.")) {
      try {
        const { error } = await supabase.from("news").delete().eq("id", id)

        if (error) throw error

        setNews((prevNews) => prevNews.filter((item) => item.id !== id))
        alert("Notícia excluída com sucesso!")
      } catch (error) {
        console.error("Error deleting news:", error)
        alert("Erro ao excluir notícia")
      }
    }
  }

  const getHeroBadge = (heroPosition: number | null) => {
    if (!heroPosition) return null

    const colors = {
      1: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      2: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
      3: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    }

    return (
      <Badge className={`${colors[heroPosition as keyof typeof colors]} flex items-center gap-1`}>
        <Crown className="h-3 w-3" />
        Hero {heroPosition}
      </Badge>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Carregando painel administrativo...</p>
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
              <Image src="/logo-sua-fintech.png" alt="SUA FINTECH" width={120} height={40} className="dark:invert" />
              <div>
                <h1 className="text-lg font-bold text-foreground">Painel Administrativo</h1>
                <p className="text-xs text-muted-foreground">SUA FINTECH</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                Atualizar
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Ver Site
                </Button>
              </Link>
              <Link href="/admin/news/new">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Notícia
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert className="mb-6" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button variant="outline" size="sm" className="ml-4 bg-transparent" onClick={fetchData}>
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{news.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Publicadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{news.filter((n) => n.is_published).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Destaque</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{news.filter((n) => n.is_featured).length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Hero</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {news.filter((n) => n.hero_position !== null).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Rascunhos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{news.filter((n) => !n.is_published).length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros e Busca</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar notícias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="published">Publicadas</SelectItem>
                  <SelectItem value="draft">Rascunhos</SelectItem>
                  <SelectItem value="hero">Hero</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground flex items-center">
                {filteredNews.length} de {news.length} notícias
              </div>
            </div>
          </CardContent>
        </Card>

        {/* News List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-foreground">Gerenciar Notícias</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredNews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {news.length === 0 ? "Nenhuma notícia encontrada" : "Nenhuma notícia corresponde aos filtros"}
                </p>
                <Link href="/admin/news/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {news.length === 0 ? "Criar Primeira Notícia" : "Criar Nova Notícia"}
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNews.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <img
                        src={item.image_url || "/placeholder.svg?height=60&width=80"}
                        alt={item.title}
                        className="w-20 h-15 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg?height=60&width=80"
                        }}
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold text-foreground line-clamp-1">{item.title}</h3>
                          {getHeroBadge(item.hero_position)}
                          {!item.is_published && (
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                              Rascunho
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {item.summary || "Sem resumo"}
                        </p>
                        <div className="flex items-center space-x-4 mt-2">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-xs text-muted-foreground">{formatDate(item.created_at)}</span>
                          <span className="text-xs text-muted-foreground">por {item.author}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Hero Position Selector */}
                      <Select
                        value={item.hero_position?.toString() || "none"}
                        onValueChange={(value) =>
                          setHeroPosition(item.id, value === "none" ? null : Number.parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">-</SelectItem>
                          <SelectItem value="1">Hero 1</SelectItem>
                          <SelectItem value="2">Hero 2</SelectItem>
                          <SelectItem value="3">Hero 3</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => togglePublished(item.id, item.is_published)}
                        className={
                          item.is_published
                            ? "text-green-600 hover:text-green-700"
                            : "text-muted-foreground hover:text-foreground"
                        }
                        title={item.is_published ? "Despublicar" : "Publicar"}
                      >
                        {item.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                      </Button>
                      <Link href={`/admin/news/${item.id}`}>
                        <Button variant="ghost" size="sm" title="Editar notícia">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNews(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                        title="Excluir notícia"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
