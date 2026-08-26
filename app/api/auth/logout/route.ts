import { NextResponse } from "next/server"
import { destroySession } from "@/lib/auth"

export async function POST(request: Request) {
  await destroySession()
  
  // Usar a URL da requisição para construir o redirect correto
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`
  
  // Usar status 303 (See Other) para forçar o navegador a usar GET no redirect
  return NextResponse.redirect(new URL("/login", baseUrl), { status: 303 })
}
