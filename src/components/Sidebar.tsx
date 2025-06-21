"use client";

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { PawLogo } from "./PawLogo"
import {
  Calendar,
  Users,
  Stethoscope,
  Package,
  Settings,
  LogOut,
  Home,
  User,
  UserCog,
  Menu,
  X
} from "lucide-react"
import { useAuth } from "@/lib/auth"
import { UserRole } from "@/types"
import { useState } from "react"

interface MenuItem {
  href: string;
  title: string;
  icon: any;
  resource: string;
}

const menuItems: MenuItem[] = [
  {
    href: "/dashboard",
    title: "Dashboard",
    icon: Home,
    resource: 'dashboard'
  },
  {
    href: "/agenda",
    title: "Agenda",
    icon: Calendar,
    resource: 'citas'
  },
  {
    href: "/consultas",
    title: "Consultas",
    icon: Stethoscope,
    resource: 'consultas'
  },
  {
    href: "/pacientes",
    title: "Pacientes",
    icon: Users,
    resource: 'pacientes'
  },
  {
    href: "/duenos-clientes",
    title: "Dueños",
    icon: User,
    resource: 'duenos'
  },
  {
    href: "/inventario",
    title: "Inventario",
    icon: Package,
    resource: 'inventario'
  },
  {
    href: "/usuarios",
    title: "Usuarios",
    icon: UserCog,
    resource: 'usuarios'
  },
  {
    href: "/configuracion",
    title: "Configuración",
    icon: Settings,
    resource: 'configuracion'
  }
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user, signOut, userRole, hasPermission } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Filtrar elementos del menú según el permiso de 'read'
  const filteredMenuItems = menuItems.filter(item => {
    // El dashboard siempre debe ser visible
    if (item.resource === 'dashboard') {
      return true;
    }
    
    // Si no hay usuario o rol, mostrar solo dashboard
    if (!user || !userRole) {
      return false;
    }
    
    // Para otros elementos, verificar permisos
    const hasAccess = hasPermission(item.resource, 'read');
    console.log(`Sidebar: ${item.title} (${item.resource}) - hasPermission: ${hasAccess}`);
    return hasAccess;
  });

  console.log('Sidebar: userRole:', userRole);
  console.log('Sidebar: user:', user);
  console.log('Sidebar: filteredMenuItems:', filteredMenuItems.map(item => item.title));

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Botón de menú móvil */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md shadow-lg"
      >
        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay para móviles */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex flex-col bg-card border-r border-border shadow-lg transition-transform duration-300 ease-in-out",
        "fixed lg:static inset-y-0 left-0 z-40",
        "w-64 lg:w-64",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex items-center justify-center h-16 border-b border-border shadow-sm gap-2">
          <div className="w-8 h-8">
            <PawLogo size={32} className="w-full h-full" />
          </div>
          <h1 className="text-xl font-semibold text-card-foreground">VetCare</h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto">
          <ul className="p-4 space-y-2">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={closeMobileMenu}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground",
                      pathname === item.href ? "bg-accent text-accent-foreground" : ""
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="truncate">{item.title}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Información del usuario */}
        {user && (
          <div className="p-4 border-t border-border">
            <div className="text-center mb-3">
              <p className="text-sm text-muted-foreground mb-1">¡Bienvenido!</p>
              <p className="text-sm font-medium text-card-foreground truncate">
                {user.email || 'Usuario'}
              </p>
              {userRole && (
                <p className="text-xs text-muted-foreground capitalize">
                  {userRole}
                </p>
              )}
            </div>
            <button
              onClick={() => {
                signOut();
                closeMobileMenu();
              }}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-foreground w-full"
            >
              <LogOut className="h-4 w-4" />
              <span className="truncate">Cerrar Sesión</span>
            </button>
          </div>
        )}
      </div>
    </>
  )
} 