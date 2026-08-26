import { NextRequest, NextResponse } from "next/server"

// API do IBGE para Estados e Municípios
const IBGE_BASE_URL = "https://servicodados.ibge.gov.br/api/v1/localidades"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tipo = searchParams.get("tipo") // "estados" ou "municipios"
    const uf = searchParams.get("uf") // código do estado para buscar municípios
    
    if (tipo === "estados") {
      const response = await fetch(`${IBGE_BASE_URL}/estados?orderBy=nome`)
      const estados = await response.json()
      
      return NextResponse.json(
        estados.map((e: { id: number; sigla: string; nome: string }) => ({
          id: e.id,
          sigla: e.sigla,
          nome: e.nome,
        }))
      )
    }
    
    if (tipo === "municipios" && uf) {
      const response = await fetch(`${IBGE_BASE_URL}/estados/${uf}/municipios?orderBy=nome`)
      const municipios = await response.json()
      
      return NextResponse.json(
        municipios.map((m: { id: number; nome: string }) => ({
          id: m.id,
          nome: m.nome,
        }))
      )
    }
    
    return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao buscar dados do IBGE:", error)
    return NextResponse.json({ error: "Erro ao buscar dados do IBGE" }, { status: 500 })
  }
}
