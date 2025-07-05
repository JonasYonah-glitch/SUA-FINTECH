"use client"

import { useState, useEffect } from "react"
import { MapPin, RefreshCw, AlertCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

// tipagem parcial das respostas para evitar uso de any
type IpApiCoResponse = { city: string; latitude: string | number; longitude: string | number }
type IpInfoResponse = { city: string; loc: string }

type LocationData = {
  city: string
  lat: number
  lon: number
}

type WeatherData = {
  current_weather: {
    temperature: number
    weathercode: number
  }
  daily: {
    temperature_2m_max: number[]
    temperature_2m_min: number[]
  }
}

const getWeatherIcon = (weatherCode: number) => {
  // Ícones modernos baseados nos códigos WMO Weather interpretation
  if (weatherCode === 0) return "🌞" // Clear sky
  if (weatherCode <= 3) return "🌤️" // Partly cloudy
  if (weatherCode <= 48) return "🌫️" // Fog
  if (weatherCode <= 67) return "🌧️" // Rain
  if (weatherCode <= 77) return "❄️" // Snow
  if (weatherCode <= 82) return "🌦️" // Rain showers
  if (weatherCode <= 86) return "🌨️" // Snow showers
  if (weatherCode <= 99) return "⛈️" // Thunderstorm
  return "🌈" // Default
}

const getWeatherDescription = (weatherCode: number) => {
  if (weatherCode === 0) return "Céu limpo"
  if (weatherCode <= 3) return "Parcialmente nublado"
  if (weatherCode <= 48) return "Neblina"
  if (weatherCode <= 67) return "Chuva"
  if (weatherCode <= 77) return "Neve"
  if (weatherCode <= 82) return "Chuva leve"
  if (weatherCode <= 86) return "Neve leve"
  if (weatherCode <= 99) return "Tempestade"
  return "Variável"
}

// Função para obter nome da cidade via coordenadas (geocoding reverso)
const getCityFromCoords = async (lat: number, lon: number): Promise<string> => {
  try {
    // Usando OpenStreetMap Nominatim (gratuito)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`,
      {
        headers: {
          "User-Agent": "SuaFintech/1.0",
        },
      },
    )

    if (response.ok) {
      const data = await response.json()
      if (data && data.address) {
        // Priorizar cidade, depois município, depois estado
        return (
          data.address.city ||
          data.address.town ||
          data.address.municipality ||
          data.address.state ||
          "Localização Atual"
        )
      }
    }
  } catch (error) {
    console.log("Erro ao buscar nome da cidade:", error)
  }

  return "Localização Atual"
}

export function WeatherCard() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [locationPermission, setLocationPermission] = useState<string>("prompt")

  const requestGeolocation = () => {
    if (!navigator.geolocation) {
      console.log("Geolocalização não suportada, usando IP")
      fetchLocationByIP()
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords

        // Buscar nome da cidade usando as coordenadas
        const cityName = await getCityFromCoords(latitude, longitude)

        setLocation({
          city: cityName,
          lat: latitude,
          lon: longitude,
        })
        fetchWeather(latitude, longitude)
        setLocationPermission("granted")
      },
      (error) => {
        console.log("Erro na geolocalização:", error.message)
        setLocationPermission("denied")
        fetchLocationByIP()
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutos
      },
    )
  }

  const fetchLocationByIP = async () => {
    // Tenta ipapi.co (HTTPS)
    try {
      const res = await fetch("https://ipapi.co/json/")
      if (res.ok) {
        const d = await res.json()
        if (d && d.city && d.latitude && d.longitude) {
          const loc = {
            city: d.city as string,
            lat: Number(d.latitude),
            lon: Number(d.longitude),
          }
          setLocation(loc)
          return { lat: loc.lat, lon: loc.lon }
        }
      }
      throw new Error("ipapi.co sem dados")
    } catch {
      /* continua para fallback */
    }

    // Fallback - ipinfo.io (HTTPS – precisa CORS, usa o endpoint público json)
    try {
      const res = await fetch("https://ipinfo.io/json?token=ee0cce2a0a5c9e") // token público demo limitado
      if (res.ok) {
        const d = await res.json()
        if (d && d.city && d.loc) {
          const [lat, lon] = (d.loc as string).split(",").map(Number)
          const loc = { city: d.city as string, lat, lon }
          setLocation(loc)
          return { lat, lon }
        }
      }
      throw new Error("ipinfo.io sem dados")
    } catch {
      /* continua para fallback fixo */
    }

    // Fallback fixo (São Paulo) para não quebrar o widget
    const fallback = { lat: -23.5505, lon: -46.6333 }
    setLocation({ city: "São Paulo", lat: fallback.lat, lon: fallback.lon })
    return fallback
  }

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min&timezone=auto`,
      )

      if (!response.ok) throw new Error("Erro ao buscar clima")

      const data = await response.json()
      setWeather(data)
    } catch (err) {
      console.error("Erro ao buscar clima:", err)
      throw err
    }
  }

  useEffect(() => {
    const loadWeatherData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Primeiro tenta geolocalização, depois IP
        requestGeolocation()
      } catch (err) {
        setError("Erro ao carregar dados do clima")
      } finally {
        setLoading(false)
      }
    }

    loadWeatherData()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-24">
            <RefreshCw className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !location || !weather) {
    return (
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-24 text-center">
            <div>
              <AlertCircle className="h-8 w-8 mx-auto mb-2" />
              <p className="text-sm">Erro ao carregar clima</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentTemp = Math.round(weather.current_weather.temperature)
  const maxTemp = Math.round(weather.daily.temperature_2m_max[0])
  const minTemp = Math.round(weather.daily.temperature_2m_min[0])
  const weatherCode = weather.current_weather.weathercode
  const icon = getWeatherIcon(weatherCode)
  const description = getWeatherDescription(weatherCode)

  return (
    <Card className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white border-0 shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center mb-3">
          <MapPin className="h-4 w-4 mr-2" />
          <h3 className="font-bold text-lg">{location.city}</h3>
        </div>

        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-4xl font-bold mb-1">{currentTemp}°C</div>
            <div className="text-blue-100 text-sm">{description}</div>
          </div>
          <div className="text-6xl">{icon}</div>
        </div>

        <div className="flex items-center justify-between text-sm text-blue-100">
          <span>Máx: {maxTemp}°C</span>
          <span>•</span>
          <span>Mín: {minTemp}°C</span>
        </div>
      </CardContent>
    </Card>
  )
}
