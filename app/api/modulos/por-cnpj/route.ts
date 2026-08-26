import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"

// GET - Buscar módulos vinculados a um ou mais CNPJs
// Busca tanto em clientes_modulos quanto em orgaos_modulos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const cnpjsParam = searchParams.get("cnpjs")
    
    if (!cnpjsParam) {
      return NextResponse.json({ error: "CNPJs não informados" }, { status: 400 })
    }
    
    const cnpjs = cnpjsParam.split(",").map(c => c.trim()).filter(Boolean)
    
    if (cnpjs.length === 0) {
      return NextResponse.json({ modulos: [] })
    }
    
    // Buscar módulos de clientes pelos CNPJs
    const modulosClientes = await sql`
      SELECT DISTINCT cm.modulo
      FROM clientes_modulos cm
      INNER JOIN clientes c ON c.id = cm.cliente_id
      WHERE c.cnpj = ANY(${cnpjs})
    `
    
    // Buscar módulos de órgãos pelos CNPJs
    const modulosOrgaos = await sql`
      SELECT DISTINCT om.modulo
      FROM orgaos_modulos om
      INNER JOIN orgaos_cliente oc ON oc.id = om.orgao_id
      WHERE oc.cnpj = ANY(${cnpjs})
    `
    
    // Combinar e remover duplicatas
    const todosModulos = [
      ...modulosClientes.map(m => m.modulo),
      ...modulosOrgaos.map(m => m.modulo)
    ]
    
    const modulosUnicos = [...new Set(todosModulos)]
    
    return NextResponse.json({ modulos: modulosUnicos })
  } catch (error) {
    console.error("Erro ao buscar módulos por CNPJ:", error)
    return NextResponse.json({ error: "Erro ao buscar módulos" }, { status: 500 })
  }
}
