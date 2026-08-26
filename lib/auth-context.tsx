"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import useSWR from "swr"

interface User {
  id: number
  nome: string
  email: string
  cargo?: string
  cargos?: string[]
  apuracao_mensal?: boolean
  tecnico_rarotec_id?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
})

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error("Not authenticated")
  return res.json()
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: user, error, isLoading } = useSWR<User>("/api/auth/me", fetcher, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const isAdmin = user?.cargo === "Administrador" || 
                  user?.cargos?.includes("Administrador") || 
                  false

  return (
    <AuthContext.Provider value={{ 
      user: user || null, 
      loading: isLoading, 
      isAdmin 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useSession() {
  return useContext(AuthContext)
}
