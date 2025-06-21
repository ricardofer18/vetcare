import React from 'react';
import { Button } from './ui/button';
import { Pencil, Trash2, Eye, Edit, UserX } from 'lucide-react';
import { Owner } from '../types'; // Importar la interfaz Owner desde types
import { DisabledButton } from './RoleGuard';

interface OwnerTableProps {
  owners: Owner[];
  onRowClick: (owner: Owner) => void;
  onEdit?: (owner: Owner) => void;
  onDelete?: (ownerId: string) => void;
}

const OwnerTable: React.FC<OwnerTableProps> = ({ owners, onRowClick, onEdit, onDelete }) => {
  return (
    <div className="bg-card rounded-lg shadow overflow-hidden border">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Dueño</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">RUT</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Contacto</th>
              <th scope="col" className="px-3 sm:px-6 py-2 sm:py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-card divide-y divide-border">
            {owners.map(owner => (
              <tr 
                key={owner.id} 
                onClick={() => onRowClick(owner)} 
                className="hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
                      <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground text-xs sm:text-sm font-semibold">
                        {owner.nombre.charAt(0)}{owner.apellido.charAt(0)}
                      </div>
                    </div>
                    <div className="ml-2 sm:ml-4 min-w-0 flex-1">
                      <div className="text-sm font-medium text-card-foreground truncate">{owner.nombre} {owner.apellido}</div>
                      <div className="text-xs sm:text-sm text-muted-foreground truncate">{owner.email}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{owner.rut}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-card-foreground hidden sm:table-cell">{owner.rut}</td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-sm text-card-foreground hidden md:table-cell">
                  <div>{owner.telefono}</div>
                </td>
                <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-1 sm:space-x-2">
                    {onEdit && (
                      <DisabledButton
                        resource="duenos"
                        action="update"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(owner);
                        }}
                        tooltip="Editar información del dueño"
                        className="text-primary hover:text-primary/80 text-xs sm:text-sm"
                      >
                        <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Editar</span>
                      </DisabledButton>
                    )}
                    {onDelete && (
                      <DisabledButton
                        resource="duenos"
                        action="delete"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(owner.id);
                        }}
                        tooltip="Eliminar dueño y todas sus mascotas"
                        className="text-destructive hover:text-destructive/80 text-xs sm:text-sm"
                      >
                        <UserX className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        <span className="hidden sm:inline">Eliminar</span>
                      </DisabledButton>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OwnerTable; 