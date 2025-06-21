"use client"

import { useTheme } from "@/lib/theme"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setLightTheme, setDarkTheme } = useTheme()

  return (
    <div className='bg-card rounded-lg shadow-lg border border-border p-6'>
      <h3 className='text-lg font-semibold text-card-foreground mb-4'>
        Apariencia
      </h3>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-muted-foreground'>
            Tema de la aplicación
          </span>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={setLightTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              theme === "light"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Sun className='w-4 h-4' />
            <span>Claro</span>
          </button>

          <button
            onClick={setDarkTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              theme === "dark"
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background text-foreground border-border hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            <Moon className='w-4 h-4' />
            <span>Oscuro</span>
          </button>
        </div>
      </div>
    </div>
  )
}
 