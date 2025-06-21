"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { updateOwner } from '@/lib/firestore';
import { Owner } from '@/lib/firestore';
import { User, UserCheck, CreditCard, Mail, Phone, MapPin, Save, X } from 'lucide-react';

interface EditOwnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOwnerUpdated: () => void;
  owner: Owner | null;
}

export function EditOwnerModal({ isOpen, onClose, onOwnerUpdated, owner }: EditOwnerModalProps) {
  const [formData, setFormData] = useState<Omit<Owner, 'id'>>({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Actualizar el estado cuando cambia el dueño
  useEffect(() => {
    if (owner) {
      setFormData({
        nombre: owner.nombre || '',
        apellido: owner.apellido || '',
        rut: owner.rut || '',
        email: owner.email || '',
        telefono: owner.telefono || '',
        direccion: owner.direccion || '',
      });
    }
  }, [owner]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner) return;

    setLoading(true);

    try {
      // Actualizar información en Firestore
      await updateOwner(owner.id, formData);

      toast({
        title: 'Dueño actualizado',
        description: 'El dueño ha sido actualizado exitosamente',
        duration: 5000
      });

      onOwnerUpdated();
      onClose();
    } catch (error: any) {
      console.error('Error al actualizar dueño:', error);
      
      let errorMessage = 'Error al actualizar el dueño';
      
      // Manejar errores específicos de Firestore
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'No tienes permisos para editar dueños';
            break;
          case 'not-found':
            errorMessage = 'El dueño no fue encontrado';
            break;
          case 'unavailable':
            errorMessage = 'El servicio no está disponible. Intenta más tarde';
            break;
          case 'unauthenticated':
            errorMessage = 'Debes iniciar sesión para editar dueños';
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

  if (!owner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Editar Dueño
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Nombre
            </Label>
            <Input
              id="nombre"
              name="nombre"
              type="text"
              value={formData.nombre}
              onChange={handleInputChange}
              placeholder="Nombre completo"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="apellido" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Apellido
            </Label>
            <Input
              id="apellido"
              name="apellido"
              type="text"
              value={formData.apellido}
              onChange={handleInputChange}
              placeholder="Apellido"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rut" className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              RUT
            </Label>
            <Input
              id="rut"
              name="rut"
              type="text"
              value={formData.rut}
              onChange={handleInputChange}
              placeholder="RUT"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="correo@ejemplo.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="telefono" className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Teléfono
            </Label>
            <Input
              id="telefono"
              name="telefono"
              type="tel"
              value={formData.telefono}
              onChange={handleInputChange}
              placeholder="+56 9 1234 5678"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="direccion" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Dirección
            </Label>
            <Input
              id="direccion"
              name="direccion"
              type="text"
              value={formData.direccion}
              onChange={handleInputChange}
              placeholder="Dirección completa"
            />
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex items-center gap-2">
              <X className="w-4 h-4" />
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 