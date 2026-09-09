import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { syncTecnicosRarotecWithNexus } from "@/lib/nexus-sync"

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    await syncTecnicosRarotecWithNexus().catch((error) => {
      console.warn("raronexus_tecnicos_sync_failed", error)
    })

    const tecnicos = await sql`
      SELECT * FROM tecnicos_rarotec 
      ORDER BY nome ASC
    `
    return NextResponse.json(tecnicos)
  } catch (error) {
    console.error("Error fetching tecnicos:", error)
    return NextResponse.json({ error: "Erro ao buscar tecnicos" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const data = await request.json()
    const nexusEmail = typeof data.nexus_email === "string" && data.nexus_email.trim() ? data.nexus_email.trim().toLowerCase() : null

    if (nexusEmail) {
      const existing = await sql`
        SELECT id FROM tecnicos_rarotec 
        WHERE LOWER(nexus_email) = ${nexusEmail} 
        LIMIT 1
      `
      if (existing.length > 0) {
        return NextResponse.json({ error: "E-mail do Nexus já vinculado a outro técnico." }, { status: 400 })
      }
    }
    
    const primaryCargo = Array.isArray(data.cargos) && data.cargos.length > 0
      ? data.cargos[0]
      : (data.cargo || null)

    const result = await sql`
      INSERT INTO tecnicos_rarotec (
        nome, cpf, rg, data_nascimento, endereco, cidade, estado, cep,
        telefone, celular, email, nexus_email, cargo, cargos, data_admissao, setores, foto_url, ativo
      ) VALUES (
        ${data.nome},
        ${data.cpf || null},
        ${data.rg || null},
        ${data.data_nascimento || null},
        ${data.endereco || null},
        ${data.cidade || null},
        ${data.estado || null},
        ${data.cep || null},
        ${data.telefone || null},
        ${data.celular || null},
        ${data.email ? data.email.trim().toLowerCase() : null},
        ${nexusEmail},
        ${primaryCargo},
        ${data.cargos || []},
        ${data.data_admissao || null},
        ${data.setores || []},
        ${data.foto_url || null},
        ${data.ativo ?? true}
      )
      RETURNING *
    `

    const novoTecnico = result[0]

    // Persistir vinculos de clientes fixos (relatorio semanal unico)
    if (Array.isArray(data.clientes_fixos) && data.clientes_fixos.length > 0) {
      for (const clienteId of data.clientes_fixos) {
        await sql`
          INSERT INTO tecnico_clientes_fixos (tecnico_rarotec_id, cliente_id)
          VALUES (${novoTecnico.id}, ${clienteId})
          ON CONFLICT (tecnico_rarotec_id, cliente_id) DO NOTHING
        `
      }
    }

    return NextResponse.json(novoTecnico, { status: 201 })
  } catch (error) {
    console.error("Error creating tecnico:", error)
    return NextResponse.json({ error: "Erro ao criar tecnico" }, { status: 500 })
  }
}
