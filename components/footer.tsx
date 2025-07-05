"use client"

import { Facebook, Instagram, Twitter } from "lucide-react"

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-muted py-8 mt-16 border-t">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Branding */}
        <div className="text-center md:text-left">
          <h2 className="text-lg font-semibold">SUA FINTECH</h2>
          <p className="text-sm text-muted-foreground">Notícias e dados do mercado financeiro em tempo real.</p>
        </div>

        {/* Links rápidos */}
        <nav className="flex gap-6">
          <a href="/noticias" className="text-sm hover:underline">
            Notícias
          </a>
          <a href="/sobre" className="text-sm hover:underline">
            Sobre
          </a>
          <a href="/contato" className="text-sm hover:underline">
            Contato
          </a>
          <a href="/admin" className="text-sm hover:underline">
            Admin
          </a>
        </nav>

        {/* Social */}
        <div className="flex gap-4">
          <a aria-label="Facebook" href="#" className="hover:text-primary">
            <Facebook className="h-5 w-5" />
          </a>
          <a aria-label="Instagram" href="#" className="hover:text-primary">
            <Instagram className="h-5 w-5" />
          </a>
          <a aria-label="Twitter" href="#" className="hover:text-primary">
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>

      <div className="text-center text-xs text-muted-foreground mt-6">
        © {year} SUA FINTECH. Todos os direitos reservados.
      </div>
    </footer>
  )
}
