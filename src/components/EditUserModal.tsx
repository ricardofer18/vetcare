"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { UserRole } from '@/types';

interface Usuario {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastSignInTime?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  active?: boolean;
}

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
  usuario: Usuario | null;
}

export function EditUserModal({ isOpen, onClose, onUserUpdated, usuario }: EditUserModalProps) {
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<UserRole>('secretaria');
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Actualizar el estado cuando cambia el usuario
  useEffect(() => {
    if (usuario) {
      setDisplayName(usuario.displayName || '');
      setRole(usuario.role || 'secretaria');
      setActive(usuario.active !== false); // Por defecto activo si no está definido
    }
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;

    setLoading(true);

    try {
      // Actualizar información en Firestore
      const userRef = doc(db, 'usuarios', usuario.uid);
      await updateDoc(userRef, {
        displayName: displayName,
        role: role,
        active: active,
        updatedAt: new Date()
      });

      toast({
        title: 'Usuario actualizado',
        description: 'El usuario ha sido actualizado exitosamente',
        duration: 5000
      });

      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
      
      let errorMessage = 'Error al actualizar el usuario';
      
      // Manejar errores específicos de Firestore
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'No tienes permisos para editar usuarios';
            break;
          case 'not-found':
            errorMessage = 'El usuario no fue encontrado';
            break;
          case 'unavailable':
            errorMessage = 'El servicio no está disponible. Intenta más tarde';
            break;
          case 'unauthenticated':
            errorMessage = 'Debes iniciar sesión para editar usuarios';
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={usuario.email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">El email no se puede modificar</p>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="displayName">Nombre</Label>
            <Input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Nombre completo"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Rol</Label>
            <Select value={role} onValueChange={(value: UserRole) => setRole(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="veterinario">Veterinario</SelectItem>
                <SelectItem value="secretaria">Secretaria</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="active">Estado de la cuenta</Label>
              <p className="text-sm text-muted-foreground">
                {active ? 'Cuenta activa' : 'Cuenta deshabilitada'}
              </p>
            </div>
            <Switch
              id="active"
              checked={active}
              onCheckedChange={setActive}
            />
          </div>
          <div className="grid gap-2">
            <Label>Información del usuario</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>ID: {usuario.uid}</p>
              <p>Creado: {new Date(usuario.createdAt).toLocaleDateString()}</p>
              {usuario.emailVerified !== undefined && (
                <p>Email verificado: {usuario.emailVerified ? 'Sí' : 'No'}</p>
              )}
              {usuario.lastSignInTime && (
                <p>Último login: {new Date(usuario.lastSignInTime).toLocaleString()}</p>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Guardar Cambios'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 