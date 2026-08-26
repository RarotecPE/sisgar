import { type NextRequest, NextResponse } from "next/server"
import { get } from "@vercel/blob"

export async function GET(request: NextRequest) {
  try {
    const pathname = request.nextUrl.searchParams.get("pathname")

    if (!pathname) {
      return NextResponse.json({ error: "Pathname nao informado" }, { status: 400 })
    }

    const result = await get(pathname, {
      access: "private",
      ifNoneMatch: request.headers.get("if-none-match") ?? undefined,
    })

    if (!result) {
      return new NextResponse("Arquivo nao encontrado", { status: 404 })
    }

    if (result.statusCode === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: result.blob.etag,
          "Cache-Control": "private, no-cache",
        },
      })
    }

    // Extrair nome do arquivo do pathname
    const filename = pathname.split("/").pop() || "arquivo"

    // Valores de header HTTP so aceitam ISO-8859-1. Nomes com acento (ex.: "Declaração.pdf"),
    // sobretudo em forma Unicode decomposta (NFD, padrao do macOS), quebram o header e geram erro 500.
    // Usamos o padrao RFC 5987: um filename ASCII de fallback + filename* codificado em UTF-8.
    const filenameAscii =
      filename
        .normalize("NFKD")
        .replace(/[\u0300-\u036f]/g, "") // remove diacriticos
        .replace(/[^\x20-\x7e]/g, "_") // troca qualquer outro nao-ASCII por _
        .replace(/["\\]/g, "_") || "arquivo"
    const filenameUtf8 = encodeURIComponent(filename)
    const contentDisposition = `attachment; filename="${filenameAscii}"; filename*=UTF-8''${filenameUtf8}`

    return new NextResponse(result.stream, {
      headers: {
        "Content-Type": result.blob.contentType,
        "Content-Disposition": contentDisposition,
        ETag: result.blob.etag,
        "Cache-Control": "private, no-cache",
      },
    })
  } catch (error) {
    console.error("Erro ao servir arquivo:", error)
    return NextResponse.json({ error: "Erro ao servir arquivo" }, { status: 500 })
  }
}
