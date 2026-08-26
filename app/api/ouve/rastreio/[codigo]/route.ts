import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import { isOuveAtivo } from "@/lib/app-config"

// GET /api/ouve/rastreio/[codigo] -> acompanhamento PUBLICO por codigo.
// Regras de identificacao na area externa:
// - aberta: mostra identificacao normalmente.
// - sigilosa: esconde a identificacao, EXCETO se houver um gestor logado.
// - anonima: nunca ha identificacao.
export async function GET(request: Request, { params }: { params: Promise<{ codigo: string }> }) {
  if (!(await isOuveAtivo())) {
    return NextResponse.json({ error: "Modulo inativo" }, { status: 403 })
  }

  const { codigo } = await params
  const cod = decodeURIComponent(codigo).trim().toUpperCase()

  try {
    const rows = await sql`SELECT * FROM ouve_manifestacoes WHERE UPPER(codigo) = ${cod} LIMIT 1`
    if (rows.length === 0) {
      return NextResponse.json({ error: "Codigo nao encontrado" }, { status: 404 })
    }
    const m = { ...rows[0] }

    // Um gestor logado pode ver a identificacao da sigilosa mesmo na area externa
    const user = await getSession()
    const gestorLogado = user ? isGestor(user.nome, user.cargo) : false

    if (m.tipo_sigilo === "anonima") {
      m.autor_id = null
      m.autor_nome = null
      m.autor_email = null
      m.autor_cargo = null
    } else if (m.tipo_sigilo === "identificavel_sigilosa" && !gestorLogado) {
      m.autor_id = null
      m.autor_nome = null
      m.autor_email = null
      m.autor_cargo = null
    }

    const respostas = await sql`
      SELECT id, autor_nome, mensagem, created_at
      FROM ouve_respostas WHERE manifestacao_id = ${m.id} ORDER BY created_at
    `
    // Na area externa nao expomos os anexos por download direto (privacidade);
    // apenas informamos a quantidade.
    const anexosCount = await sql`
      SELECT COUNT(*)::int AS total FROM ouve_anexos WHERE manifestacao_id = ${m.id}
    `

    return NextResponse.json({
      codigo: m.codigo,
      tipo_sigilo: m.tipo_sigilo,
      natureza: m.natureza,
      categoria: m.categoria,
      tipo_vida: m.tipo_vida,
      mensagem: m.mensagem,
      setor: m.setor,
      status: m.status,
      created_at: m.created_at,
      autor_nome: m.autor_nome,
      autor_cargo: m.autor_cargo,
      respostas,
      anexos_total: anexosCount[0]?.total ?? 0,
    })
  } catch (error) {
    console.error("Error rastreio ouve:", error)
    return NextResponse.json({ error: "Erro ao consultar" }, { status: 500 })
  }
}
