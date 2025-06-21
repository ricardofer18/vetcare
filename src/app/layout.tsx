"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"
import { LayoutWrapper } from "./layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <title>Vetcare</title>
        <meta name="description" content="Sistema de gestión veterinaria" />
      </head>
      <body className={inter.className}>
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </Providers>
      </body>
    </html>
  )
}

export default RootLayout
