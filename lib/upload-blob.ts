import { upload } from "@vercel/blob/client"

export interface UploadResult {
  pathname: string
  filename: string
}

// Faz upload de um arquivo direto do navegador para o Vercel Blob.
// Contorna o limite de tamanho do corpo de requisicao das rotas de servidor,
// permitindo enviar arquivos grandes (ate 25MB, conforme a rota handleUpload).
export async function uploadArquivo(file: File): Promise<UploadResult> {
  const result = await upload(file.name, file, {
    access: "private",
    handleUploadUrl: "/api/upload/client",
  })
  return { pathname: result.pathname, filename: file.name }
}
