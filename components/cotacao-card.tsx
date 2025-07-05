"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type CotacaoData = {
  usd: { value: string; change: string; trend: string }
  eur: { value: string; change: string; trend: string }
  btc: { value: string; change: string; trend: string }
  ibovespa: { value: string; change: string; trend: string }
}

export function CotacaoCard() {
  const [cotacoes, setCotacoes] = useState<CotacaoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCotacoes = async () => {
    try {
      const response = await fetch("/api/cotacoes")
      if (!response.ok) throw new Error("Erro ao buscar cotações")

      const data = await response.json()
      setCotacoes(data)
      setError(null)
    } catch (err) {
      console.error("Erro ao buscar cotações:", err)
      setError("Erro ao carregar dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Buscar dados iniciais
    fetchCotacoes()

    // Atualizar a cada 30 minutos (1800000 ms)
    const interval = setInterval(fetchCotacoes, 30 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <Card className="bg-card text-foreground border shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Mercado Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !cotacoes) {
    return (
      <Card className="bg-card text-foreground border shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold flex items-center">
            <TrendingDown className="h-5 w-5 mr-2" />
            Mercado Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-center text-muted-foreground">Erro ao carregar dados</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-card text-foreground border shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-bold flex items-center">
          <TrendingUp className="h-5 w-5 mr-2" />
          Mercado Financeiro
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dólar */}
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Dólar (USD/BRL)</span>
          <div className="text-right">
            <div className="font-semibold text-foreground">{cotacoes?.usd?.value ?? "--"}</div>
            <div
              className={`text-xs flex items-center gap-1 ${
                cotacoes?.usd?.change?.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {cotacoes?.usd?.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {cotacoes?.usd?.change ?? "--"}
            </div>
          </div>
        </div>

        {/* Euro */}
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Euro (EUR/BRL)</span>
          <div className="text-right">
            <div className="font-semibold text-foreground">{cotacoes?.eur?.value ?? "--"}</div>
            <div
              className={`text-xs flex items-center gap-1 ${
                cotacoes?.eur?.change?.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {cotacoes?.eur?.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {cotacoes?.eur?.change ?? "--"}
            </div>
          </div>
        </div>

        {/* Bitcoin */}
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Bitcoin (BTC/BRL)</span>
          <div className="text-right">
            <div className="font-semibold text-foreground">{cotacoes?.btc?.value ?? "--"}</div>
            <div
              className={`text-xs flex items-center gap-1 ${
                cotacoes?.btc?.change?.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {cotacoes?.btc?.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {cotacoes?.btc?.change ?? "--"}
            </div>
          </div>
        </div>

        {/* Ibovespa */}
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm font-medium text-muted-foreground">Ibovespa</span>
          <div className="text-right">
            <div className="font-semibold text-foreground">{cotacoes?.ibovespa?.value ?? "--"}</div>
            <div
              className={`text-xs flex items-center gap-1 ${
                cotacoes?.ibovespa?.change?.startsWith("+") ? "text-green-500" : "text-red-500"
              }`}
            >
              {cotacoes?.ibovespa?.trend === "up" ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {cotacoes?.ibovespa?.change ?? "--"}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
