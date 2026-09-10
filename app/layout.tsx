import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { EnvironmentBanner } from '@/components/layout/EnvironmentBanner'
import { ThemeProvider } from '@/components/theme-provider'
import { ResizeObserverFix } from '@/components/resize-observer-fix'
import { Toaster } from '@/components/ui/sonner'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: true,
}

export const metadata: Metadata = {
  title: 'SISGAR - Rarotec',
  description: 'Sistema de Gestao Administrativa da Rarotec',
  generator: 'v0.app',
  icons: {
    icon: [{ url: '/icon-light-32x32.png?v=2', type: 'image/png', sizes: '32x32' }],
    shortcut: '/icon-light-32x32.png?v=2',
    apple: '/apple-icon.png?v=2',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider defaultTheme="dark">
          <ResizeObserverFix />
          <EnvironmentBanner />
          {children}
          <Toaster richColors position="top-center" />
          {process.env.NODE_ENV === 'production' && <Analytics />}
        </ThemeProvider>
      </body>
    </html>
  )
}
