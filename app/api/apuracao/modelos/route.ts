import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET /api/apuracao/modelos?cliente_id=
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clienteId = searchParams.get("cliente_id")
    const municipio = searchParams.get("municipio")

    let modelos = clienteId
      ? await sql`
          SELECT m.*, c.nome_fantasia AS cliente_nome, c.cidade AS cliente_cidade,
                 c.estado AS cliente_estado, c.cnpj AS cliente_cnpj
          FROM apuracao_modelos m
          LEFT JOIN clientes c ON c.id = m.cliente_id
          WHERE m.cliente_id = ${parseInt(clienteId)}
             OR m.cliente_ids @> ${JSON.stringify([parseInt(clienteId)])}::jsonb
          ORDER BY m.ativo DESC, m.nome ASC
        `
      : municipio
        ? await sql`
          SELECT m.*, c.nome_fantasia AS cliente_nome, c.cidade AS cliente_cidade,
                 c.estado AS cliente_estado, c.cnpj AS cliente_cnpj
          FROM apuracao_modelos m
          LEFT JOIN clientes c ON c.id = m.cliente_id
          WHERE m.municipio = ${municipio}
          ORDER BY m.ativo DESC, m.nome ASC
        `
        : await sql`
          SELECT m.*, c.nome_fantasia AS cliente_nome, c.cidade AS cliente_cidade,
                 c.estado AS cliente_estado, c.cnpj AS cliente_cnpj
          FROM apuracao_modelos m
          LEFT JOIN clientes c ON c.id = m.cliente_id
          ORDER BY m.ativo DESC, c.nome_fantasia ASC, m.nome ASC
        `

    return NextResponse.json(modelos)
  } catch (error) {
    console.error("Erro ao buscar modelos de apuracao:", error)
    return NextResponse.json({ error: "Erro ao buscar modelos" }, { status: 500 })
  }
}

// POST /api/apuracao/modelos
export async function POST(request: NextRequest) {
  try {
    const d = await request.json()
    // cliente_ids: prioriza o array; cai para [cliente_id] por compatibilidade
    const clienteIds: number[] =
      Array.isArray(d.cliente_ids) && d.cliente_ids.length > 0
        ? d.cliente_ids.map((x: any) => Number(x))
        : d.cliente_id
          ? [Number(d.cliente_id)]
          : []
    const clientePrincipal = clienteIds[0] || null
    if (!clientePrincipal || !d.nome) {
      return NextResponse.json(
        { error: "selecione ao menos um cliente e informe o nome" },
        { status: 400 },
      )
    }

    const result = await sql`
      INSERT INTO apuracao_modelos (
        cliente_id, cliente_ids, municipio, contrato_id, nome, sigla_orgao, numero_contrato_texto,
        destinatario_nome, destinatario_cargo, itens, itens_servico, modo_valor, valor_global,
        texto_padrao, observacoes_padrao, modalidade_remoto, modalidade_presencial,
        ultimo_numero, ativo, emissao_automatica
      ) VALUES (
        ${clientePrincipal}, ${JSON.stringify(clienteIds)}, ${d.municipio || null},
        ${d.contrato_id || null}, ${d.nome}, ${d.sigla_orgao || null},
        ${d.numero_contrato_texto || null}, ${d.destinatario_nome || null},
        ${d.destinatario_cargo || null}, ${JSON.stringify(d.itens || [])},
        ${JSON.stringify(d.itens_servico || [])},
        ${d.modo_valor || "global"}, ${d.valor_global ?? null},
        ${d.texto_padrao || null}, ${d.observacoes_padrao || null},
        ${d.modalidade_remoto ?? true}, ${d.modalidade_presencial ?? false},
        ${d.ultimo_numero || 0}, ${d.ativo ?? true}, ${d.emissao_automatica ?? false}
      )
      RETURNING *
    `
    return NextResponse.json(result[0], { status: 201 })
  } catch (error) {
    console.error("Erro ao criar modelo de apuracao:", error)
    return NextResponse.json({ error: "Erro ao criar modelo" }, { status: 500 })
  }
}
