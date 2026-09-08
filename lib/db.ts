import { neon } from "@neondatabase/serverless"
import { Pool } from "pg"

type QueryValue = unknown
type QueryResult<T> = Promise<T[]> & SqlFragment

type SqlQuery = <T = Record<string, unknown>>(
  strings: TemplateStringsArray,
  ...values: QueryValue[]
) => QueryResult<T>

type DatabaseConfig = {
  url: string
  useNeon: boolean
}

type SqlFragment = {
  readonly __sqlFragment: true
  readonly strings: readonly string[]
  readonly values: readonly QueryValue[]
}

type CompiledQuery = {
  query: string
  values: QueryValue[]
}

let _sql: SqlQuery | null = null
let _pool: Pool | null = null

function normalizeDatabaseConfig(value: string): DatabaseConfig {
  const trimmed = value.trim()

  if (/^postgres(ql)?:\/\//i.test(trimmed)) {
    return {
      url: trimmed,
      useNeon: /neon\.tech/i.test(trimmed),
    }
  }

  const [hostPort, database, user, password] = trimmed.split(";")
  if (!hostPort || !database || !user || !password) {
    return { url: trimmed, useNeon: false }
  }

  const [host, port = "5432"] = hostPort.split(":")
  if (!host) return { url: trimmed, useNeon: false }

  return {
    url: `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:${port}/${encodeURIComponent(database)}`,
    useNeon: false,
  }
}

function isSqlFragment(value: QueryValue): value is SqlFragment {
  return Boolean(value && typeof value === "object" && (value as SqlFragment).__sqlFragment)
}

function compileFragment(fragment: SqlFragment, values: QueryValue[] = []): CompiledQuery {
  let query = ""

  fragment.strings.forEach((part, index) => {
    query += part

    if (index >= fragment.values.length) return

    const value = fragment.values[index]
    if (isSqlFragment(value)) {
      const nested = compileFragment(value, values)
      query += nested.query
      return
    }

    values.push(value)
    query += `$${values.length}`
  })

  return { query, values }
}

function createStatement<T>(
  strings: TemplateStringsArray,
  values: QueryValue[],
  execute: (compiled: CompiledQuery) => Promise<T[]>,
): QueryResult<T> {
  const fragment: SqlFragment = {
    __sqlFragment: true,
    strings: Array.from(strings),
    values,
  }

  let promise: Promise<T[]> | null = null
  const run = () => {
    promise ??= execute(compileFragment(fragment))
    return promise
  }

  return Object.assign(fragment, {
    then: (...args: Parameters<Promise<T[]>["then"]>) => run().then(...args),
    catch: (...args: Parameters<Promise<T[]>["catch"]>) => run().catch(...args),
    finally: (...args: Parameters<Promise<T[]>["finally"]>) => run().finally(...args),
    [Symbol.toStringTag]: "Promise",
  }) as QueryResult<T>
}

function createPgSql(url: string): SqlQuery {
  _pool = new Pool({ connectionString: url })

  return <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: QueryValue[]) =>
    createStatement<T>(strings, values, async ({ query, values: queryValues }) => {
      const result = await _pool!.query(query, queryValues)
      return result.rows as T[]
    })
}

function createNeonSql(url: string): SqlQuery {
  const neonSql = neon(url) as unknown as (query: string, values: QueryValue[]) => Promise<Record<string, unknown>[]>

  return <T = Record<string, unknown>>(strings: TemplateStringsArray, ...values: QueryValue[]) =>
    createStatement<T>(strings, values, async ({ query, values: queryValues }) => {
      return (await neonSql(query, queryValues)) as T[]
    })
}

function getSql(): SqlQuery {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }

    const config = normalizeDatabaseConfig(process.env.DATABASE_URL)
    _sql = config.useNeon ? createNeonSql(config.url) : createPgSql(config.url)
  }

  return _sql
}

export const sql: SqlQuery = ((strings, ...values) => {
  return getSql()(strings, ...values)
}) as SqlQuery

