"use client"

import type React from "react"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent } from "@/components/ui/card"
import { RotateCw, ZoomIn, Square } from "lucide-react"

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

interface ImageCropperAdvancedProps {
  imageUrl: string
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number // width/height ratio (ex: 16/9, 1, 4/3)
}

export function ImageCropperAdvanced({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 1,
}: ImageCropperAdvancedProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [image, setImage] = useState<HTMLImageElement | null>(null)
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 })
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState<string | null>(null)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [containerSize, setContainerSize] = useState({ width: 400, height: 400 })

  // Carregar imagem
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      setImage(img)
      // Ajustar área de crop inicial baseada na proporção
      const initialSize = Math.min(200, containerSize.width * 0.4, containerSize.height * 0.4)
      const initialWidth = aspectRatio >= 1 ? initialSize : initialSize * aspectRatio
      const initialHeight = aspectRatio >= 1 ? initialSize / aspectRatio : initialSize

      setCropArea({
        x: (containerSize.width - initialWidth) / 2,
        y: (containerSize.height - initialHeight) / 2,
        width: initialWidth,
        height: initialHeight,
      })
    }
    img.src = imageUrl
  }, [imageUrl, aspectRatio, containerSize])

  // Atualizar tamanho do container
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setContainerSize({ width: rect.width, height: rect.height })
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Desenhar no canvas
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !image) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = containerSize.width
    canvas.height = containerSize.height

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Salvar contexto
    ctx.save()

    // Aplicar transformações
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(scale, scale)

    // Desenhar imagem centralizada
    const imgWidth = image.width
    const imgHeight = image.height
    ctx.drawImage(image, -imgWidth / 2, -imgHeight / 2, imgWidth, imgHeight)

    // Restaurar contexto
    ctx.restore()

    // Desenhar overlay escuro
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Limpar área de crop
    ctx.globalCompositeOperation = "destination-out"
    ctx.fillRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

    // Restaurar modo de composição
    ctx.globalCompositeOperation = "source-over"

    // Desenhar borda da área de crop
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 2
    ctx.strokeRect(cropArea.x, cropArea.y, cropArea.width, cropArea.height)

    // Desenhar handles de redimensionamento
    const handleSize = 8
    const handles = [
      { x: cropArea.x - handleSize / 2, y: cropArea.y - handleSize / 2, cursor: "nw-resize" },
      { x: cropArea.x + cropArea.width - handleSize / 2, y: cropArea.y - handleSize / 2, cursor: "ne-resize" },
      { x: cropArea.x - handleSize / 2, y: cropArea.y + cropArea.height - handleSize / 2, cursor: "sw-resize" },
      {
        x: cropArea.x + cropArea.width - handleSize / 2,
        y: cropArea.y + cropArea.height - handleSize / 2,
        cursor: "se-resize",
      },
    ]

    ctx.fillStyle = "#ffffff"
    ctx.strokeStyle = "#000000"
    ctx.lineWidth = 1

    handles.forEach((handle) => {
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize)
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize)
    })
  }, [image, scale, rotation, cropArea, containerSize])

  // Redesenhar quando necessário
  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  // Handlers de mouse
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    // Verificar se clicou em um handle
    const handleSize = 8
    const handles = [
      { x: cropArea.x - handleSize / 2, y: cropArea.y - handleSize / 2, type: "nw" },
      { x: cropArea.x + cropArea.width - handleSize / 2, y: cropArea.y - handleSize / 2, type: "ne" },
      { x: cropArea.x - handleSize / 2, y: cropArea.y + cropArea.height - handleSize / 2, type: "sw" },
      { x: cropArea.x + cropArea.width - handleSize / 2, y: cropArea.y + cropArea.height - handleSize / 2, type: "se" },
    ]

    for (const handle of handles) {
      if (x >= handle.x && x <= handle.x + handleSize && y >= handle.y && y <= handle.y + handleSize) {
        setIsResizing(handle.type)
        setDragStart({ x, y })
        return
      }
    }

    // Verificar se clicou dentro da área de crop para arrastar
    if (x >= cropArea.x && x <= cropArea.x + cropArea.width && y >= cropArea.y && y <= cropArea.y + cropArea.height) {
      setIsDragging(true)
      setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    if (isDragging) {
      const newX = Math.max(0, Math.min(x - dragStart.x, containerSize.width - cropArea.width))
      const newY = Math.max(0, Math.min(y - dragStart.y, containerSize.height - cropArea.height))
      setCropArea((prev) => ({ ...prev, x: newX, y: newY }))
    } else if (isResizing) {
      const deltaX = x - dragStart.x
      const deltaY = y - dragStart.y

      setCropArea((prev) => {
        const newArea = { ...prev }

        switch (isResizing) {
          case "nw":
            newArea.x = Math.max(0, prev.x + deltaX)
            newArea.y = Math.max(0, prev.y + deltaY)
            newArea.width = Math.max(50, prev.width - deltaX)
            newArea.height = Math.max(50, prev.height - deltaY)
            break
          case "ne":
            newArea.y = Math.max(0, prev.y + deltaY)
            newArea.width = Math.max(50, prev.width + deltaX)
            newArea.height = Math.max(50, prev.height - deltaY)
            break
          case "sw":
            newArea.x = Math.max(0, prev.x + deltaX)
            newArea.width = Math.max(50, prev.width - deltaX)
            newArea.height = Math.max(50, prev.height + deltaY)
            break
          case "se":
            newArea.width = Math.max(50, prev.width + deltaX)
            newArea.height = Math.max(50, prev.height + deltaY)
            break
        }

        // Manter proporção se especificada
        if (aspectRatio && aspectRatio !== 1) {
          if (aspectRatio > 1) {
            newArea.height = newArea.width / aspectRatio
          } else {
            newArea.width = newArea.height * aspectRatio
          }
        }

        // Garantir que não saia dos limites
        newArea.width = Math.min(newArea.width, containerSize.width - newArea.x)
        newArea.height = Math.min(newArea.height, containerSize.height - newArea.y)

        return newArea
      })

      setDragStart({ x, y })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setIsResizing(null)
  }

  // Aplicar crop
  const applyCrop = () => {
    if (!canvasRef.current || !image) return

    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Configurar canvas de saída
    canvas.width = cropArea.width
    canvas.height = cropArea.height

    // Calcular posição da imagem no canvas original
    const sourceCanvas = canvasRef.current
    const sourceCtx = sourceCanvas.getContext("2d")
    if (!sourceCtx) return

    // Criar canvas temporário com a imagem transformada
    const tempCanvas = document.createElement("canvas")
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) return

    tempCanvas.width = containerSize.width
    tempCanvas.height = containerSize.height

    // Aplicar transformações
    tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2)
    tempCtx.rotate((rotation * Math.PI) / 180)
    tempCtx.scale(scale, scale)
    tempCtx.drawImage(image, -image.width / 2, -image.height / 2, image.width, image.height)

    // Extrair área cropada
    const imageData = tempCtx.getImageData(cropArea.x, cropArea.y, cropArea.width, cropArea.height)
    ctx.putImageData(imageData, 0, 0)

    // Converter para blob e chamar callback
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob)
          onCropComplete(url)
        }
      },
      "image/jpeg",
      0.9,
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Canvas de edição */}
          <div
            ref={containerRef}
            className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 cursor-move"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Controles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Zoom */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <ZoomIn className="h-4 w-4 mr-2" />
                Zoom: {Math.round(scale * 100)}%
              </label>
              <Slider
                value={[scale]}
                onValueChange={([value]) => setScale(value)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            {/* Rotação */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <RotateCw className="h-4 w-4 mr-2" />
                Rotação: {rotation}°
              </label>
              <Slider
                value={[rotation]}
                onValueChange={([value]) => setRotation(value)}
                min={-180}
                max={180}
                step={1}
                className="w-full"
              />
            </div>

            {/* Proporção */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center">
                <Square className="h-4 w-4 mr-2" />
                Proporção: {aspectRatio === 1 ? "1:1" : aspectRatio > 1 ? `${aspectRatio}:1` : `1:${1 / aspectRatio}`}
              </label>
              <div className="flex gap-2">
                <Button
                  variant={aspectRatio === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    const size = Math.min(cropArea.width, cropArea.height)
                    setCropArea((prev) => ({ ...prev, width: size, height: size }))
                  }}
                >
                  1:1
                </Button>
                <Button
                  variant={aspectRatio === 16 / 9 ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCropArea((prev) => ({ ...prev, height: (prev.width * 9) / 16 }))
                  }}
                >
                  16:9
                </Button>
                <Button
                  variant={aspectRatio === 4 / 3 ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setCropArea((prev) => ({ ...prev, height: (prev.width * 3) / 4 }))
                  }}
                >
                  4:3
                </Button>
              </div>
            </div>
          </div>

          {/* Instruções */}
          <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
            <p className="font-medium mb-1">Como usar:</p>
            <ul className="space-y-1 text-xs">
              <li>• Arraste a área de recorte para movê-la</li>
              <li>• Use os pontos brancos nos cantos para redimensionar</li>
              <li>• Ajuste zoom e rotação com os controles</li>
              <li>• Escolha a proporção desejada</li>
            </ul>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button onClick={applyCrop} className="bg-primary hover:bg-primary/90">
              Aplicar Recorte
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
