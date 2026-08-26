"use client"

import useSWR from "swr"

interface Municipio {
  id: number
  nome: string
  uf: string
  nomeCompleto: string // "Cidade/UF"
}

const fetcher = async (url: string): Promise<Municipio[]> => {
  const res = await fetch(url)
  
  if (!res.ok) {
    throw new Error("Erro ao buscar municipios")
  }
  
  return res.json()
}

export function useMunicipiosIBGE() {
  const { data, error, isLoading } = useSWR<Municipio[]>(
    "/api/municipios-ibge",
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 60 * 24, // 24 horas - cache longo pois municipios nao mudam
    }
  )

  return {
    municipios: data || [],
    isLoading,
    error
  }
}
