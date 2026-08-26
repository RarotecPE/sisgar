import { neon, NeonQueryFunction } from "@neondatabase/serverless"

// Lazy initialization to avoid build-time errors
let _sql: NeonQueryFunction<false, false> | null = null

function getSql(): NeonQueryFunction<false, false> {
  if (!_sql) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is not set")
    }
    _sql = neon(process.env.DATABASE_URL)
  }
  return _sql
}

// Export a tagged template function that delegates to the lazy-loaded sql
export const sql: NeonQueryFunction<false, false> = ((
  strings: TemplateStringsArray,
  ...values: any[]
) => {
  return getSql()(strings, ...values)
}) as NeonQueryFunction<false, false>
