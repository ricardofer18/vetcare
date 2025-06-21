"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mascota } from '@/types';
import { useToast } from '@/components/ui/use-toast';
import { Save, X, Sparkles } from 'lucide-react';
import { AITextarea } from '@/components/ui/ai-textarea';
import { ScrollArea } from '@/components/ui/scroll-area';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Mascota;
  onPatientUpdated: () => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  paciente,
  onPatientUpdated
}) => {
  const [formData, setFormData] = useState({
    nombre: '',
    especie: '',
    raza: '',
    edad: 0,
    peso: 0,
    fechaNacimiento: '',
    sexo: 'Macho' as 'Macho' | 'Hembra',
    color: '',
    observaciones: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (paciente) {
      setFormData({
        nombre: paciente.nombre || '',
        especie: paciente.especie || '',
        raza: paciente.raza || '',
        edad: paciente.edad || 0,
        peso: paciente.peso || 0,
        fechaNacimiento: paciente.fechaNacimiento || '',
        sexo: paciente.sexo || 'Macho',
        color: paciente.color || '',
        observaciones: paciente.observaciones || ''
      });
    }
  }, [paciente]);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nombre || !formData.especie || !formData.raza) {
      toast({
        title: 'Error',
        description: 'Por favor completa los campos obligatorios',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const mascotaRef = doc(db, `duenos/${paciente.duenoId}/mascotas/${paciente.id}`);
      
      await updateDoc(mascotaRef, {
        nombre: formData.nombre,
        especie: formData.especie,
        raza: formData.raza,
        edad: Number(formData.edad),
        peso: formData.peso > 0 ? Number(formData.peso) : null,
        fechaNacimiento: formData.fechaNacimiento || null,
        sexo: formData.sexo,
        color: formData.color || null,
        observaciones: formData.observaciones || null
      });

      toast({
        title: 'Éxito',
        description: 'Paciente actualizado correctamente',
      });

      onPatientUpdated();
    } catch (error) {
      console.error('Error al actualizar paciente:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el paciente',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Editar Paciente - {paciente.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6 pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nombre">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => handleInputChange('nombre', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="especie">Especie *</Label>
                <Input
                  id="especie"
                  value={formData.especie}
                  onChange={(e) => handleInputChange('especie', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="raza">Raza *</Label>
                <Input
                  id="raza"
                  value={formData.raza}
                  onChange={(e) => handleInputChange('raza', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="edad">Edad (años) *</Label>
                <Input
                  id="edad"
                  type="number"
                  min="0"
                  value={formData.edad}
                  onChange={(e) => handleInputChange('edad', Number(e.target.value))}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="peso">Peso (kg)</Label>
                <Input
                  id="peso"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.peso}
                  onChange={(e) => handleInputChange('peso', Number(e.target.value))}
                />
              </div>
              
              <div>
                <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                <Input
                  id="fechaNacimiento"
                  type="date"
                  value={formData.fechaNacimiento}
                  onChange={(e) => handleInputChange('fechaNacimiento', e.target.value)}
                />
              </div>
              
              <div>
                <Label htmlFor="sexo">Sexo</Label>
                <Select value={formData.sexo} onValueChange={(value) => handleInputChange('sexo', value as 'Macho' | 'Hembra')}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Macho">Macho</SelectItem>
                    <SelectItem value="Hembra">Hembra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="color">Color</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <AITextarea
                value={formData.observaciones}
                onChange={(value) => handleInputChange('observaciones', value)}
                placeholder="Observaciones adicionales sobre el paciente..."
                label="Observaciones del Paciente"
                field="observaciones"
                mascotaInfo={{
                  nombre: paciente.nombre,
                  especie: paciente.especie,
                  raza: paciente.raza,
                  edad: paciente.edad,
                  peso: paciente.peso,
                  sexo: paciente.sexo,
                }}
                minHeight="min-h-[100px]"
              />
            </div>
            
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
              >
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
              >
                <Save className="w-4 h-4 mr-2" />
                {isLoading ? 'Guardando...' : 'Guardar Cambios'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}; 