import { type User, resolveSetoresUsuario } from "@/lib/auth"
import { isGestor } from "@/lib/permissions"
import type { DocumentoInstitucional } from "@/lib/documentos-institucionais"

// Determina se um usuario pode VER um documento/ata, aplicando as regras de acesso.
export async function podeVerDocumento(
  user: User,
  doc: Pick<DocumentoInstitucional, "categoria" | "setor" | "usuario_alvo_id">,
): Promise<boolean> {
  if (isGestor(user.nome, user.cargo)) return true

  switch (doc.categoria) {
    case "ata_setor": {
      if (!doc.setor) return false
      const setores = await resolveSetoresUsuario(user)
      return setores.includes(doc.setor)
    }
    case "ata_individual":
      return doc.usuario_alvo_id === user.id
    default:
      // organograma, atribuicoes, regulamento, demais, ata_geral -> todos veem
      return true
  }
}
