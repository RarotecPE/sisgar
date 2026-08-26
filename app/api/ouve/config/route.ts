import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import { getConfig, setConfig } from "@/lib/app-config"

// GET /api/ouve/config -> { ativo: boolean }
// Publico: usado pelo botao de login e pela area externa.
export async function GET() {
  const ativo = (await getConfig("ouve_ativo")) === "true"
  return NextResponse.json({ ativo })
}

// PUT /api/ouve/config { ativo: boolean } -> apenas gestores
export async function PUT(request: Request) {
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }
  if (!isGestor(user.nome, user.cargo)) {
    return NextResponse.json({ error: "Apenas gestores podem alterar esta configuracao" }, { status: 403 })
  }
  const { ativo } = await request.json()
  await setConfig("ouve_ativo", ativo ? "true" : "false", user.id)
  return NextResponse.json({ ativo: !!ativo })
}
