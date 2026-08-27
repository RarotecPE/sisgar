import { NextResponse } from "next/server"

export async function POST() {
  return NextResponse.json(
    { error: "Senhas são gerenciadas pelo RaroNexus." },
    { status: 410 }
  )
}
