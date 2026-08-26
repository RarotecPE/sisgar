import { sql } from "@/lib/db"
import { NextRequest, NextResponse } from "next/server"


// GET /api/relatorios/anexos/[id] - Retorna o conteúdo do anexo (streaming)
// Para blobs privados, precisamos fazer o download server-side e retornar o conteúdo
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Buscar anexo no banco
    const anexos = await sql`
      SELECT * FROM relatorios_anexos WHERE id = ${parseInt(id)}
    `

    if (anexos.length === 0) {
      return NextResponse.json({ error: "Anexo não encontrado" }, { status: 404 })
    }

    const anexo = anexos[0]

    // Para blobs privados, precisamos fazer fetch usando o BLOB_READ_WRITE_TOKEN
    // A URL do blob privado pode ser acessada server-side com o token
    const blobUrl = anexo.url
    
    // Fazer download do blob usando o token de acesso
    const response = await fetch(blobUrl, {
      headers: {
        // O token é automaticamente usado pelo Vercel em ambiente de produção
        // Em desenvolvimento, precisamos passar o token
        ...(process.env.BLOB_READ_WRITE_TOKEN && {
          'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
        })
      }
    })

    if (!response.ok) {
      console.error("Erro ao buscar blob:", response.status, response.statusText)
      return NextResponse.json({ error: "Erro ao buscar arquivo" }, { status: 500 })
    }

    // Retornar o arquivo diretamente
    const blob = await response.blob()
    
    return new NextResponse(blob, {
      headers: {
        'Content-Type': anexo.tipo_arquivo || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${anexo.nome_arquivo}"`,
        'Content-Length': String(blob.size),
      }
    })
  } catch (error) {
    console.error("Erro ao buscar anexo:", error)
    return NextResponse.json({ error: "Erro ao buscar anexo" }, { status: 500 })
  }
}
