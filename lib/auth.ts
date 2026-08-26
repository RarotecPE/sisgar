import { cookies } from "next/headers"
import bcrypt from "bcryptjs"
import { sql } from "./db"

export interface User {
  id: number
  nome: string
  email: string
  cargo: string | null
  ativo: boolean
  apuracao_mensal: boolean
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(userId: number): Promise<string> {
  const sessionId = crypto.randomUUID()
  const cookieStore = await cookies()
  
  cookieStore.set("session_id", sessionId, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
  
  cookieStore.set("user_id", String(userId), {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })
  
  return sessionId
}

export async function getSession(): Promise<User | null> {
  const cookieStore = await cookies()
  const userId = cookieStore.get("user_id")?.value
  
  if (!userId) return null
  
  const users = await sql`
    SELECT id, nome, email, cargo, ativo, apuracao_mensal 
    FROM usuarios 
    WHERE id = ${parseInt(userId)} AND ativo = true
  `
  
  return users[0] as User | null
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete("session_id")
  cookieStore.delete("user_id")
}

// Resolve o tecnico_rarotec_id vinculado a um usuario (por email, fallback por nome).
export async function resolveTecnicoRarotecId(user: User): Promise<number | null> {
  try {
    let tecnicos = await sql`
      SELECT id FROM tecnicos_rarotec WHERE LOWER(email) = LOWER(${user.email}) LIMIT 1
    `
    if (tecnicos.length === 0) {
      tecnicos = await sql`
        SELECT id FROM tecnicos_rarotec WHERE LOWER(nome) = LOWER(${user.nome}) LIMIT 1
      `
    }
    return tecnicos.length > 0 ? tecnicos[0].id : null
  } catch {
    return null
  }
}

// Resolve a lista de setores (array de texto) a que o usuario pertence,
// a partir do tecnico_rarotec vinculado (por email, fallback por nome).
export async function resolveSetoresUsuario(user: User): Promise<string[]> {
  try {
    let rows = await sql`
      SELECT setores FROM tecnicos_rarotec WHERE LOWER(email) = LOWER(${user.email}) LIMIT 1
    `
    if (rows.length === 0) {
      rows = await sql`
        SELECT setores FROM tecnicos_rarotec WHERE LOWER(nome) = LOWER(${user.nome}) LIMIT 1
      `
    }
    const setores = rows.length > 0 ? rows[0].setores : null
    return Array.isArray(setores) ? setores.filter(Boolean) : []
  } catch {
    return []
  }
}
