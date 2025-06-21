"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit } from 'lucide-react';
import { UserRole } from '@/types';
import { DisabledButton } from './RoleGuard';

interface UserCardProps {
  usuario: {
    uid: string;
    email: string | null;
    nombre?: string;
    role: UserRole;
    disabled?: boolean;
    ultimoAcceso?: string;
  };
  onEdit: (usuario: any) => void;
}

const getRoleVariant = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'destructive' as const;
    case 'veterinario':
      return 'default' as const;
    case 'secretaria':
      return 'secondary' as const;
    default:
      return 'outline' as const;
  }
};

export const UserCard: React.FC<UserCardProps> = ({ usuario, onEdit }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
            <span className="text-primary-foreground font-semibold text-base sm:text-lg">
              {usuario.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm sm:text-base font-semibold text-card-foreground truncate">
              {usuario.email}
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">
              {usuario.nombre || 'Sin nombre'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-xs sm:text-sm">Rol:</span>
          <Badge variant={getRoleVariant(usuario.role)} className="text-xs sm:text-sm">
            {usuario.role}
          </Badge>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground text-xs sm:text-sm">Estado:</span>
          <Badge variant={usuario.disabled ? "destructive" : "default"} className="text-xs sm:text-sm">
            {usuario.disabled ? "Deshabilitado" : "Activo"}
          </Badge>
        </div>
        {usuario.ultimoAcceso && (
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs sm:text-sm">Último acceso:</span>
            <span className="text-card-foreground text-xs sm:text-sm truncate">
              {new Date(usuario.ultimoAcceso).toLocaleDateString('es-CL')}
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-1 sm:gap-2">
        <DisabledButton
          resource="usuarios"
          action="update"
          variant="outline"
          size="sm"
          onClick={() => onEdit(usuario)}
          className="flex-1 text-xs sm:text-sm"
          tooltip="Editar información del usuario"
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Editar</span>
          <span className="sm:hidden">Editar</span>
        </DisabledButton>
      </div>
    </div>
  );
}; 