"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ImageCropper } from "./image-cropper"
import { Upload, X, Edit, ImageIcon } from "lucide-react"

interface ImageUploadProps {
  value?: string
  onChange: (url: string) => void
  onRemove?: () => void
  aspectRatio?: number
  title?: string
  description?: string
  maxSizeMB?: number
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  aspectRatio = 16 / 9,
  title = "Upload de Imagem",
  description = "Clique para fazer upload ou arraste uma imagem",
  maxSizeMB = 5,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      alert(`Arquivo muito grande. Máximo ${maxSizeMB}MB.`)
      return
    }

    if (!file.type.startsWith("image/")) {
      alert("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    setIsUploading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setTempImageUrl(result)
      setShowCropper(true)
      setIsUploading(false)
    }
    reader.readAsDataURL(file)
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
    if (value) {
      setTempImageUrl(value)
      setShowCropper(true)
    }
  }

  return (
    <>
      <div className="space-y-4">
        {value ? (
          <Card>
            <CardContent className="p-4">
              <div className="relative group">
                <img src={value || "/placeholder.svg"} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
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
          <Card
            className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors cursor-pointer"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={openFileDialog}
          >
            <CardContent className="p-8 text-center">
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
