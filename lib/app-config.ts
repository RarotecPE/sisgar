import { sql } from "@/lib/db"

// Le um valor de configuracao global. Retorna null se nao existir.
export async function getConfig(chave: string): Promise<string | null> {
  try {
    const rows = await sql<{ valor: string }>`SELECT valor FROM app_config WHERE chave = ${chave} LIMIT 1`
    return rows.length > 0 ? rows[0].valor : null
  } catch {
    return null
  }
}

// Grava um valor de configuracao global.
export async function setConfig(chave: string, valor: string, updatedBy?: number | null): Promise<void> {
  await sql`
    INSERT INTO app_config (chave, valor, updated_at, updated_by)
    VALUES (${chave}, ${valor}, now(), ${updatedBy ?? null})
    ON CONFLICT (chave) DO UPDATE
    SET valor = EXCLUDED.valor, updated_at = now(), updated_by = EXCLUDED.updated_by
  `
}

export async function isOuveAtivo(): Promise<boolean> {
  const v = await getConfig("ouve_ativo")
  return v === "true"
}
