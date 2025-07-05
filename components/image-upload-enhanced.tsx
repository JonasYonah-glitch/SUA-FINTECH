"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageCropper } from "./image-cropper"
import { Upload, X, Edit, ImageIcon, Link, Crop } from "lucide-react"

interface ImageUploadEnhancedProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  aspectRatio?: number
  title?: string
  description?: string
  maxSizeMB?: number
  showCropOption?: boolean
}

export function ImageUploadEnhanced({
  value,
  onChange,
  onRemove,
  aspectRatio = 16 / 9,
  title = "Upload de Imagem",
  description = "Faça upload ou cole uma URL",
  maxSizeMB = 5,
  showCropOption = true,
}: ImageUploadEnhancedProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState("")
  const [activeTab, setActiveTab] = useState("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const handleFileSelect = (file: File) => {
    setUploadError(null)

    // Validar tamanho
    if (file.size > maxSizeMB * 1024 * 1024) {
      setUploadError(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`)
      return
    }

    // Validar tipo
    if (!file.type.startsWith("image/")) {
      setUploadError("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    // Validar tipos específicos
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Formato não suportado. Use JPG, PNG, WEBP ou GIF.")
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setTempImageUrl(result)
      if (showCropOption) {
        setShowCropper(true)
      } else {
        onChange(result)
      }
      setIsUploading(false)
    }
    reader.onerror = () => {
      setUploadError("Erro ao ler o arquivo. Tente novamente.")
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim())
      setUrlInput("")
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleCropComplete = (croppedImageUrl: string) => {
    onChange(croppedImageUrl)
    setShowCropper(false)
    setTempImageUrl(null)
  }

  const handleCropCancel = () => {
    setShowCropper(false)
    setTempImageUrl(null)
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const handleEdit = () => {
    if (value && showCropOption) {
      setTempImageUrl(value)
      setShowCropper(true)
    }
  }

  const handleCropImage = () => {
    if (value) {
      setTempImageUrl(value)
      setShowCropper(true)
    }
  }

  return (
    <>
      {uploadError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{uploadError}</p>
        </div>
      )}
      <div className="space-y-4">
        {value ? (
          <Card>
            <CardContent className="p-4">
              <div className="relative group">
                <img src={value || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  {showCropOption && (
                    <Button variant="secondary" size="sm" onClick={handleCropImage}>
                      <Crop className="h-4 w-4 mr-2" />
                      Recortar
                    </Button>
                  )}
                  <Button variant="secondary" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  {onRemove && (
                    <Button variant="destructive" size="sm" onClick={onRemove}>
                      <X className="h-4 w-4 mr-2" />
                      Remover
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload</TabsTrigger>
                  <TabsTrigger value="url">URL</TabsTrigger>
                </TabsList>

                <TabsContent value="upload" className="mt-4">
                  <div
                    className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer rounded-lg p-8 text-center"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={openFileDialog}
                  >
                    <div className="space-y-4">
                      <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                        {isUploading ? (
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{description}</p>
                        <p className="text-xs text-muted-foreground mt-2">PNG, JPG, WEBP até {maxSizeMB}MB</p>
                      </div>
                      <Button variant="outline" size="sm" disabled={isUploading}>
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploading ? "Carregando..." : "Selecionar Arquivo"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="url" className="mt-4">
                  <div className="space-y-4">
                    <div>
                      <Input
                        placeholder="Cole a URL da imagem aqui..."
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleUrlSubmit()}
                      />
                    </div>
                    <Button onClick={handleUrlSubmit} disabled={!urlInput.trim()} className="w-full">
                      <Link className="h-4 w-4 mr-2" />
                      Usar URL
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileInputChange} className="hidden" />
      </div>

      {showCropper && tempImageUrl && (
        <ImageCropper
          imageUrl={tempImageUrl}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
          title="Recortar Imagem"
        />
      )}
    </>
  )
}
