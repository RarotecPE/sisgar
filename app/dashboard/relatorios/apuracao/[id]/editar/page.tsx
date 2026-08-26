import { notFound } from "next/navigation"
import { sql } from "@/lib/db"
import { ApuracaoForm } from "../../apuracao-form"
import type { ApuracaoRelatorio } from "@/lib/apuracao"

export default async function EditarApuracaoPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const rows = await sql`SELECT * FROM apuracao_relatorios WHERE id = ${parseInt(id)}`
  if (rows.length === 0) notFound()
  return <ApuracaoForm relatorio={rows[0] as unknown as ApuracaoRelatorio} />
}
