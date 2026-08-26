import { sql } from "@/lib/db"
import { NextResponse } from "next/server"


export async function GET() {
  try {
    const departamentos = await sql`
      SELECT * FROM departamentos ORDER BY nome ASC
    `
    return NextResponse.json(departamentos)
  } catch (error) {
    console.error("Erro ao buscar departamentos:", error)
    return NextResponse.json({ error: "Erro ao buscar departamentos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { nome } = await request.json()
    
    const result = await sql`
      INSERT INTO departamentos (nome)
      VALUES (${nome})
      ON CONFLICT (nome) DO NOTHING
      RETURNING *
    `
    
    if (result.length === 0) {
      const existing = await sql`SELECT * FROM departamentos WHERE nome = ${nome}`
      return NextResponse.json(existing[0])
    }
    
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar departamento:", error)
    return NextResponse.json({ error: "Erro ao criar departamento" }, { status: 500 })
  }
}
