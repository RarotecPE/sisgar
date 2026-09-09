import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
import { DashboardHeaderActions } from "@/components/dashboard-header-actions"
import { AuthProvider } from "@/lib/auth-context"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getSession()

  if (!user) {
    redirect("/login")
  }

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background">
        <AppSidebar user={user} />
        <main className="lg:pl-64">
          <header className="sticky top-0 z-30 hidden h-16 items-center justify-between border-b border-border bg-card/85 px-6 backdrop-blur-xl lg:flex">
            <div>
              <p className="text-xs font-medium uppercase text-muted-foreground">SISGAR</p>
              <h2 className="text-lg font-semibold text-foreground">
                Sistema de Gestão Administrativa
              </h2>
            </div>
            <DashboardHeaderActions user={user} />
          </header>
          <div className="min-h-[calc(100vh-4rem)]">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
