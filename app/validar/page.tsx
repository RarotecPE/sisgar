"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Search, FileText, ShieldCheck, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function ValidarPage() {
  const [codigo, setCodigo] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!codigo.trim()) return
    
    setLoading(true)
    router.push(`/validar/${codigo.trim().toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="https://www.rarotec.com.br/assets/logo.png"
              alt="Rarotec"
              className="h-8 w-auto"
            />
          </Link>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Area Restrita
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Validar Relatório</CardTitle>
            <CardDescription>
              Digite o código de autenticação para verificar a autenticidade do relatório
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="codigo" className="text-sm font-medium">
                  Código de Autenticação
                </label>
                <Input
                  id="codigo"
                  placeholder="Ex: RAR-MP78QLCL-4UEFWL"
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.toUpperCase())}
                  className="h-12 text-center font-mono text-lg uppercase tracking-wider"
                />
                <p className="text-xs text-muted-foreground text-center">
                  O código está localizado no relatório ou no QR Code
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full h-12"
                disabled={!codigo.trim() || loading}
              >
                {loading ? (
                  "Verificando..."
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Verificar Autenticidade
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>RAROTEC - Tecnologia para Gestão Pública</p>
          <p className="mt-1">SISGAR - Sistema de Gestão Administrativa</p>
        </div>
      </footer>
    </div>
  )
}
