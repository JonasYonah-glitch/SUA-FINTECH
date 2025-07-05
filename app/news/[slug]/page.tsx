import type { Metadata } from "next"
import NewsPageClient from "./NewsPageClient"

interface NewsPageProps {
  params: {
    slug: string
  }
}

async function getNews(slug: string) {
  const { supabase } = await import("@/lib/supabase")
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

export async function generateMetadata({ params }: NewsPageProps): Promise<Metadata> {
  const news = await getNews(params.slug)

  if (!news) {
    return {
      title: "Notícia não encontrada",
    }
  }

  return {
    title: `${news.title} | SUA FINTECH`,
    description: news.summary || news.content.substring(0, 160),
    openGraph: {
      title: news.title,
      description: news.summary || news.content.substring(0, 160),
      images: news.image_url ? [news.image_url] : [],
    },
  }
}

export default function NewsPage({ params }: NewsPageProps) {
  return <NewsPageClient params={params} />
}
