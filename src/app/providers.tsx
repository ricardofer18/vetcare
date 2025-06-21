"use client"

import { AuthProvider } from "@/lib/auth"
import { useEffect } from "react"

function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Inicializar el tema al cargar la aplicación
    const savedTheme = localStorage.getItem('theme')
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const currentTheme = savedTheme || systemTheme
    
    const root = document.documentElement
    if (currentTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [])

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  )
} 