import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"


export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await sql`DELETE FROM aditivos_contrato WHERE id = ${id}`
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir aditivo:", error)
    return NextResponse.json({ error: "Erro ao excluir aditivo" }, { status: 500 })
  }
}
