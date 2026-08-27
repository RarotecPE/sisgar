import { NextRequest, NextResponse } from "next/server"
import { clearSessionCookies, getGlobalSessionToken, revokeGlobalSession } from "@/lib/auth"

export async function POST(request: NextRequest) {
  const token = getGlobalSessionToken(request)
  if (token) await revokeGlobalSession(token)

  const accept = request.headers.get("accept") || ""
  const response = accept.includes("application/json")
    ? NextResponse.json({ ok: true })
    : NextResponse.redirect(new URL("/login", request.url), { status: 303 })
  clearSessionCookies(response)
  return response
}
