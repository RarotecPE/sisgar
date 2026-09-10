import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { sql } from "@/lib/db"
import { isGestor } from "@/lib/permissions"

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Apenas a gestão pode configurar o checklist" }, { status: 403 })
  }

  const itens = await sql`
    SELECT *
    FROM checklist_modelos_itens
    ORDER BY ativo DESC, COALESCE(modulo, ''), ordem, id
  `
  return NextResponse.json(itens)
}

export async function POST(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Apenas a gestão pode configurar o checklist" }, { status: 403 })
  }

  const body = await request.json()
  const titulo = String(body.titulo || "").trim()
  const descricao = String(body.descricao || "").trim() || null
  const modulo = String(body.modulo || "").trim() || null
  const ordem = Number.isInteger(Number(body.ordem)) ? Number(body.ordem) : 0

  if (!titulo) return NextResponse.json({ error: "Informe o item do checklist" }, { status: 400 })

  const result = await sql`
    INSERT INTO checklist_modelos_itens (
      titulo, descricao, modulo, ordem, obrigatorio,
      exige_observacao_negativa, ativo, created_by, updated_by
    ) VALUES (
      ${titulo}, ${descricao}, ${modulo}, ${ordem},
      ${body.obrigatorio !== false}, ${body.exige_observacao_negativa !== false},
      ${body.ativo !== false}, ${user.id}, ${user.id}
    )
    RETURNING *
  `
  return NextResponse.json(result[0], { status: 201 })
}

export async function PUT(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Apenas a gestão pode configurar o checklist" }, { status: 403 })
  }

  const body = await request.json()
  const id = Number(body.id)
  const titulo = String(body.titulo || "").trim()
  if (!Number.isInteger(id) || !titulo) {
    return NextResponse.json({ error: "Item inválido" }, { status: 400 })
  }

  const result = await sql`
    UPDATE checklist_modelos_itens
    SET
      titulo = ${titulo},
      descricao = ${String(body.descricao || "").trim() || null},
      modulo = ${String(body.modulo || "").trim() || null},
      ordem = ${Number.isInteger(Number(body.ordem)) ? Number(body.ordem) : 0},
      obrigatorio = ${body.obrigatorio !== false},
      exige_observacao_negativa = ${body.exige_observacao_negativa !== false},
      ativo = ${body.ativo !== false},
      updated_by = ${user.id},
      updated_at = NOW()
    WHERE id = ${id}
    RETURNING *
  `
  if (!result.length) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 })
  return NextResponse.json(result[0])
}

export async function DELETE(request: NextRequest) {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Apenas a gestão pode configurar o checklist" }, { status: 403 })
  }

  const id = Number(request.nextUrl.searchParams.get("id"))
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Item inválido" }, { status: 400 })

  await sql`
    UPDATE checklist_modelos_itens
    SET ativo = false, updated_by = ${user.id}, updated_at = NOW()
    WHERE id = ${id}
  `
  return NextResponse.json({ success: true })
}
