import { NextResponse } from "next/server"
import { getSession, mapRoleToCargo } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import { fetchAuthorizedNexusUsers } from "@/lib/nexus-sync"
import { sql } from "@/lib/db"

export async function GET() {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Acesso restrito a gestores." }, { status: 403 })
  }

  try {
    const nexusUsers = await fetchAuthorizedNexusUsers()

    const tecnicosExistentes = await sql`
      SELECT id, nome, email, nexus_email 
      FROM tecnicos_rarotec
    `

    const existingByNexusEmail = new Map<string, number>()
    const existingByEmail = new Map<string, number>()
    const existingByNome = new Map<string, number>()

    for (const tec of tecnicosExistentes) {
      if (tec.nexus_email) existingByNexusEmail.set(String(tec.nexus_email).trim().toLowerCase(), tec.id)
      if (tec.email) existingByEmail.set(String(tec.email).trim().toLowerCase(), tec.id)
      if (tec.nome) existingByNome.set(String(tec.nome).trim().toLowerCase(), tec.id)
    }

    const candidatos = nexusUsers.map((nu) => {
      const emailNorm = nu.email.trim().toLowerCase()
      const nomeNorm = nu.nome.trim().toLowerCase()
      const tecnicoId =
        existingByNexusEmail.get(emailNorm) ||
        existingByEmail.get(emailNorm) ||
        existingByNome.get(nomeNorm) ||
        null

      const cargoMapeado = mapRoleToCargo({
        chave: nu.role_chave || "",
        nome: nu.role_nome || "",
      })

      return {
        nexus_id: nu.id,
        nome: nu.nome,
        email: nu.email,
        nexus_email: nu.email,
        cpf: nu.cpf || null,
        telefone: nu.telefone || null,
        avatar_url: nu.avatar_url || null,
        cargo: cargoMapeado,
        role_nome: nu.role_nome || null,
        ja_cadastrado: Boolean(tecnicoId),
        tecnico_id: tecnicoId,
      }
    })

    return NextResponse.json(candidatos)
  } catch (error) {
    console.error("Erro ao buscar candidatos a técnico no Nexus:", error)
    return NextResponse.json(
      { error: "Erro ao buscar usuários no RaroNexus" },
      { status: 500 }
    )
  }
}

