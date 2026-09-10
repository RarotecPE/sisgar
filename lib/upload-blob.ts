export interface UploadResult {
  pathname: string
  filename: string
}

/**
 * Faz upload de um arquivo para o armazenamento unificado (Cloudflare R2 / Vercel Blob / local).
 * Envia o arquivo via FormData para /api/upload e retorna o pathname e filename.
 */
export async function uploadArquivo(file: File, folder: string = "documentos"): Promise<UploadResult> {
  const formData = new FormData()
  formData.append("file", file)
  formData.append("folder", folder)

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    let errorMsg = "Falha ao enviar arquivo"
    try {
      const data = await response.json()
      if (data?.error) errorMsg = data.error
    } catch {
      // ignore
    }
    throw new Error(errorMsg)
  }

  const data = await response.json()
  return {
    pathname: data.pathname,
    filename: data.filename || file.name,
  }
}

