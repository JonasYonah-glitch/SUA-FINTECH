"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NewsEditor } from "@/components/news-editor"
import { getAuthToken } from "@/lib/auth"
import Link from "next/link"
import Image from "next/image"

export default function NewNewsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Check authentication
    const user = getAuthToken()
    if (!user) {
      router.push("/admin/login")
      return
    }
  }, [router])

  const handleSave = (data: any) => {
    // Redirecionar após 2 segundos
    setTimeout(() => {
      router.push("/admin")
    }, 2000)
  }

  const handleCancel = () => {
    router.push("/admin")
  }

  if (!mounted) {
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
            <div className="flex items-center space-x-3">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Voltar
                </Button>
              </Link>
              <Image src="/logo-sua-fintech.png" alt="SUA FINTECH" width={120} height={40} className="dark:invert" />
              <h1 className="text-lg font-bold text-foreground">Nova Notícia</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <NewsEditor mode="create" onSave={handleSave} onCancel={handleCancel} />
      </main>
    </div>
  )
}
