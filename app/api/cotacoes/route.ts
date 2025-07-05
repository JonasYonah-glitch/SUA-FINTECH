import { NextResponse } from "next/server"

// Cache global em memória
let cache: {
  data: any
  timestamp: number
} | null = null

const CACHE_TTL = 30 * 60 * 1000 // 30 minutos em ms

// Função para buscar cotações das APIs externas
async function fetchCotacoes() {
  try {
    console.log("Buscando cotações das APIs externas...")

    // Buscar dados das APIs externas
    const [usdResponse, btcResponse, ibovespaResponse] = await Promise.allSettled([
      fetch("https://api.exchangerate-api.com/v4/latest/USD"),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl&include_24hr_change=true"),
      fetch("https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP"),
    ])

    const cotacoes = {
      usd: { value: "R$ 5,12", change: "+0.8%", trend: "up" },
      eur: { value: "R$ 5,58", change: "-0.3%", trend: "down" },
      btc: { value: "R$ 285.420", change: "+2.1%", trend: "up" },
      ibovespa: { value: "126.847", change: "+1.2%", trend: "up" },
      lastUpdate: new Date().toISOString(),
    }

    // Processar USD/EUR
    if (usdResponse.status === "fulfilled" && usdResponse.value.ok) {
      const usdData = await usdResponse.value.json()
      const usdToBrl = usdData.rates?.BRL || 5.12
      const eurToBrl = usdToBrl / (usdData.rates?.EUR || 0.85)

      cotacoes.usd.value = `R$ ${usdToBrl.toFixed(2)}`
      cotacoes.eur.value = `R$ ${eurToBrl.toFixed(2)}`
    }

    // Processar Bitcoin
    if (btcResponse.status === "fulfilled" && btcResponse.value.ok) {
      const btcData = await btcResponse.value.json()
      const btcPrice = btcData.bitcoin?.brl
      const btcChange = btcData.bitcoin?.brl_24h_change

      if (btcPrice) {
        cotacoes.btc.value = `R$ ${btcPrice.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

        if (btcChange !== undefined) {
          cotacoes.btc.change = `${btcChange >= 0 ? "+" : ""}${btcChange.toFixed(1)}%`
          cotacoes.btc.trend = btcChange >= 0 ? "up" : "down"
        }
      }
    }

    // Processar Ibovespa
    if (ibovespaResponse.status === "fulfilled" && ibovespaResponse.value.ok) {
      const ibovespaData = await ibovespaResponse.value.json()
      const currentPrice = ibovespaData.chart?.result?.[0]?.meta?.regularMarketPrice
      if (currentPrice) {
        cotacoes.ibovespa.value = Math.round(currentPrice).toLocaleString("pt-BR")
      }
    }

    return cotacoes
  } catch (error) {
    console.error("Erro ao buscar cotações:", error)

    // Dados fallback
    return {
      usd: { value: "R$ 5,12", change: "+0.8%", trend: "up" },
      eur: { value: "R$ 5,58", change: "-0.3%", trend: "down" },
      btc: { value: "R$ 285.420", change: "+2.1%", trend: "up" },
      ibovespa: { value: "126.847", change: "+1.2%", trend: "up" },
      lastUpdate: new Date().toISOString(),
      error: "Dados podem estar desatualizados",
    }
  }
}

// Função para atualizar cache automaticamente
async function updateCache() {
  try {
    const cotacoes = await fetchCotacoes()
    cache = {
      data: cotacoes,
      timestamp: Date.now(),
    }
    console.log("Cache de cotações atualizado automaticamente")
  } catch (error) {
    console.error("Erro ao atualizar cache automaticamente:", error)
  }
}

// Inicializar cache e configurar atualização automática
if (!cache) {
  updateCache()
  // Atualizar a cada 30 minutos
  setInterval(updateCache, CACHE_TTL)
}

export async function GET() {
  try {
    // Se não há cache ou está expirado, buscar dados
    if (!cache || Date.now() - cache.timestamp > CACHE_TTL) {
      await updateCache()
    }

    // Remover informação de última atualização
    const responseData = { ...cache?.data }
    delete responseData.lastUpdate

    return NextResponse.json(
      responseData || {
        usd: { value: "R$ 5,12", change: "+0.8%", trend: "up" },
        eur: { value: "R$ 5,58", change: "-0.3%", trend: "down" },
        btc: { value: "R$ 285.420", change: "+2.1%", trend: "up" },
        ibovespa: { value: "126.847", change: "+1.2%", trend: "up" },
        error: "Dados indisponíveis",
      },
    )
  } catch (error) {
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
