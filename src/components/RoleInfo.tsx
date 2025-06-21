"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, Permission } from '@/types';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Shield, 
  Stethoscope, 
  UserCheck, 
  Calendar, 
  Users, 
  Package, 
  Settings,
  Home,
} from 'lucide-react';

interface RoleInfoProps {
  role: UserRole;
  permissions: Permission[];
  onPermissionChange: (resource: string, action: string, value: boolean) => void;
  isEditingDisabled?: boolean;
}

const roleIcons = {
  admin: Shield,
  veterinario: Stethoscope,
  secretaria: UserCheck,
};

const roleNames = {
  admin: 'Administrador',
  veterinario: 'Veterinario',
  secretaria: 'Secretaria',
};

const resourceNames: { [key: string]: string } = {
  dashboard: 'Dashboard',
  usuarios: 'Usuarios',
  pacientes: 'Pacientes',
  duenos: 'Dueños',
  consultas: 'Consultas',
  citas: 'Citas',
  inventario: 'Inventario',
  configuracion: 'Configuración',
};

const actionNames: { [key: string]: string } = {
  create: 'Crear',
  read: 'Ver',
  update: 'Editar',
  delete: 'Eliminar',
};

const resourceIcons: { [key: string]: React.ElementType } = {
  dashboard: Home,
  usuarios: Users,
  pacientes: Users, // Podríamos cambiarlo en el futuro
  duenos: Users, // Podríamos cambiarlo en el futuro
  consultas: Stethoscope,
  citas: Calendar,
  inventario: Package,
  configuracion: Settings,
};


export function RoleInfo({ role, permissions, onPermissionChange, isEditingDisabled = false }: RoleInfoProps) {
  const RoleIcon = roleIcons[role];

  return (
    <Card className="w-full max-w-4xl border-none shadow-none">
      <CardHeader className="p-0 mb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <RoleIcon className="h-6 w-6" />
          Permisos para {roleNames[role]}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="space-y-4">
          {permissions.map((permission) => {
            const ResourceIcon = resourceIcons[permission.resource] || Users;
            return (
              <div key={permission.resource} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-3 mb-3 sm:mb-0">
                  <ResourceIcon className="h-5 w-5 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{resourceNames[permission.resource]}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-8 sm:pl-0">
                  {['create', 'read', 'update', 'delete'].map((action) => {
                    // El permiso de lectura ahora es editable
                    const isDisabled = isEditingDisabled;

                    return (
                      <div key={action} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${role}-${permission.resource}-${action}`}
                          checked={permission.actions.includes(action)}
                          onCheckedChange={(checked) => {
                            onPermissionChange(permission.resource, action, !!checked);
                          }}
                          disabled={isDisabled}
                          aria-label={`Permiso de ${actionNames[action]} para ${resourceNames[permission.resource]}`}
                        />
                        <label
                          htmlFor={`${role}-${permission.resource}-${action}`}
                          className={`text-sm leading-none ${isDisabled ? 'cursor-not-allowed opacity-70' : ''}`}
                        >
                          {actionNames[action]}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          })}
        </div>
        {isEditingDisabled && (
          <p className="text-sm text-muted-foreground mt-4 italic">
            Los permisos del rol de Administrador no se pueden editar para mantener la integridad del sistema.
          </p>
        )}
      </CardContent>
    </Card>
  );
} 