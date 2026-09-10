import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { type NextRequest, NextResponse } from "next/server"

// Rota de suporte para uploads DIRETOS do cliente para o Vercel Blob.
// O arquivo vai do navegador direto para o Blob, sem passar pelo corpo da
// requisicao do servidor — assim evitamos o limite de ~4,5MB das rotas/funcoes
// da plataforma, que causava "Falha no upload do arquivo" em PDFs maiores.
export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN && !process.env.VERCEL_BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Vercel Blob desativado neste ambiente. Use a rota unificada /api/upload." },
      { status: 400 }
    )
  }

  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        // O tipo de acesso (private) e herdado do store configurado.
        return {
          allowedContentTypes: [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/gif",
          ],
          maximumSizeInBytes: 25 * 1024 * 1024, // 25MB
          addRandomSuffix: true,
        }
      },
      onUploadCompleted: async () => {
        // Nada a fazer aqui: o cliente recebe o pathname pela promise de upload()
        // e persiste o documento na sua propria chamada a /api/documentos-medicos.
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    console.error("[v0] Erro no handleUpload (client):", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro no upload" },
      { status: 400 },
    )
  }
}
