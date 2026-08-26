import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] Upload API called")
    const formData = await request.formData()
    const file = formData.get("file") as File

    console.log("[v0] File received:", file?.name, file?.type, file?.size)

    if (!file) {
      return NextResponse.json({ error: "Nenhum arquivo enviado" }, { status: 400 })
    }

    // Validar tipo de arquivo
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/png",
      "image/gif",
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Tipo de arquivo nao permitido" },
        { status: 400 }
      )
    }

    // Limitar tamanho (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande (max 10MB)" },
        { status: 400 }
      )
    }

    // Gerar nome unico
    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const pathname = `contratos/${timestamp}-${safeName}`

    console.log("[v0] Calling put with pathname:", pathname)
    const blob = await put(pathname, file, {
      access: "private",
    })

    console.log("[v0] Upload successful, blob pathname:", blob.pathname)

    // Para blobs privados, retornamos o pathname para usar com a API /api/file
    return NextResponse.json({ 
      pathname: blob.pathname,
      filename: file.name,
    })
  } catch (error) {
    console.error("[v0] Erro no upload:", error)
    return NextResponse.json({ error: "Erro no upload: " + (error instanceof Error ? error.message : "Unknown error") }, { status: 500 })
  }
}
