"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RichTextEditor } from "@/components/rich-text-editor"
import { ImageUploadEnhanced } from "@/components/image-upload-enhanced"
import { supabase, type Category, type News } from "@/lib/supabase"
import { Save, Eye, Trash2, AlertCircle, CheckCircle, Loader2, X } from "lucide-react"

interface NewsEditorProps {
  mode: "create" | "edit"
  initialData?: Partial<News>
  onSave?: (data: any) => void
  onDelete?: () => void
  onCancel?: () => void
}

interface FormData {
  title: string
  slug: string
  summary: string
  content: string
  image_url: string
  images: string[]
  category: string
  author: string
  is_published: boolean
  hero_position: number | null
  is_vertical_list: boolean
}

export function NewsEditor({ mode, initialData, onSave, onDelete, onCancel }: NewsEditorProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState<FormData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    summary: initialData?.summary || "",
    content: initialData?.content || "",
    image_url: initialData?.image_url || "",
    images: initialData?.images || [],
    category: initialData?.category || "",
    author: initialData?.author || "Redação SUA FINTECH",
    is_published: initialData?.is_published || false,
    hero_position: initialData?.hero_position || null,
    is_vertical_list: initialData?.is_vertical_list || false,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("categories").select("*").order("name")
      setCategories(data || [])
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value }

      // Auto-gerar slug quando título muda
      if (field === "title" && mode === "create") {
        newData.slug = generateSlug(value)
      }

      return newData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Validações
      if (!formData.title.trim()) {
        throw new Error("Título é obrigatório")
      }
      if (!formData.content.trim()) {
        throw new Error("Conteúdo é obrigatório")
      }
      if (!formData.category) {
        throw new Error("Categoria é obrigatória")
      }

      const newsData = {
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug.trim() || generateSlug(formData.title),
        summary: formData.summary.trim() || null,
        content: formData.content.trim(),
        image_url: formData.image_url.trim() || null,
        author: formData.author.trim() || "Redação SUA FINTECH",
        updated_at: new Date().toISOString(),
      }

      if (mode === "create") {
        newsData.created_at = new Date().toISOString()
      }

      const response = await fetch("/api/news", {
        method: mode === "create" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mode === "edit" ? { ...newsData, id: initialData?.id } : newsData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || `Erro HTTP ${response.status}`)
      }

      setSuccess(result.message || `Notícia ${mode === "create" ? "criada" : "atualizada"} com sucesso!`)

      if (onSave) {
        onSave(result.data)
      }
    } catch (error) {
      console.error("Error saving news:", error)
      setError(error instanceof Error ? error.message : "Erro ao salvar notícia")
    } finally {
      setLoading(false)
    }
  }

  const addImageToGallery = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, imageUrl],
    }))
  }

  const removeImageFromGallery = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conteúdo da Notícia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  placeholder="Digite o título da notícia..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">Slug (URL) *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleInputChange("slug", e.target.value)}
                  placeholder="url-da-noticia"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">URL: /news/{formData.slug || "url-da-noticia"}</p>
              </div>

              <div>
                <Label htmlFor="summary">Resumo</Label>
                <Textarea
                  id="summary"
                  value={formData.summary}
                  onChange={(e) => handleInputChange("summary", e.target.value)}
                  placeholder="Breve resumo da notícia..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Conteúdo *</Label>
                <div className="mt-1">
                  <RichTextEditor
                    value={formData.content}
                    onChange={(value) => handleInputChange("content", value)}
                    placeholder="Escreva o conteúdo completo da notícia..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Images Section */}
          <Card>
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label>Imagem Principal *</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Imagem que aparecerá como destaque da notícia (proporção 16:9)
                </p>
                <ImageUploadEnhanced
                  value={formData.image_url}
                  onChange={(url) => handleInputChange("image_url", url)}
                  onRemove={() => handleInputChange("image_url", "")}
                  aspectRatio={16 / 9}
                  title="Upload da Imagem Principal"
                  description="Faça upload ou cole uma URL da imagem principal"
                  showCropOption={true}
                />
              </div>

              <div>
                <Label>Galeria de Imagens</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Imagens adicionais que aparecerão no corpo da notícia
                </p>

                <ImageUploadEnhanced
                  onChange={addImageToGallery}
                  aspectRatio={4 / 3}
                  title="Adicionar à Galeria"
                  description="Faça upload ou cole uma URL para adicionar à galeria"
                  showCropOption={true}
                />

                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                    {formData.images.map((url, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={url || "/placeholder.svg"}
                          alt={`Galeria ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                          onClick={() => removeImageFromGallery(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Publicação</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Categoria *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="author">Autor</Label>
                <Input
                  id="author"
                  value={formData.author}
                  onChange={(e) => handleInputChange("author", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Positioning */}
          <Card>
            <CardHeader>
              <CardTitle>Posicionamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="hero_position">Posição Hero</Label>
                <Select
                  value={formData.hero_position?.toString() || "none"}
                  onValueChange={(value) =>
                    handleInputChange("hero_position", value === "none" ? null : Number.parseInt(value))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione posição" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    <SelectItem value="1">Hero 1 (Principal)</SelectItem>
                    <SelectItem value="2">Hero 2 (Superior direita)</SelectItem>
                    <SelectItem value="3">Hero 3 (Inferior direita)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="is_vertical_list">Lista Vertical</Label>
                  <p className="text-xs text-muted-foreground">Aparece abaixo do Hero</p>
                </div>
                <Switch
                  id="is_vertical_list"
                  checked={formData.is_vertical_list}
                  onCheckedChange={(checked) => handleInputChange("is_vertical_list", checked)}
                />
              </div>

              <div className="flex items-center justify-between py-2">
                <div>
                  <Label htmlFor="is_published">Publicar Imediatamente</Label>
                  <p className="text-xs text-muted-foreground">Tornar visível no site</p>
                </div>
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(checked) => handleInputChange("is_published", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || !formData.title || !formData.content || !formData.category}
                  className="w-full"
                >
                  {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  {loading ? "Salvando..." : mode === "create" ? "Criar Notícia" : "Salvar Alterações"}
                </Button>

                <Button variant="outline" size="sm" className="w-full bg-transparent" disabled={loading}>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </Button>

                {mode === "edit" && onDelete && (
                  <Button variant="destructive" size="sm" className="w-full" onClick={onDelete}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Notícia
                  </Button>
                )}

                {onCancel && (
                  <Button variant="ghost" size="sm" className="w-full" onClick={onCancel}>
                    Cancelar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          {formData.image_url && (
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="border border-border rounded-lg p-4 bg-card">
                  <img
                    src={formData.image_url || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">{formData.category || "Categoria"}</div>
                    <h3 className="font-semibold text-sm line-clamp-2">{formData.title || "Título da notícia"}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {formData.summary || "Resumo da notícia"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </form>
    </div>
  )
}
