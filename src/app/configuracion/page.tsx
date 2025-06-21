"use client"

import React from "react"
import { Header } from "../../components/Header"
import { ThemeToggle } from "../../components/ThemeToggle"

export default function ConfiguracionPage() {
  return (
    <div className='flex flex-col flex-1 bg-[#121212]'>
      {/* Barra superior */}
      <Header title='Configuración' />

      <main className='flex-1 p-6 overflow-y-auto'>
        {/* Contenido específico de Configuración */}

        <div className='max-w-2xl'>
          <ThemeToggle />
        </div>
      </main>
    </div>
  )
}
