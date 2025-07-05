"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link,
  ImageIcon,
  Video,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Quote,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null)
  const [showLinkDialog, setShowLinkDialog] = useState(false)
  const [showImageDialog, setShowImageDialog] = useState(false)
  const [showVideoDialog, setShowVideoDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState("")
  const [linkText, setLinkText] = useState("")
  const [imageUrl, setImageUrl] = useState("")
  const [imageAlt, setImageAlt] = useState("")
  const [videoUrl, setVideoUrl] = useState("")

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value)
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const handleContentChange = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML)
    }
  }

  const insertLink = () => {
    if (linkUrl && linkText) {
      const linkHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">${linkText}</a>`
      execCommand("insertHTML", linkHtml)
      setLinkUrl("")
      setLinkText("")
      setShowLinkDialog(false)
    }
  }

  const insertImage = () => {
    if (imageUrl) {
      const imageHtml = `<div class="my-4"><img src="${imageUrl}" alt="${imageAlt}" class="max-w-full h-auto rounded-lg shadow-md mx-auto block" style="max-height: 400px;" />${
        imageAlt ? `<p class="text-center text-sm text-gray-600 mt-2 italic">${imageAlt}</p>` : ""
      }</div>`
      execCommand("insertHTML", imageHtml)
      setImageUrl("")
      setImageAlt("")
      setShowImageDialog(false)
    }
  }

  const insertVideo = () => {
    if (videoUrl) {
      let embedHtml = ""

      // YouTube
      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const videoId = videoUrl.includes("youtu.be")
          ? videoUrl.split("/").pop()?.split("?")[0]
          : videoUrl.split("v=")[1]?.split("&")[0]

        if (videoId) {
          embedHtml = `<div class="my-4 relative w-full" style="padding-bottom: 56.25%; height: 0;"><iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen class="absolute top-0 left-0 w-full h-full rounded-lg"></iframe></div>`
        }
      }
      // Vimeo
      else if (videoUrl.includes("vimeo.com")) {
        const videoId = videoUrl.split("/").pop()
        if (videoId) {
          embedHtml = `<div class="my-4 relative w-full" style="padding-bottom: 56.25%; height: 0;"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allowfullscreen class="absolute top-0 left-0 w-full h-full rounded-lg"></iframe></div>`
        }
      }
      // Generic video link
      else {
        embedHtml = `<div class="my-4"><a href="${videoUrl}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"><svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>Assistir Vídeo</a></div>`
      }

      if (embedHtml) {
        execCommand("insertHTML", embedHtml)
        setVideoUrl("")
        setShowVideoDialog(false)
      }
    }
  }

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-muted p-2 border-b border-border flex flex-wrap gap-1">
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("bold")} className="h-8 w-8 p-0">
          <Bold className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => execCommand("italic")} className="h-8 w-8 p-0">
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("underline")}
          className="h-8 w-8 p-0"
        >
          <Underline className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("justifyLeft")}
          className="h-8 w-8 p-0"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("justifyCenter")}
          className="h-8 w-8 p-0"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("justifyRight")}
          className="h-8 w-8 p-0"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertUnorderedList")}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("insertOrderedList")}
          className="h-8 w-8 p-0"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => execCommand("formatBlock", "blockquote")}
          className="h-8 w-8 p-0"
        >
          <Quote className="h-4 w-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-1" />

        <Button type="button" variant="ghost" size="sm" onClick={() => setShowLinkDialog(true)} className="h-8 w-8 p-0">
          <Link className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImageDialog(true)}
          className="h-8 w-8 p-0"
        >
          <ImageIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowVideoDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Video className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: value }}
        className="min-h-[300px] p-4 focus:outline-none prose prose-sm max-w-none"
        style={{
          lineHeight: "1.6",
        }}
        placeholder={placeholder}
      />

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Inserir Link</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="linkText">Texto do Link</Label>
                <Input
                  id="linkText"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Texto que aparecerá"
                />
              </div>
              <div>
                <Label htmlFor="linkUrl">URL</Label>
                <Input
                  id="linkUrl"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://exemplo.com"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={insertLink} disabled={!linkUrl || !linkText}>
                  Inserir
                </Button>
                <Button variant="outline" onClick={() => setShowLinkDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Inserir Imagem</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">URL da Imagem</Label>
                <Input
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt">Descrição (Alt Text)</Label>
                <Input
                  id="imageAlt"
                  value={imageAlt}
                  onChange={(e) => setImageAlt(e.target.value)}
                  placeholder="Descrição da imagem"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={insertImage} disabled={!imageUrl}>
                  Inserir
                </Button>
                <Button variant="outline" onClick={() => setShowImageDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Dialog */}
      {showVideoDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background p-6 rounded-lg w-96 max-w-[90vw]">
            <h3 className="text-lg font-semibold mb-4">Inserir Vídeo</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="videoUrl">URL do Vídeo</Label>
                <Input
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="YouTube, Vimeo ou link direto"
                />
                <p className="text-xs text-muted-foreground mt-1">Suporta YouTube, Vimeo e links diretos</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={insertVideo} disabled={!videoUrl}>
                  Inserir
                </Button>
                <Button variant="outline" onClick={() => setShowVideoDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
