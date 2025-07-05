"use client"

import { useState, useEffect } from "react"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Calendar, User, Share2, ArrowLeft, Tag, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { CategoryNews } from "@/components/category-news"
import Link from "next/link"
import Image from "next/image"

interface NewsPageProps {
  params: {
    slug: string
  }
}

async function getNews(slug: string) {
  const { data: news, error } = await supabase
    .from("news")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single()

  if (error || !news) {
    return null
  }

  return news
}

async function getRelatedNews(category: string, currentId: string) {
  const { data } = await supabase
    .from("news")
    .select("*")
    .eq("category", category)
    .eq("is_published", true)
    .neq("id", currentId)
    .limit(4)

  return data || []
}

export default function NewsPageClient({ params }: NewsPageProps) {
  const [news, setNews] = useState(null)
  const [relatedNews, setRelatedNews] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      const newsData = await getNews(params.slug)
      if (!newsData) {
        notFound()
        return
      }
      setNews(newsData)

      const relatedNewsData = await getRelatedNews(newsData.category, newsData.id)
      setRelatedNews(relatedNewsData)
    }

    fetchData()
  }, [params.slug])

  const downloadImage = (imageUrl: string, filename: string) => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = filename
    link.target = "_blank"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!news) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-lg border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-3">
              <Image src="/logo-new.png" alt="SUA FINTECH" width={120} height={40} className="dark:invert" />
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar ao Portal
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <article className="lg:col-span-3">
            {/* Breadcrumb */}
            <nav className="mb-6">
              <ol className="flex items-center space-x-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/" className="hover:text-foreground">
                    Início
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/noticias" className="hover:text-foreground">
                    Notícias
                  </Link>
                </li>
                <li>/</li>
                <li className="text-foreground">{news.category}</li>
              </ol>
            </nav>

            {/* Article Header */}
            <header className="mb-8">
              <Badge variant="secondary" className="mb-4">
                <Tag className="h-3 w-3 mr-1" />
                {news.category}
              </Badge>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4 leading-tight">{news.title}</h1>

              {news.summary && <p className="text-xl text-muted-foreground mb-6 leading-relaxed">{news.summary}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  <span>Por {news.author}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>{formatDate(news.created_at)}</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {news.image_url && (
              <div className="mb-8 relative group">
                <img
                  src={news.image_url || "/placeholder.svg"}
                  alt={news.title}
                  className="w-full h-64 md:h-96 object-cover rounded-lg shadow-lg"
                  style={{ aspectRatio: "16/9" }}
                />
                <Button
                  variant="secondary"
                  size="sm"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => downloadImage(news.image_url!, `${news.slug}-main.jpg`)}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
            )}

            {/* Article Content */}
            <div className="prose prose-lg max-w-none dark:prose-invert mb-8">
              <div dangerouslySetInnerHTML={{ __html: news.content }} className="rich-content" />
            </div>

            {/* Additional Images Gallery */}
            {news.images && news.images.length > 0 && (
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4">Galeria de Imagens</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {news.images.map((imageUrl, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={`Imagem ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                        style={{ aspectRatio: "4/3" }}
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => downloadImage(imageUrl, `${news.slug}-gallery-${index + 1}.jpg`)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Share Buttons */}
            <div className="flex items-center space-x-2 mb-8 pt-6 border-t border-border">
              <span className="text-sm text-muted-foreground">Compartilhar:</span>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Twitter
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                LinkedIn
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                WhatsApp
              </Button>
            </div>

            {/* Tags */}
            <div className="pt-8 border-t border-border">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-muted-foreground">Tags:</span>
                <Badge variant="outline">{news.category}</Badge>
                <Badge variant="outline">Fintech</Badge>
                <Badge variant="outline">Tecnologia</Badge>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Veja Também */}
            <div className="mb-6">
              <CategoryNews />
            </div>

            {/* Related News */}
            {relatedNews.length > 0 && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg mb-4 text-foreground">Notícias Relacionadas</h3>
                  <div className="space-y-4">
                    {relatedNews.map((item) => (
                      <Link key={item.id} href={`/news/${item.slug}`}>
                        <div className="flex space-x-3 hover:bg-accent/50 p-2 rounded-lg transition-colors">
                          <img
                            src={item.image_url || "/placeholder.svg?height=60&width=80"}
                            alt={item.title}
                            className="w-16 h-12 object-cover rounded flex-shrink-0"
                            style={{ aspectRatio: "4/3" }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-2 text-foreground mb-1">{item.title}</h4>
                            <p className="text-xs text-muted-foreground">{formatDate(item.created_at)}</p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Newsletter */}
            <Card className="bg-primary text-primary-foreground border-0 shadow-xl">
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-2">Newsletter</h3>
                <p className="text-primary-foreground/80 text-sm mb-4">
                  Receba as principais notícias de fintech direto no seu email
                </p>
                <div className="space-y-3">
                  <input
                    type="email"
                    placeholder="Seu email"
                    className="w-full px-3 py-2 rounded bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                  />
                  <Button className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    Inscrever-se
                  </Button>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Image src="/logo-icon.png" alt="SUA FINTECH" width={32} height={32} className="dark:invert" />
                <Image src="/logo-full.png" alt="SUA FINTECH" width={100} height={25} className="dark:invert" />
              </div>
              <p className="text-muted-foreground text-sm">
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
                  Twitter
                </Button>
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 SUA FINTECH. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .rich-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 16px auto;
          display: block;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        
        .rich-content iframe {
          max-width: 100%;
          border-radius: 8px;
          margin: 16px 0;
        }
        
        .rich-content a {
          color: rgb(59 130 246);
          text-decoration: underline;
        }
        
        .rich-content a:hover {
          color: rgb(29 78 216);
        }
        
        .rich-content blockquote {
          border-left: 4px solid rgb(59 130 246);
          padding-left: 16px;
          margin: 16px 0;
          font-style: italic;
          color: rgb(107 114 128);
        }
        
        .rich-content ul, .rich-content ol {
          padding-left: 24px;
          margin: 16px 0;
        }
        
        .rich-content li {
          margin: 8px 0;
        }
      `}</style>
    </div>
  )
}
