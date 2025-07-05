"use client"

import type React from "react"
import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { X, RotateCw, ZoomIn, Move, Crop } from "lucide-react"

interface ImageCropperProps {
  imageUrl: string
  onCropComplete: (croppedImageUrl: string) => void
  onCancel: () => void
  aspectRatio?: number
  title?: string
}

interface CropArea {
  x: number
  y: number
  width: number
  height: number
}

export function ImageCropper({
  imageUrl,
  onCropComplete,
  onCancel,
  aspectRatio = 16 / 9,
  title = "Recortar Imagem",
}: ImageCropperProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 50, y: 50, width: 200, height: 200 / aspectRatio })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState("")
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = useCallback(
    (e: React.MouseEvent, handle?: string) => {
      e.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (handle) {
        setIsResizing(true)
        setResizeHandle(handle)
      } else {
        // Check if click is inside crop area
        if (
          x >= cropArea.x &&
          x <= cropArea.x + cropArea.width &&
          y >= cropArea.y &&
          y <= cropArea.y + cropArea.height
        ) {
          setIsDragging(true)
          setDragStart({ x: x - cropArea.x, y: y - cropArea.y })
        }
      }
    },
    [cropArea],
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      if (isDragging) {
        const newX = Math.max(0, Math.min(x - dragStart.x, rect.width - cropArea.width))
        const newY = Math.max(0, Math.min(y - dragStart.y, rect.height - cropArea.height))
        setCropArea((prev) => ({ ...prev, x: newX, y: newY }))
      } else if (isResizing && resizeHandle) {
        const newCropArea = { ...cropArea }

        switch (resizeHandle) {
          case "nw":
            newCropArea.width = Math.max(50, cropArea.x + cropArea.width - x)
            newCropArea.height = newCropArea.width / aspectRatio
            newCropArea.x = x
            newCropArea.y = cropArea.y + cropArea.height - newCropArea.height
            break
          case "ne":
            newCropArea.width = Math.max(50, x - cropArea.x)
            newCropArea.height = newCropArea.width / aspectRatio
            newCropArea.y = cropArea.y + cropArea.height - newCropArea.height
            break
          case "sw":
            newCropArea.width = Math.max(50, cropArea.x + cropArea.width - x)
            newCropArea.height = newCropArea.width / aspectRatio
            newCropArea.x = x
            break
          case "se":
            newCropArea.width = Math.max(50, x - cropArea.x)
            newCropArea.height = newCropArea.width / aspectRatio
            break
        }

        // Ensure crop area stays within bounds
        newCropArea.x = Math.max(0, Math.min(newCropArea.x, rect.width - newCropArea.width))
        newCropArea.y = Math.max(0, Math.min(newCropArea.y, rect.height - newCropArea.height))

        setCropArea(newCropArea)
      }
    },
    [isDragging, isResizing, dragStart, cropArea, resizeHandle, aspectRatio],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setIsResizing(false)
    setResizeHandle("")
  }, [])

  const applyCrop = useCallback(() => {
    if (!imageRef.current || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imageRef.current
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!containerRect) return

    // Calculate scale factors
    const scaleX = img.naturalWidth / containerRect.width
    const scaleY = img.naturalHeight / containerRect.height

    // Set canvas size to crop area
    canvas.width = cropArea.width * scaleX
    canvas.height = cropArea.height * scaleY

    // Apply transformations
    ctx.save()
    ctx.translate(canvas.width / 2, canvas.height / 2)
    ctx.rotate((rotation * Math.PI) / 180)
    ctx.scale(zoom, zoom)

    // Draw the cropped portion
    ctx.drawImage(
      img,
      cropArea.x * scaleX,
      cropArea.y * scaleY,
      cropArea.width * scaleX,
      cropArea.height * scaleY,
      -canvas.width / 2,
      -canvas.height / 2,
      canvas.width,
      canvas.height,
    )

    ctx.restore()

    // Convert to blob and call onCropComplete
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob)
          onCropComplete(croppedImageUrl)
        }
      },
      "image/jpeg",
      0.9,
    )
  }, [cropArea, rotation, zoom, onCropComplete])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Image Container */}
            <div
              ref={containerRef}
              className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden cursor-crosshair"
              onMouseDown={(e) => handleMouseDown(e)}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <img
                ref={imageRef}
                src={imageUrl || "/placeholder.svg"}
                alt="Crop preview"
                className="w-full h-full object-contain"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: "center",
                }}
                draggable={false}
              />

              {/* Crop Overlay */}
              <div
                className="absolute border-2 border-white shadow-lg"
                style={{
                  left: cropArea.x,
                  top: cropArea.y,
                  width: cropArea.width,
                  height: cropArea.height,
                  boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
                }}
              >
                {/* Resize Handles */}
                <div
                  className="absolute w-3 h-3 bg-white border border-gray-400 cursor-nw-resize -top-1 -left-1"
                  onMouseDown={(e) => handleMouseDown(e, "nw")}
                />
                <div
                  className="absolute w-3 h-3 bg-white border border-gray-400 cursor-ne-resize -top-1 -right-1"
                  onMouseDown={(e) => handleMouseDown(e, "ne")}
                />
                <div
                  className="absolute w-3 h-3 bg-white border border-gray-400 cursor-sw-resize -bottom-1 -left-1"
                  onMouseDown={(e) => handleMouseDown(e, "sw")}
                />
                <div
                  className="absolute w-3 h-3 bg-white border border-gray-400 cursor-se-resize -bottom-1 -right-1"
                  onMouseDown={(e) => handleMouseDown(e, "se")}
                />

                {/* Move Handle */}
                <div className="absolute inset-0 cursor-move flex items-center justify-center">
                  <Move className="h-6 w-6 text-white drop-shadow-lg" />
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <ZoomIn className="h-4 w-4 inline mr-1" />
                    Zoom: {zoom.toFixed(1)}x
                  </label>
                  <Slider
                    value={[zoom]}
                    onValueChange={(value) => setZoom(value[0])}
                    min={0.5}
                    max={3}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <RotateCw className="h-4 w-4 inline mr-1" />
                    Rotação: {rotation}°
                  </label>
                  <Slider
                    value={[rotation]}
                    onValueChange={(value) => setRotation(value[0])}
                    min={-180}
                    max={180}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onCancel}>
                Cancelar
              </Button>
              <Button onClick={applyCrop} className="bg-primary hover:bg-primary/90">
                <Crop className="h-4 w-4 mr-2" />
                Aplicar Recorte
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
