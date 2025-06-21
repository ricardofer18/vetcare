"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import dynamic from "next/dynamic"
import { Providers } from "./providers"
import { usePathname } from "next/navigation"

const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false })

const inter = Inter({ subsets: ["latin"] })

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === '/login'

  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {isLoginPage ? (
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          ) : (
            <div className="flex h-screen">
              <Sidebar />
              <main className="flex-1 overflow-auto">
                {children}
              </main>
            </div>
          )}
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
