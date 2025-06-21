'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MascotaInput } from '@/types';

interface MascotaFormProps {
  duenoId: string;
  onMascotaCreated: (mascota: MascotaInput) => void;
  onCancel?: () => void;
}

export function MascotaForm({ duenoId, onMascotaCreated, onCancel }: MascotaFormProps) {
  const [formData, setFormData] = useState<MascotaInput>({
    nombre: '',
    especie: '',
    raza: '',
    edad: 0,
    peso: undefined,
    fechaNacimiento: undefined,
    sexo: undefined,
    color: undefined,
    observaciones: undefined
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMascotaCreated(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombre">Nombre</Label>
          <Input
            id="nombre"
            value={formData.nombre}
            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="edad">Edad (años)</Label>
          <Input
            id="edad"
            type="number"
            min="0"
            value={formData.edad}
            onChange={(e) => setFormData(prev => ({ ...prev, edad: parseInt(e.target.value) }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="especie">Especie</Label>
          <Input
            id="especie"
            value={formData.especie}
            onChange={(e) => setFormData(prev => ({ ...prev, especie: e.target.value }))}
            required
          />
        </div>
        <div>
          <Label htmlFor="raza">Raza</Label>
          <Input
            id="raza"
            value={formData.raza}
            onChange={(e) => setFormData(prev => ({ ...prev, raza: e.target.value }))}
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
            value={formData.peso || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, peso: parseFloat(e.target.value) }))}
          />
        </div>
        <div>
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="sexo">Sexo</Label>
          <Select
            value={formData.sexo}
            onValueChange={(value) => setFormData(prev => ({ ...prev, sexo: value as 'Macho' | 'Hembra' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el sexo" />
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
            value={formData.color || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="observaciones">Observaciones</Label>
        <Textarea
          id="observaciones"
          value={formData.observaciones || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, observaciones: e.target.value }))}
          className="h-20"
        />
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit">Guardar</Button>
      </div>
    </form>
  );
} 