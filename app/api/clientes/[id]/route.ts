import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"


export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const cliente = await sql`SELECT * FROM clientes WHERE id = ${id}`
    
    if (cliente.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    
    return NextResponse.json(cliente[0])
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json({ error: "Erro ao buscar cliente" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const data = await request.json()
    
    const result = await sql`
      UPDATE clientes SET
        razao_social = ${data.razao_social},
        nome_fantasia = ${data.nome_fantasia || null},
        cnpj = ${data.cnpj || null},
        inscricao_estadual = ${data.inscricao_estadual || null},
        endereco = ${data.endereco || null},
        cidade = ${data.cidade || null},
        estado = ${data.estado || null},
        cep = ${data.cep || null},
        telefone = ${data.telefone || null},
        email = ${data.email || null},
        website = ${data.website || null},
        logo_url = ${data.logo_url || null},
        observacoes = ${data.observacoes || null},
        ativo = ${data.ativo !== false},
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `
    
    if (result.length === 0) {
      return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
    }
    
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ error: "Erro ao atualizar cliente" }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM clientes WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir cliente:", error)
    return NextResponse.json({ error: "Erro ao excluir cliente" }, { status: 500 })
  }
}
