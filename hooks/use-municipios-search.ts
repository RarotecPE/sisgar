"use client"

import { useState, useEffect } from "react"

interface Municipio {
  id: number
  nome: string
  uf: string
  nomeCompleto: string
}

interface UseMunicipiosSearchOptions {
  search: string
  uf?: string
  limit?: number
  minChars?: number
}

export function useMunicipiosSearch({
  search,
  uf,
  limit = 50,
  minChars = 2
}: UseMunicipiosSearchOptions) {
  const [municipios, setMunicipios] = useState<Municipio[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (search.trim().length < minChars) {
      setMunicipios([])
      return
    }

    const controller = new AbortController()
    
    const fetchMunicipios = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        const params = new URLSearchParams({
          search,
          limit: limit.toString(),
        })
        
        if (uf) {
          params.set("uf", uf)
        }
        
        const res = await fetch(`/api/municipios-ibge?${params}`, {
          signal: controller.signal
        })
        
        if (!res.ok) {
          throw new Error("Erro ao buscar municipios")
        }
        
        const data = await res.json()
        setMunicipios(data)
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err)
          setMunicipios([])
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce de 300ms
    const timeoutId = setTimeout(fetchMunicipios, 300)

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
  }, [search, uf, limit, minChars])

  return {
    municipios,
    isLoading,
    error
  }
}
