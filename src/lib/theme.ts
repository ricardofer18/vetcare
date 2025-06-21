"use client"

import { useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    // Obtener el tema guardado en localStorage o usar el tema del sistema
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const currentTheme = savedTheme || systemTheme
    
    setTheme(currentTheme)
    applyTheme(currentTheme)
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement
    
    if (newTheme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
    
    localStorage.setItem('theme', newTheme)
  }

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    applyTheme(newTheme)
  }

  const setLightTheme = () => {
    setTheme('light')
    applyTheme('light')
  }

  const setDarkTheme = () => {
    setTheme('dark')
    applyTheme('dark')
  }

  return {
    theme,
    toggleTheme,
    setLightTheme,
    setDarkTheme
  }
} 