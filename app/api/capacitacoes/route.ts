import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import { normalizarPessoas, normalizarSetores } from "@/lib/capacitacao"

// GET /api/capacitacoes - lista todos os treinamentos (visivel a qualquer usuario logado)
export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const rows = await sql`
      SELECT * FROM capacitacoes
      ORDER BY data_treinamento DESC NULLS LAST, id DESC
    `
    return NextResponse.json(rows)
  } catch (error) {
    console.error("Error fetching capacitacoes:", error)
    return NextResponse.json({ error: "Erro ao buscar treinamentos" }, { status: 500 })
  }
}

// POST /api/capacitacoes - apenas gestor cria
export async function POST(request: Request) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Apenas gestores podem criar treinamentos" }, { status: 403 })
  }

  try {
    const data = await request.json()
    const titulo = String(data.titulo ?? "").trim()
    const dataTreinamento = String(data.data_treinamento ?? "").trim()
    const instrutores = normalizarPessoas(data.instrutores)
    const participantes = normalizarPessoas(data.participantes)
    const setores = normalizarSetores(data.setores)

    // Validacao dos campos obrigatorios (asterisco).
    if (!titulo) return NextResponse.json({ error: "Titulo do treinamento e obrigatorio" }, { status: 400 })
    if (!dataTreinamento) return NextResponse.json({ error: "Data do treinamento e obrigatoria" }, { status: 400 })
    if (instrutores.length === 0)
      return NextResponse.json({ error: "Informe ao menos um instrutor" }, { status: 400 })
    if (setores.length === 0)
      return NextResponse.json({ error: "Informe ao menos um setor/departamento" }, { status: 400 })

    const result = await sql`
      INSERT INTO capacitacoes (
        titulo, data_treinamento, instrutores, participantes, setores,
        motivo, observacoes, video_url, created_by, created_by_nome
      ) VALUES (
        ${titulo}, ${dataTreinamento}, ${JSON.stringify(instrutores)}::jsonb,
        ${JSON.stringify(participantes)}::jsonb, ${setores},
        ${data.motivo?.trim() || null}, ${data.observacoes?.trim() || null},
        ${data.video_url?.trim() || null}, ${user.id}, ${user.nome}
      )
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Error creating capacitacao:", error)
    return NextResponse.json({ error: "Erro ao criar treinamento" }, { status: 500 })
  }
}
