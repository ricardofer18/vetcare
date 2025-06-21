"use client"

import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import dynamic from "next/dynamic"
import { useAuth } from '@/lib/auth'
import { LoadingPage } from '@/components/ui/loading-spinner'

const Sidebar = dynamic(() => import("@/components/Sidebar"), { ssr: false })

interface LayoutWrapperProps {
  children: React.ReactNode
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  const pathname = usePathname()
  const { user, loading: authLoading } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [isInitialLoading, setIsInitialLoading] = useState(true)
  const isLoginPage = pathname === '/login'

  useEffect(() => {
    setMounted(true)
    // Simular carga inicial de 1 segundo
    const timer = setTimeout(() => {
      setIsInitialLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Mostrar pantalla de carga si:
  // 1. No está montado (SSR)
  // 2. Está en carga inicial
  // 3. Está cargando autenticación
  // 4. No es página de login y no hay usuario (esperando redirección)
  if (!mounted || isInitialLoading || authLoading || (!isLoginPage && !user && !authLoading)) {
    return (
      <LoadingPage 
        description="Cargando aplicación..." 
        showLogo={true} 
      />
    )
  }

  // Página de login - mostrar sin sidebar
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    )
  }

  // Usuario autenticado - mostrar con sidebar
  if (user) {
    return (
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {children}
        </main>
      </div>
    )
  }

  // Fallback - no debería llegar aquí
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 