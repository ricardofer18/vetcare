"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Calendar,
  Users,
  Stethoscope,
  Package,
  Settings,
  LogOut,
  Home,
  User,
  UserCog
} from "lucide-react"
import { useAuth } from "@/lib/auth"

const menuItems = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: Home
  },
  {
    href: "/agenda",
    title: "Agenda",
    icon: Calendar
  },
  {
    href: "/consultas",
    title: "Consultas",
    icon: Stethoscope
  },
  {
    href: "/pacientes",
    title: "Pacientes",
    icon: Users
  },
  {
    href: "/duenos-clientes",
    title: "Dueños",
    icon: User
  },
  {
    href: "/inventario",
    title: "Inventario",
    icon: Package
  },
  {
    href: "/usuarios",
    title: "Usuarios",
    icon: UserCog
  },
  {
    href: "/configuracion",
    title: "Configuración",
    icon: Settings
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center justify-center h-16 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-white">VetCare</h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto">
        <ul className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
                    pathname === item.href ? "bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-50" : ""
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
      
      {/* Información del usuario */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center mb-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">¡Bienvenido!</p>
            <p className="text-sm font-medium text-gray-800 dark:text-white">
              {user.email || 'Usuario'}
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50 w-full"
          >
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
} 