"use client"

import { useState, useEffect } from "react"
import { TrendingUp, RefreshCw } from "lucide-react"

type SelicData = {
  data: string
  valor: string
}

export function SelicRate() {
  const [selicRate, setSelicRate] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  const fetchSelicRate = async () => {
    try {
      setLoading(true)
      setError(false)

      // Data atual no formato dd/mm/yyyy
      const today = new Date()
      const dataAtual = today.toLocaleDateString("pt-BR")

      // Buscar dados dos últimos 30 dias para garantir que temos dados
      const dataInicial = new Date()
      dataInicial.setDate(dataInicial.getDate() - 30)
      const dataInicialFormatted = dataInicial.toLocaleDateString("pt-BR")

      const response = await fetch(
        `https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados?formato=json&dataInicial=${dataInicialFormatted}&dataFinal=${dataAtual}`,
      )

      if (!response.ok) throw new Error("Erro ao buscar dados")

      const data: SelicData[] = await response.json()

      if (data && data.length > 0) {
        // Pegar o último valor disponível
        const ultimoValor = data[data.length - 1]
        setSelicRate(ultimoValor.valor)
      } else {
        throw new Error("Nenhum dado encontrado")
      }
    } catch (err) {
      console.error("Erro ao buscar taxa Selic:", err)
      setError(true)
      setSelicRate("13,75") // Valor fallback
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSelicRate()

    // Atualizar a cada hora
    const interval = setInterval(fetchSelicRate, 60 * 60 * 1000)

    // Configurar atualização diária às 08:00
    const now = new Date()
    const next8AM = new Date()
    next8AM.setHours(8, 0, 0, 0)

    if (next8AM <= now) {
      next8AM.setDate(next8AM.getDate() + 1)
    }

    const timeUntil8AM = next8AM.getTime() - now.getTime()

    const timeout = setTimeout(() => {
      fetchSelicRate()
      // Depois da primeira execução às 08:00, repetir a cada 24 horas
      setInterval(fetchSelicRate, 24 * 60 * 60 * 1000)
    }, timeUntil8AM)

    return () => {
      clearInterval(interval)
      clearTimeout(timeout)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
        <span>Selic...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center text-sm text-muted-foreground">
        <span>Selic: --</span>
      </div>
    )
  }

  return (
    <div className="flex items-center text-sm font-medium text-foreground">
      <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
      <span>Selic Hoje: {selicRate}%</span>
    </div>
  )
}
