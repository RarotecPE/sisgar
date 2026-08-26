import { sql } from "@/lib/db"
import { NextResponse } from "next/server"


export async function POST() {
  try {
    console.log("Adicionando novas colunas à tabela relatorios_visitas...")

    // Adicionar novas colunas se não existirem
    await sql`
      ALTER TABLE relatorios_visitas 
      ADD COLUMN IF NOT EXISTS estado VARCHAR(2) DEFAULT 'PE',
      ADD COLUMN IF NOT EXISTS municipio VARCHAR(255),
      ADD COLUMN IF NOT EXISTS orgao_atendido TEXT,
      ADD COLUMN IF NOT EXISTS modulos JSONB,
      ADD COLUMN IF NOT EXISTS tecnicos_rarotec_ids JSONB,
      ADD COLUMN IF NOT EXISTS tema VARCHAR(100),
      ADD COLUMN IF NOT EXISTS data_relatorio DATE,
      ADD COLUMN IF NOT EXISTS historico TEXT,
      ADD COLUMN IF NOT EXISTS numero_autenticacao VARCHAR(50),
      ADD COLUMN IF NOT EXISTS tecnicos_cliente_info JSONB
    `

    // Criar tabela de anexos
    await sql`
      CREATE TABLE IF NOT EXISTS relatorios_anexos (
        id SERIAL PRIMARY KEY,
        relatorio_id INTEGER REFERENCES relatorios_visitas(id) ON DELETE CASCADE,
        nome_arquivo VARCHAR(255) NOT NULL,
        tipo_arquivo VARCHAR(100),
        url TEXT NOT NULL,
        tamanho INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `

    // Criar índice para busca por numero de autenticação
    await sql`
      CREATE INDEX IF NOT EXISTS idx_relatorios_numero_autenticacao 
      ON relatorios_visitas(numero_autenticacao)
    `

    // Atualizar relatórios existentes sem numero de autenticação
    const relatoriosSemNumero = await sql`
      SELECT id FROM relatorios_visitas WHERE numero_autenticacao IS NULL
    `

    for (const relatorio of relatoriosSemNumero) {
      const timestamp = Date.now().toString(36).toUpperCase()
      const random = Math.random().toString(36).substring(2, 8).toUpperCase()
      const numero = `RAR-${timestamp}-${random}`
      
      await sql`
        UPDATE relatorios_visitas 
        SET numero_autenticacao = ${numero}
        WHERE id = ${relatorio.id}
      `
    }

    return NextResponse.json({ 
      success: true, 
      message: "Migração concluída",
      relatoriosAtualizados: relatoriosSemNumero.length
    })
  } catch (error) {
    console.error("Erro na migração:", error)
    return NextResponse.json({ error: "Erro na migração", details: String(error) }, { status: 500 })
  }
}
