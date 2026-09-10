import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import { isOuveAtivo } from "@/lib/app-config"

// GET /api/dashboard/ouve-abertos -> chamados (manifestacoes) em aberto para o dashboard da gestao.
// "Em aberto" = status 'aberta' ou 'em_analise'. Somente gestores recebem a lista;
// tecnicos recebem total 0 (o acompanhamento e responsabilidade da gestao).
export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })

  if (!(await isOuveAtivo())) {
    return NextResponse.json({ ativo: false, total: 0, itens: [] })
  }

  const userIsGestor = isGestor(user.nome, user.cargo)
  if (!userIsGestor) {
    return NextResponse.json({ ativo: true, total: 0, itens: [] })
  }

  try {
    const rows = await sql`
      SELECT id, codigo, natureza, categoria, status, tipo_sigilo, created_at
      FROM ouve_manifestacoes
      WHERE status IN ('aberta', 'em_analise')
      ORDER BY created_at DESC
    `
    // Nao expomos autor aqui; o dashboard mostra apenas codigo/natureza/status/data.
    const itens = rows.map((m: any) => ({
      id: m.id,
      codigo: m.codigo,
      natureza: m.natureza,
      categoria: m.categoria,
      status: m.status,
      created_at: m.created_at,
    }))
    return NextResponse.json({ ativo: true, total: itens.length, itens })
  } catch (error) {
    console.error("Error fetching ouve abertos:", error)
    return NextResponse.json({ error: "Erro ao buscar chamados" }, { status: 500 })
  }
}
