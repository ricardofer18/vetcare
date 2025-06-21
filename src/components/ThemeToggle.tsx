"use client"

import { useTheme } from "@/lib/theme"
import { Sun, Moon } from "lucide-react"

export function ThemeToggle() {
  const { theme, setLightTheme, setDarkTheme } = useTheme()

  return (
    <div className='bg-white dark:bg-gray-800 rounded-lg shadow p-6'>
      <h3 className='text-lg font-semibold text-gray-800 dark:text-white mb-4'>
        Apariencia
      </h3>

      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <span className='text-gray-700 dark:text-gray-300'>
            Tema de la aplicación
          </span>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={setLightTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              theme === "light"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
            }`}
          >
            <Sun className='w-4 h-4' />
            <span>Claro</span>
          </button>

          <button
            onClick={setDarkTheme}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              theme === "dark"
                ? "bg-blue-500 text-white border-blue-500"
                : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
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
