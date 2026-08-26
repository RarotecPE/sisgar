import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"

// Retorna todos os vinculos fixos (tecnico <-> cliente) usados para o relatorio semanal unico.
export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const pares = await sql`
      SELECT tecnico_rarotec_id, cliente_id FROM tecnico_clientes_fixos
    `
    return NextResponse.json(pares)
  } catch (error) {
    console.error("Error fetching tecnico_clientes_fixos:", error)
    return NextResponse.json({ error: "Erro ao buscar vinculos fixos" }, { status: 500 })
  }
}
