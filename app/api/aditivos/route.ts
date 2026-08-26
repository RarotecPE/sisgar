import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const contratoId = searchParams.get("contrato_id")
    
    if (!contratoId) {
      return NextResponse.json({ error: "contrato_id é obrigatório" }, { status: 400 })
    }
    
    const aditivos = await sql`
      SELECT * FROM aditivos_contrato 
      WHERE contrato_id = ${contratoId}
      ORDER BY data_aditivo DESC
    `
    
    return NextResponse.json(aditivos)
  } catch (error) {
    console.error("Erro ao buscar aditivos:", error)
    return NextResponse.json({ error: "Erro ao buscar aditivos" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    const result = await sql`
      INSERT INTO aditivos_contrato (
        contrato_id, numero_aditivo, data_aditivo, descricao, valor_adicional, arquivo_url
      ) VALUES (
        ${data.contrato_id}, ${data.numero_aditivo}, ${data.data_aditivo},
        ${data.descricao || null}, ${data.valor_adicional || null}, ${data.arquivo_url || null}
      )
      RETURNING *
    `
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar aditivo:", error)
    return NextResponse.json({ error: "Erro ao criar aditivo" }, { status: 500 })
  }
}
