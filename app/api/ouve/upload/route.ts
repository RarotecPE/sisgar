import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { isOuveAtivo } from "@/lib/app-config"

// Upload dedicado ao OuveRarotec: aceita imagens, videos, PDF, Word, Excel, etc.
export async function POST(request: NextRequest) {
  if (!(await isOuveAtivo())) {
    return NextResponse.json({ error: "Modulo inativo" }, { status: 403 })
  }
  const user = await getSession()
  if (!user) {
    return NextResponse.json({ error: "Nao autorizado" }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/plain",
      "text/csv",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "image/heic",
      "video/mp4",
      "video/quicktime",
      "video/webm",
      "video/x-msvideo",
      "audio/mpeg",
      "audio/mp4",
      "audio/wav",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Tipo de arquivo nao permitido: ${file.type}` }, { status: 400 })
    }

    // Limite 100MB (videos podem ser maiores)
    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "Arquivo muito grande (max 100MB)" }, { status: 400 })
    }

    const timestamp = Date.now()
    const rand = Math.random().toString(36).slice(2, 8)
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const pathname = `ouve/${timestamp}-${rand}-${safeName}`

    const blob = await put(pathname, file, { access: "private" })

    return NextResponse.json({
      pathname: blob.pathname,
      nome: file.name,
      tipo: file.type,
      tamanho: file.size,
    })
  } catch (error) {
    console.error("[v0] Erro no upload ouve:", error)
    return NextResponse.json(
      { error: "Erro no upload: " + (error instanceof Error ? error.message : "Unknown error") },
      { status: 500 },
    )
  }
}
