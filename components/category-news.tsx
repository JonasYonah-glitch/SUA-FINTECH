"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { supabase, type News } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

const categories = ["Startups", "Mercado", "Fintech", "Regulamentação", "Tecnologia"]

export function CategoryNews() {
  const [categoryNews, setCategoryNews] = useState<{ [key: string]: News | null }>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategoryNews()
  }, [])

  const fetchCategoryNews = async () => {
    try {
      const newsPromises = categories.map(async (category) => {
        const { data } = await supabase
          .from("news")
          .select("*")
          .eq("category", category)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        return { category, news: data }
      })

      const results = await Promise.all(newsPromises)
      const newsMap: { [key: string]: News | null } = {}

      results.forEach(({ category, news }) => {
        newsMap[category] = news || null
      })

      setCategoryNews(newsMap)
    } catch (error) {
      console.error("Error fetching category news:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="bg-card border shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-foreground">Veja Também</CardTitle>
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <div className="space-y-4">
            {categories.map((category) => (
              <div key={category} className="animate-pulse">
                <div className="h-4 bg-muted rounded mb-2"></div>
                <div className="h-24 bg-muted rounded"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card border shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-foreground">Veja Também</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-4">
          {categories.map((category) => {
            const news = categoryNews[category]

            if (!news) {
              return (
                <div key={category} className="text-center py-4">
                  <p className="text-xs text-muted-foreground">{category}</p>
                  <p className="text-xs text-muted-foreground">Nenhuma notícia</p>
                </div>
              )
            }

            return (
              <Link key={category} href={`/news/${news.slug}`}>
                <div className="group cursor-pointer">
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">{category}</p>
                  <Card className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group-hover:-translate-y-1">
                    <div className="relative">
                      <img
                        src={news.image_url || "/placeholder.svg?height=120&width=200"}
                        alt={news.title}
                        className="w-full h-20 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                    </div>
                    <CardContent className="p-3">
                      <h4 className="font-medium text-sm line-clamp-2 text-foreground leading-tight mb-1">
                        {news.title}
                      </h4>
                      <p className="text-xs text-muted-foreground">{formatDate(news.created_at)}</p>
                    </CardContent>
                  </Card>
                </div>
              </Link>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
