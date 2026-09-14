import { NextRequest, NextResponse } from "next/server"
import { clearSessionCookies, getSessionFromRequest } from "@/lib/auth"
import { getMenuItems } from "@/lib/permissions"

export async function GET(request: NextRequest) {
  const user = await getSessionFromRequest(request)

  if (!user) {
    const response = NextResponse.json({ authenticated: false, user: null, permissions: {} })
    clearSessionCookies(response)
    response.headers.set("Cache-Control", "no-store, max-age=0")
    return response
  }

  const response = NextResponse.json({
    authenticated: true,
    role: user.cargo,
    label: user.cargo || "Usuário",
    user: {
      id: user.id,
      nexus_user_id: user.nexus_user_id ?? null,
      nome: user.nome,
      email: user.email,
      avatar_url: user.avatar_url ?? null,
      cargo: user.cargo,
      cargos: user.cargo ? [user.cargo] : [],
      apuracao_mensal: user.apuracao_mensal ?? false,
    },
    permissions: getMenuItems(user.nome, user.cargo, user.apuracao_mensal),
  })
  response.headers.set("Cache-Control", "no-store, max-age=0")
  return response
}
