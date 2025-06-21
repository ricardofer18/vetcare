"use client"

import { ReactNode } from 'react';
import { useAuth } from '../lib/auth';
import { Button, ButtonProps } from './ui/button';
import { Lock } from 'lucide-react';

// --- GUARDIA PRINCIPAL ---
interface RoleGuardProps {
  children: ReactNode;
  resource: string;
  action: string;
  fallback?: ReactNode;
}

export function RoleGuard({ 
  children, 
  resource,
  action,
  fallback = null
}: RoleGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(resource, action)) {
    return fallback;
  }

  return <>{children}</>;
}


// --- COMPONENTES DE CONVENIENCIA (VISIBILIDAD) ---
interface PermissionProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function AdminOnly({ children, fallback }: PermissionProps) {
  const { userRole } = useAuth();
  if (userRole !== 'admin') {
    return fallback;
  }
  return <>{children}</>;
}

export function CanReadDashboard({ children, fallback }: PermissionProps) {
  return <RoleGuard resource="dashboard" action="read" fallback={fallback}>{children}</RoleGuard>;
}

export function CanReadConsultas({ children, fallback }: PermissionProps) {
  return <RoleGuard resource="consultas" action="read" fallback={fallback}>{children}</RoleGuard>;
}

export function CanCreateConsultas({ children, fallback }: PermissionProps) {
  return <RoleGuard resource="consultas" action="create" fallback={fallback}>{children}</RoleGuard>;
}

export function CanUpdateConsultas({ children, fallback }: PermissionProps) {
  return <RoleGuard resource="consultas" action="update" fallback={fallback}>{children}</RoleGuard>;
}

export function CanDeleteConsultas({ children, fallback }: PermissionProps) {
  return <RoleGuard resource="consultas" action="delete" fallback={fallback}>{children}</RoleGuard>;
}

export function CanReadPacientes({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="pacientes" action="read" fallback={fallback}>{children}</RoleGuard>;
}

export function CanCreatePacientes({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="pacientes" action="create" fallback={fallback}>{children}</RoleGuard>;
}

export function CanUpdatePacientes({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="pacientes" action="update" fallback={fallback}>{children}</RoleGuard>;
}

export function CanDeletePacientes({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="pacientes" action="delete" fallback={fallback}>{children}</RoleGuard>;
}

export function CanReadDuenos({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="duenos" action="read" fallback={fallback}>{children}</RoleGuard>;
}

export function CanCreateDuenos({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="duenos" action="create" fallback={fallback}>{children}</RoleGuard>;
}

export function CanUpdateDuenos({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="duenos" action="update" fallback={fallback}>{children}</RoleGuard>;
}

export function CanDeleteDuenos({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="duenos" action="delete" fallback={fallback}>{children}</RoleGuard>;
}

export function CanReadCitas({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="citas" action="read" fallback={fallback}>{children}</RoleGuard>;
}

export function CanCreateCitas({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="citas" action="create" fallback={fallback}>{children}</RoleGuard>;
}

export function CanUpdateCitas({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="citas" action="update" fallback={fallback}>{children}</RoleGuard>;
}

export function CanDeleteCitas({ children, fallback }: PermissionProps) {
    return <RoleGuard resource="citas" action="delete" fallback={fallback}>{children}</RoleGuard>;
}

// ... etc. para otros recursos como usuarios, inventario, etc.


// --- BOTÓN CON CONTROL DE PERMISOS ---
interface DisabledButtonProps extends ButtonProps {
  children: ReactNode;
  resource: string;
  action: string;
  tooltip?: string;
}

export function DisabledButton({ 
  children, 
  resource, 
  action, 
  tooltip = "No tienes permisos para esta acción",
  ...props
}: DisabledButtonProps) {
  const { hasPermission } = useAuth();
  const hasAccess = hasPermission(resource, action);

  if (hasAccess) {
    return (
      <Button {...props}>
        {children}
      </Button>
    );
  }

  return (
    <div className="relative inline-block cursor-not-allowed" title={tooltip}>
       <Button {...props} disabled>
        {children}
       </Button>
       <div className="absolute inset-0 flex items-center justify-center">
        <Lock className="h-4 w-4 text-white" />
      </div>
    </div>
  );
}

// --- ELEMENTO GENÉRICO CON CONTROL DE PERMISOS ---
interface DisabledElementProps {
  children: ReactNode;
  resource: string;
  action: string;
  tooltip?: string;
  className?: string;
}

export function DisabledElement({ 
  children, 
  resource, 
  action, 
  tooltip = "No tienes permisos para esta acción",
  className = ""
}: DisabledElementProps) {
  const { hasPermission } = useAuth();

  if (hasPermission(resource, action)) {
    return <>{children}</>;
  }

  return (
    <div className={`relative opacity-50 cursor-not-allowed ${className}`} title={tooltip}>
      {children}
      <div className="absolute inset-0 bg-background/20 rounded-md flex items-center justify-center">
        <Lock className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
} 