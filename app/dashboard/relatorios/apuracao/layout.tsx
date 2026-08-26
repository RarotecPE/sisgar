import { redirect } from "next/navigation"
import { ShieldAlert } from "lucide-react"
import { getSession } from "@/lib/auth"
import { canApuracaoMensal } from "@/lib/permissions"

export default async function ApuracaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  if (!canApuracaoMensal(user.cargo, user.apuracao_mensal)) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <ShieldAlert className="mb-4 h-16 w-16 text-amber-500" />
        <h1 className="mb-2 text-2xl font-semibold text-foreground">Acesso Restrito</h1>
        <p className="max-w-md text-center text-muted-foreground">
          Voce nao tem permissao para acessar a Apuracao Mensal. Solicite a um administrador que
          habilite a opcao &quot;Apuracao Mensal&quot; no seu cadastro de usuario.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
