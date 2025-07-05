"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Search, Filter, ChevronLeft, ChevronRight, Clock, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase, type News } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import Footer from "@/components/footer"
import Link from "next/link"
import Image from "next/image"

const ITEMS_PER_PAGE = 12

export default function NoticiasPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [searchTerm, setSearchTerm] = useState(searchParams?.get("search") || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams?.get("category") || "all")
  const [currentPage, setCurrentPage] = useState(Number.parseInt(searchParams?.get("page") || "1"))
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)

  const categories = ["Fintech", "Startups", "Mercado", "Regulamentação", "Tecnologia"]

  useEffect(() => {
    fetchNews()
  }, [currentPage, selectedCategory])

  useEffect(() => {
    // Se há termo de busca na URL, executar busca
    const urlSearchTerm = searchParams?.get("search")
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm)
      performSearch(urlSearchTerm)
    } else {
      fetchNews()
    }
  }, [searchParams])

  const fetchNews = async () => {
    try {
      setLoading(true)
      setError(null)

      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      let query = supabase.from("news").select("*", { count: "exact" }).eq("is_published", true)

      if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory)
      }

      const { data, error, count } = await query
        .order("created_at", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      if (error) throw error

      setNews(data || [])
      setTotalResults(count || 0)
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error) {
      console.error("Error fetching news:", error)
      setError("Erro ao carregar notícias")
    } finally {
      setLoading(false)
    }
  }

  const performSearch = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) {
      fetchNews()
      return
    }

    try {
      setSearching(true)
      setError(null)

      const response = await fetch(
        `/api/news/search?q=${encodeURIComponent(query)}&page=${currentPage}&limit=${ITEMS_PER_PAGE}&category=${selectedCategory}`,
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro na busca")
      }

      setNews(result.data || [])
      setTotalResults(result.pagination.total)
      setTotalPages(result.pagination.totalPages)
    } catch (error) {
      console.error("Search error:", error)
      setError(error instanceof Error ? error.message : "Erro ao buscar notícias")
    } finally {
      setSearching(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)

    // Atualizar URL
    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim())
    }
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory)
    }
    params.set("page", "1")

    router.push(`/noticias?${params.toString()}`)
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)

    // Atualizar URL
    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim())
    }
    if (category !== "all") {
      params.set("category", category)
    }
    params.set("page", "1")

    router.push(`/noticias?${params.toString()}`)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)

    // Atualizar URL
    const params = new URLSearchParams()
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim())
    }
    if (selectedCategory !== "all") {
      params.set("category", selectedCategory)
    }
    params.set("page", page.toString())

    router.push(`/noticias?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSelectedCategory("all")
    setCurrentPage(1)
    router.push("/noticias")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo-sua-fintech.png" alt="SUA FINTECH" width={120} height={40} className="dark:invert" />
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-foreground hover:text-primary font-medium transition-colors">
                Início
              </Link>
              <Link href="/noticias" className="text-primary font-medium">
                Notícias
              </Link>
              <Link href="/sobre" className="text-foreground hover:text-primary font-medium transition-colors">
                Sobre
              </Link>
              <Link href="/contato" className="text-foreground hover:text-primary font-medium transition-colors">
                Contato
              </Link>
            </nav>

            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Notícias</h1>
          <p className="text-muted-foreground">
            Fique por dentro das últimas novidades do mercado financeiro e tecnologia
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar notícias..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-full md:w-48">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as categorias</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button type="submit" disabled={searching}>
                  {searching ? "Buscando..." : "Buscar"}
                </Button>

                {(searchTerm || selectedCategory !== "all") && (
                  <Button variant="outline" onClick={clearSearch}>
                    Limpar
                  </Button>
                )}
              </div>
            </form>

            {/* Results Info */}
            {(searchTerm || selectedCategory !== "all") && (
              <div className="mt-4 pt-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  {totalResults} resultado{totalResults !== 1 ? "s" : ""} encontrado{totalResults !== 1 ? "s" : ""}
                  {searchTerm && ` para "${searchTerm}"`}
                  {selectedCategory !== "all" && ` em ${selectedCategory}`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error State */}
        {error && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent className="p-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {(loading || searching) && (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {/* News Grid */}
        {!loading && !searching && (
          <>
            {news.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {news.map((article) => (
                  <Link key={article.id} href={`/news/${article.slug}`}>
                    <Card className="overflow-hidden bg-card shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group h-full">
                      <div className="relative h-48 overflow-hidden">
                        {article.image_url ? (
                          <img
                            src={article.image_url || "/placeholder.svg"}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <ImageIcon className="h-12 w-12 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6 flex flex-col flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-xs text-muted-foreground">•</span>
                          <span className="text-xs text-muted-foreground">SUA FINTECH</span>
                        </div>

                        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors flex-1">
                          {article.title}
                        </h3>

                        {article.summary && (
                          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
                            {article.summary}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                          <span>Por {article.author}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {searchTerm ? "Nenhum resultado encontrado" : "Nenhuma notícia disponível"}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm
                    ? "Tente buscar com outros termos ou remova os filtros"
                    : "Não há notícias publicadas no momento"}
                </p>
                {searchTerm && <Button onClick={clearSearch}>Ver todas as notícias</Button>}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
