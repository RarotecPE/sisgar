import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// GET /api/setores - lista de setores distintos existentes nos tecnicos
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })

  try {
    const rows = await sql`
      SELECT DISTINCT TRIM(s) AS setor
      FROM tecnicos_rarotec, UNNEST(setores) AS s
      WHERE s IS NOT NULL AND TRIM(s) <> ''
      ORDER BY setor
    `
    return NextResponse.json(rows.map((r: { setor: string }) => r.setor))
  } catch (error) {
    console.error("Error fetching setores:", error)
    return NextResponse.json({ error: "Erro ao buscar setores" }, { status: 500 })
  }
}
