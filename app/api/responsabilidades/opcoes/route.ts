import { NextResponse } from "next/server"
import { getSession, resolveTecnicoRarotecId } from "@/lib/auth"
import { sql } from "@/lib/db"
import { isGestor } from "@/lib/permissions"

export async function GET() {
  const user = await getSession()
  if (!user) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

  const gestor = isGestor(user.nome, user.cargo)
  const tecnicoId = gestor ? null : await resolveTecnicoRarotecId(user)
  if (!gestor && !tecnicoId) {
    return NextResponse.json({ clientes: [], tecnicos: [], modulos: [], orgaos: [], clientes_modulos: [], municipios: [] })
  }

  const [clientes, tecnicos, modulos, orgaos, clientesModulos, municipios] = await Promise.all([
    sql`
      SELECT DISTINCT c.id, COALESCE(c.nome_fantasia, c.razao_social) AS nome,
             c.nome_fantasia, c.razao_social, c.cidade, c.estado
      FROM clientes c
      LEFT JOIN responsaveis_modulos r ON r.cliente_id = c.id AND r.ativo = true
      WHERE c.ativo = true
        AND (${gestor}::boolean OR r.tecnico_rarotec_id = ${tecnicoId})
      ORDER BY c.cidade NULLS LAST, nome
    `,
    sql`
      SELECT id, nome, email
      FROM tecnicos_rarotec
      WHERE ativo = true
        AND (${gestor}::boolean OR id = ${tecnicoId})
      ORDER BY nome
    `,
    sql`
      SELECT DISTINCT modulo
      FROM (
        SELECT cm.modulo
        FROM clientes_modulos cm
        LEFT JOIN responsaveis_modulos r
          ON r.cliente_id = cm.cliente_id AND LOWER(r.modulo) = LOWER(cm.modulo) AND r.ativo = true
        WHERE ${gestor}::boolean OR r.tecnico_rarotec_id = ${tecnicoId}
        UNION ALL
        SELECT om.modulo
        FROM orgaos_modulos om
        LEFT JOIN responsaveis_modulos r
          ON r.orgao_id = om.orgao_id AND LOWER(r.modulo) = LOWER(om.modulo) AND r.ativo = true
        WHERE ${gestor}::boolean OR r.tecnico_rarotec_id = ${tecnicoId}
      ) lista
      WHERE modulo IS NOT NULL AND TRIM(modulo) <> ''
      ORDER BY modulo
    `,
    sql`
      SELECT DISTINCT o.id, o.cliente_id, o.nome, o.tipo
      FROM orgaos_cliente o
      LEFT JOIN responsaveis_modulos r ON r.cliente_id = o.cliente_id AND r.ativo = true
      WHERE o.ativo = true
        AND (${gestor}::boolean OR r.tecnico_rarotec_id = ${tecnicoId})
      ORDER BY o.nome
    `,
    sql`
      SELECT DISTINCT cm.cliente_id, cm.modulo
      FROM clientes_modulos cm
      JOIN clientes c ON c.id = cm.cliente_id AND c.ativo = true
      LEFT JOIN responsaveis_modulos r
        ON r.cliente_id = cm.cliente_id AND LOWER(r.modulo) = LOWER(cm.modulo) AND r.ativo = true
      WHERE ${gestor}::boolean OR r.tecnico_rarotec_id = ${tecnicoId}
      ORDER BY cm.cliente_id, cm.modulo
    `,
    sql`
      SELECT DISTINCT c.cidade, c.estado
      FROM clientes c
      LEFT JOIN responsaveis_modulos r ON r.cliente_id = c.id AND r.ativo = true
      WHERE c.ativo = true
        AND c.cidade IS NOT NULL AND TRIM(c.cidade) <> ''
        AND (${gestor}::boolean OR r.tecnico_rarotec_id = ${tecnicoId})
      ORDER BY c.cidade
    `,
  ])

  return NextResponse.json({ clientes, tecnicos, modulos, orgaos, clientes_modulos: clientesModulos, municipios })
}
