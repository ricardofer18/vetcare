"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

export function CreateUserModal({ isOpen, onClose, onUserCreated }: CreateUserModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState('usuario');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const auth = getAuth();
      const token = await auth.currentUser?.getIdToken();

      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // Crear usuario usando la API REST de Firebase Auth
      const response = await fetch(
        'https://identitytoolkit.googleapis.com/v1/projects/vetcare-9c0c0/accounts:signUp?key=AIzaSyDNPcFVXDjBWxUZBs9kpVGXoLgGRU6uHhE',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password,
            displayName,
            returnSecureToken: true
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message);
      }

      const data = await response.json();
      const newUserId = data.localId;

      // Guardar información adicional en Firestore
      await setDoc(doc(db, 'usuarios', newUserId), {
        role: role,
        email: email,
        displayName: displayName,
        createdAt: new Date().toISOString(),
        emailVerified: false,
        disabled: false
      });

      toast({
        title: 'Usuario creado',
        description: 'El usuario ha sido creado exitosamente',
        duration: 5000
      });

      // Limpiar formulario
      setEmail('');
      setPassword('');
      setDisplayName('');
      setRole('usuario');
      
      onUserCreated();
      onClose();
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      
      let errorMessage = 'Error al crear el usuario';
      
      // Manejar errores de Firebase Auth
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'Este correo electrónico ya está registrado';
            break;
          case 'auth/invalid-email':
            errorMessage = 'El correo electrónico no es válido';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'El registro con correo y contraseña no está habilitado';
            break;
          case 'auth/weak-password':
            errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres';
            break;
          case 'permission-denied':
            errorMessage = 'No tienes permisos para crear usuarios';
            break;
          case 'unavailable':
            errorMessage = 'El servicio no está disponible. Por favor, intenta más tarde';
            break;
          default:
            if (error.message.includes('ADMIN_ONLY_OPERATION')) {
              errorMessage = 'Solo los administradores pueden crear usuarios';
            } else {
              errorMessage = `Error: ${error.message}`;
            }
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="********"
              required
            />
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
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Administrador</SelectItem>
                <SelectItem value="veterinario">Veterinario</SelectItem>
                <SelectItem value="recepcionista">Recepcionista</SelectItem>
                <SelectItem value="usuario">Usuario</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                'Crear Usuario'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 