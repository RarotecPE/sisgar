import { NextRequest, NextResponse } from "next/server"

interface MunicipioIBGE {
  id: number
  nome: string
  microrregiao: {
    mesorregiao: {
      UF: {
        sigla: string
        nome: string
      }
    }
  }
}

interface Municipio {
  id: number
  nome: string
  uf: string
  nomeCompleto: string
}

// Cache em memoria para evitar chamadas repetidas
let cachedMunicipios: Municipio[] | null = null
let cacheTimestamp: number | null = null
const CACHE_DURATION = 1000 * 60 * 60 * 24 // 24 horas

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search")?.toLowerCase() || ""
    const uf = searchParams.get("uf")?.toUpperCase() || ""
    const limit = parseInt(searchParams.get("limit") || "50")

    // Carrega cache se necessario
    if (!cachedMunicipios || !cacheTimestamp || Date.now() - cacheTimestamp >= CACHE_DURATION) {
      console.log("[IBGE API] Fetching municipios from IBGE...")
      
      const res = await fetch(
        "https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome",
        {
          headers: {
            "Accept": "application/json",
          },
          next: { revalidate: 86400 } // Cache por 24h no Next.js
        }
      )

      if (!res.ok) {
        console.error("[IBGE API] Error:", res.status, res.statusText)
        return NextResponse.json({ error: "Erro ao buscar municipios do IBGE" }, { status: 500 })
      }

      const data: MunicipioIBGE[] = await res.json()
      console.log("[IBGE API] Received", data.length, "municipios")

      cachedMunicipios = data.map(m => ({
        id: m.id,
        nome: m.nome,
        uf: m.microrregiao?.mesorregiao?.UF?.sigla || "",
        nomeCompleto: m.microrregiao?.mesorregiao?.UF?.sigla 
          ? `${m.nome}/${m.microrregiao.mesorregiao.UF.sigla}`
          : m.nome
      })).sort((a, b) => a.nomeCompleto.localeCompare(b.nomeCompleto))

      cacheTimestamp = Date.now()
    }

    // Aplica filtros
    let result = cachedMunicipios

    if (uf) {
      result = result.filter(m => m.uf === uf)
    }

    if (search && search.length >= 2) {
      result = result.filter(m => 
        m.nome.toLowerCase().includes(search) ||
        m.nomeCompleto.toLowerCase().includes(search)
      )
    }

    // Aplica limite
    result = result.slice(0, limit)

    return NextResponse.json(result)
  } catch (error) {
    console.error("[IBGE API] Error:", error)
    return NextResponse.json({ error: "Erro ao buscar municipios" }, { status: 500 })
  }
}
