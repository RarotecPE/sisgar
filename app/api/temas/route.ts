import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const modulo = searchParams.get("modulo")
    
    if (modulo) {
      const temas = await sql`
        SELECT * FROM temas_relatorio 
        WHERE modulo = ${modulo} AND ativo = true
        ORDER BY nome ASC
      `
      return NextResponse.json(temas)
    }
    
    const temas = await sql`
      SELECT * FROM temas_relatorio WHERE ativo = true ORDER BY modulo, nome ASC
    `
    return NextResponse.json(temas)
  } catch (error) {
    console.error("Erro ao buscar temas:", error)
    return NextResponse.json({ error: "Erro ao buscar temas" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    const result = await sql`
      INSERT INTO temas_relatorio (nome, modulo, descricao)
      VALUES (${data.nome}, ${data.modulo || null}, ${data.descricao || null})
      RETURNING *
    `
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar tema:", error)
    return NextResponse.json({ error: "Erro ao criar tema" }, { status: 500 })
  }
}
