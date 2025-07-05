"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Search,
  Menu,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Twitter,
  Linkedin,
  Instagram,
  Youtube,
  ImageIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { CotacaoCard } from "@/components/cotacao-card"
import { WeatherCard } from "@/components/weather-card"
import { SelicRate } from "@/components/selic-rate"
import { supabase, type News } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"
import { CardContainer, CardBody, CardItem } from "@/components/ui/3d-card"
import { useRouter } from "next/navigation"

const ITEMS_PER_PAGE = 6

export default function FintechPortal() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [heroNews, setHeroNews] = useState<{ [key: number]: News | null }>({
    1: null,
    2: null,
    3: null,
  })
  const [regularNews, setRegularNews] = useState<News[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    fetchNews()
  }, [currentPage])

  const fetchNews = async () => {
    try {
      // Buscar notícias hero
      const { data: heroData } = await supabase
        .from("news")
        .select("*")
        .eq("is_published", true)
        .not("hero_position", "is", null)
        .order("hero_position")

      // Organizar notícias hero por posição
      const heroMap = { 1: null, 2: null, 3: null }
      heroData?.forEach((news) => {
        if (news.hero_position >= 1 && news.hero_position <= 3) {
          heroMap[news.hero_position as keyof typeof heroMap] = news
        }
      })
      setHeroNews(heroMap)

      // Buscar notícias regulares com paginação
      const offset = (currentPage - 1) * ITEMS_PER_PAGE
      const { data: regularData, count } = await supabase
        .from("news")
        .select("*", { count: "exact" })
        .eq("is_published", true)
        .is("hero_position", null)
        .order("created_at", { ascending: false })
        .range(offset, offset + ITEMS_PER_PAGE - 1)

      setRegularNews(regularData || [])
      setTotalPages(Math.ceil((count || 0) / ITEMS_PER_PAGE))
    } catch (error) {
      console.error("Error fetching news:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      router.push(`/noticias?search=${encodeURIComponent(searchTerm.trim())}`)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo-sua-fintech.png" alt="SUA FINTECH" width={120} height={40} className="dark:invert" />
            </Link>

            <nav className="hidden md:flex items-center space-x-6">
              <Link href="/" className="text-primary font-medium">
                Início
              </Link>
              <Link href="/noticias" className="text-foreground hover:text-primary font-medium transition-colors">
                Notícias
              </Link>
              <Link href="/sobre" className="text-foreground hover:text-primary font-medium transition-colors">
                Sobre
              </Link>
              <Link href="/contato" className="text-foreground hover:text-primary font-medium transition-colors">
                Contato
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Taxa Selic */}
              <div className="hidden lg:block">
                <SelicRate />
              </div>

              {/* Search Form */}
              <form onSubmit={handleSearch} className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar notícias..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </form>
              <ThemeToggle />
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden border-t border-border py-4">
              <nav className="flex flex-col space-y-3">
                <Link href="/" className="text-primary font-medium">
                  Início
                </Link>
                <Link href="/noticias" className="text-foreground hover:text-primary font-medium">
                  Notícias
                </Link>
                <Link href="/sobre" className="text-foreground hover:text-primary font-medium">
                  Sobre
                </Link>
                <Link href="/contato" className="text-foreground hover:text-primary font-medium">
                  Contato
                </Link>
                <div className="pt-2 border-t border-border">
                  <SelicRate />
                </div>
                {/* Mobile Search */}
                <form onSubmit={handleSearch} className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Buscar notícias..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </form>
              </nav>
            </div>
          )}
        </div>
      </header>

      <main>
        {/* Hero Section - Seção Dedicada */}
        <section className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[500px] items-start">
            {/* Hero 1 - Principal (2/3 da largura) */}
            <div className="lg:col-span-2">
              <CardContainer className="inter-var w-full h-full" containerClassName="py-0">
                <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-emerald-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl border">
                  {heroNews[1] ? (
                    <Link href={`/news/${heroNews[1].slug}`} className="block h-full">
                      <CardItem translateZ="15" className="w-full h-full">
                        <Card className="h-full overflow-hidden bg-card shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                          <div className="relative h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px]">
                            <img
                              src={
                                heroNews[1].image_url || "/placeholder.svg?height=500&width=800&text=Notícia Principal"
                              }
                              alt={heroNews[1].title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                              <Badge variant="secondary" className="mb-3 text-sm font-medium">
                                {heroNews[1].category}
                              </Badge>
                              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight mb-4">
                                {heroNews[1].title}
                              </h1>
                              <p className="text-white/90 text-base lg:text-lg line-clamp-3 leading-relaxed">
                                {heroNews[1].summary}
                              </p>
                              <div className="flex items-center mt-4 text-white/80 text-sm">
                                <Clock className="h-4 w-4 mr-2" />
                                <span>{formatDate(heroNews[1].created_at)}</span>
                                <span className="mx-2">•</span>
                                <span>Por {heroNews[1].author}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </CardItem>
                    </Link>
                  ) : (
                    <Card className="h-full min-h-[300px] sm:min-h-[400px] lg:min-h-[500px] flex items-center justify-center bg-muted">
                      <div className="text-center">
                        <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground text-lg">Nenhuma notícia principal definida</p>
                      </div>
                    </Card>
                  )}
                </CardBody>
              </CardContainer>
            </div>

            {/* Heroes 2 e 3 - Lado direito (1/3 da largura) */}
            <div className="lg:col-span-1 h-full">
              <div className="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-6 h-full">
                {/* Hero 2 */}
                <div className="flex-1">
                  <CardContainer className="inter-var w-full h-full" containerClassName="py-0">
                    <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-blue-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl border">
                      {heroNews[2] ? (
                        <Link href={`/news/${heroNews[2].slug}`} className="block h-full">
                          <CardItem translateZ="15" className="w-full h-full">
                            <Card className="h-full overflow-hidden bg-card shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                              <div className="relative h-full min-h-[200px] sm:min-h-[240px]">
                                <img
                                  src={
                                    heroNews[2].image_url ||
                                    "/placeholder.svg?height=240&width=400&text=Notícia Secundária" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt={heroNews[2].title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <Badge variant="secondary" className="mb-2 text-xs">
                                    {heroNews[2].category}
                                  </Badge>
                                  <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white leading-tight line-clamp-3">
                                    {heroNews[2].title}
                                  </h2>
                                  <div className="flex items-center mt-2 text-white/70 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatDate(heroNews[2].created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </CardItem>
                        </Link>
                      ) : (
                        <Card className="h-full min-h-[200px] sm:min-h-[240px] flex items-center justify-center bg-muted">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">Hero 2</p>
                          </div>
                        </Card>
                      )}
                    </CardBody>
                  </CardContainer>
                </div>

                {/* Hero 3 */}
                <div className="flex-1">
                  <CardContainer className="inter-var w-full h-full" containerClassName="py-0">
                    <CardBody className="bg-gray-50 relative group/card dark:hover:shadow-2xl dark:hover:shadow-purple-500/[0.1] dark:bg-black dark:border-white/[0.2] border-black/[0.1] w-full h-full rounded-xl border">
                      {heroNews[3] ? (
                        <Link href={`/news/${heroNews[3].slug}`} className="block h-full">
                          <CardItem translateZ="15" className="w-full h-full">
                            <Card className="h-full overflow-hidden bg-card shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer">
                              <div className="relative h-full min-h-[200px] sm:min-h-[240px]">
                                <img
                                  src={
                                    heroNews[3].image_url ||
                                    "/placeholder.svg?height=240&width=400&text=Notícia Secundária" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg" ||
                                    "/placeholder.svg"
                                  }
                                  alt={heroNews[3].title}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                                <div className="absolute bottom-0 left-0 right-0 p-4">
                                  <Badge variant="secondary" className="mb-2 text-xs">
                                    {heroNews[3].category}
                                  </Badge>
                                  <h2 className="text-sm sm:text-base lg:text-lg font-bold text-white leading-tight line-clamp-3">
                                    {heroNews[3].title}
                                  </h2>
                                  <div className="flex items-center mt-2 text-white/70 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    <span>{formatDate(heroNews[3].created_at)}</span>
                                  </div>
                                </div>
                              </div>
                            </Card>
                          </CardItem>
                        </Link>
                      ) : (
                        <Card className="h-full min-h-[200px] sm:min-h-[240px] flex items-center justify-center bg-muted">
                          <div className="text-center">
                            <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-muted-foreground text-sm">Hero 3</p>
                          </div>
                        </Card>
                      )}
                    </CardBody>
                  </CardContainer>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Últimas Notícias Section - Redesign conforme imagem */}
        <section className="bg-muted/30 py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
              {/* Latest News Content */}
              <div className="xl:col-span-3">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-bold text-foreground">Últimas Notícias</h2>
                  <Link href="/noticias">
                    <Button variant="outline" size="sm">
                      Ver todas
                    </Button>
                  </Link>
                </div>

                <div className="space-y-6">
                  {regularNews.map((news) => (
                    <Link key={news.id} href={`/news/${news.slug}`}>
                      <Card className="overflow-hidden bg-card shadow-sm border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
                        <div className="flex flex-col sm:flex-row">
                          {/* Imagem à esquerda */}
                          <div className="w-full sm:w-48 h-48 sm:h-32 flex-shrink-0 relative overflow-hidden">
                            {news.image_url ? (
                              <img
                                src={news.image_url || "/placeholder.svg"}
                                alt={news.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center">
                                <ImageIcon className="h-12 w-12 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Conteúdo à direita */}
                          <CardContent className="p-6 flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant="secondary" className="text-xs font-medium">
                                  {news.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-muted-foreground">SUA FINTECH</span>
                              </div>
                            </div>

                            <h3 className="font-bold text-xl text-foreground mb-2 line-clamp-2 leading-tight group-hover:text-primary transition-colors">
                              {news.title}
                            </h3>

                            {news.summary && (
                              <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-3">
                                {news.summary}
                              </p>
                            )}

                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{formatDate(news.created_at)}</span>
                                </div>
                                <span>Em {news.category}</span>
                              </div>
                              <span className="font-medium">Por {news.author}</span>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const page = i + 1
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      )
                    })}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {regularNews.length === 0 && !loading && (
                  <div className="text-center py-16">
                    <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground text-lg">Nenhuma notícia encontrada.</p>
                  </div>
                )}
              </div>

              {/* Sidebar - API Cards */}
              <div className="xl:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Financial Data */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">Mercado Financeiro</h3>
                    <CotacaoCard />
                  </div>

                  {/* Weather Widget */}
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-4">Clima</h3>
                    <WeatherCard />
                  </div>

                  {/* Social Media */}
                  <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0 shadow-xl">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-4">Siga-nos</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all"
                        >
                          <Twitter className="h-4 w-4 mr-2" />
                          Twitter
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all"
                        >
                          <Linkedin className="h-4 w-4 mr-2" />
                          LinkedIn
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all"
                        >
                          <Instagram className="h-4 w-4 mr-2" />
                          Instagram
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="bg-white/10 hover:bg-white/20 text-white border-white/20 transition-all"
                        >
                          <Youtube className="h-4 w-4 mr-2" />
                          YouTube
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Newsletter */}
                  <Card className="bg-primary text-primary-foreground border-0 shadow-xl">
                    <CardContent className="p-6">
                      <h3 className="font-bold text-lg mb-2">Newsletter</h3>
                      <p className="text-primary-foreground/80 text-sm mb-4 leading-relaxed">
                        Receba as principais notícias de fintech direto no seu email
                      </p>
                      <div className="space-y-3">
                        <Input
                          placeholder="Seu email"
                          className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                        />
                        <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 transition-all">
                          Inscrever-se
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo-sua-fintech.png" alt="SUA FINTECH" width={120} height={30} className="dark:invert" />
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                O portal de notícias mais completo sobre o mercado financeiro e tecnologia.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Seções</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/noticias" className="hover:text-foreground transition-colors">
                    Notícias
                  </Link>
                </li>
                <li>
                  <Link href="/sobre" className="hover:text-foreground transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="hover:text-foreground transition-colors">
                    Contato
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Empresa</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/sobre" className="hover:text-foreground transition-colors">
                    Sobre
                  </Link>
                </li>
                <li>
                  <Link href="/contato" className="hover:text-foreground transition-colors">
                    Contato
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-foreground transition-colors">
                    Admin
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Redes Sociais</h4>
              <div className="flex space-x-4">
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Instagram className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Youtube className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SUA FINTECH. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
