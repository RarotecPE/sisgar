import { NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function GET() {
  return POST()
}

export async function POST() {
  return NextResponse.json({
    message: "A autenticação e inicialização de usuários foram migradas integralmente para o RaroNexus.",
  })
}
