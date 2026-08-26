import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { AppSidebar } from "@/components/app-sidebar"
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
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </AuthProvider>
  )
}
