'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MascotaInput } from '@/types';
import { calcularEdad } from '@/lib/utils';
import { Combobox } from '@/components/ui/combobox';
import animalesWecos from '@/data/animales_wecos.json';

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
    edad: undefined,
    peso: undefined,
    fechaNacimiento: undefined,
    sexo: undefined,
    color: undefined,
    observaciones: undefined
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Calcular edad automáticamente cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (formData.fechaNacimiento) {
      const edadCalculada = calcularEdad(formData.fechaNacimiento);
      setFormData(prev => ({
        ...prev,
        edad: edadCalculada !== null ? edadCalculada : undefined
      }));
    }
  }, [formData.fechaNacimiento]);

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.nombre || formData.nombre.trim() === '') {
      newErrors.nombre = 'El nombre es obligatorio.';
    }
    if (!formData.especie || formData.especie.trim() === '') {
      newErrors.especie = 'La especie es obligatoria.';
    }
    if (!formData.raza || formData.raza.trim() === '') {
      newErrors.raza = 'La raza es obligatoria.';
    }
    if (!formData.fechaNacimiento && (formData.edad === undefined || isNaN(Number(formData.edad)) || Number(formData.edad) < 0)) {
      newErrors.edad = 'La edad es obligatoria si no hay fecha de nacimiento y debe ser mayor o igual a 0.';
    }
    if (formData.fechaNacimiento) {
      const fecha = new Date(formData.fechaNacimiento);
      const hoy = new Date();
      if (isNaN(fecha.getTime())) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento no es válida.';
      } else if (fecha > hoy) {
        newErrors.fechaNacimiento = 'La fecha de nacimiento no puede ser futura.';
      }
    }
    if (formData.peso !== undefined && formData.peso !== null && formData.peso < 0) {
      newErrors.peso = 'El peso debe ser mayor o igual a 0.';
    }
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      onMascotaCreated(formData);
    }
  };

  // Calcular edad para mostrar en el campo
  const edadCalculada = formData.fechaNacimiento ? calcularEdad(formData.fechaNacimiento) : undefined;
  const mostrarEdad = edadCalculada !== undefined && edadCalculada !== null ? edadCalculada : (formData.edad !== undefined && formData.edad !== null ? formData.edad : '');

  // Obtener especies y razas
  const especies = animalesWecos.animales.map((a: any) => a.especie);
  const razas = formData.especie
    ? (animalesWecos.animales.find((a: any) => a.especie === formData.especie)?.razas || [])
    : [];

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
          {errors.nombre && <p className="text-xs text-red-500 mt-1">{errors.nombre}</p>}
        </div>
        <div>
          <Label htmlFor="edad">Edad (años)</Label>
          <Input
            id="edad"
            type="number"
            min="0"
            value={mostrarEdad}
            onChange={(e) => setFormData(prev => ({ ...prev, edad: parseInt(e.target.value) }))}
            required
            readOnly={true}
            className="bg-muted cursor-not-allowed"
            placeholder="Edad"
          />
          {errors.edad && <p className="text-xs text-red-500 mt-1">{errors.edad}</p>}
          {formData.fechaNacimiento && edadCalculada !== undefined && edadCalculada !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              La edad se calcula automáticamente desde la fecha de nacimiento
            </p>
          )}
        </div>
        <div>
          <Combobox
            value={formData.especie}
            onChange={(value) => setFormData(prev => ({ ...prev, especie: value, raza: '' }))}
            options={especies}
            placeholder="Selecciona o escribe la especie"
            label="Especie"
          />
          {errors.especie && <p className="text-xs text-red-500 mt-1">{errors.especie}</p>}
        </div>
        <div>
          <Combobox
            value={formData.raza}
            onChange={(value) => setFormData(prev => ({ ...prev, raza: value }))}
            options={razas}
            placeholder={formData.especie ? "Selecciona o escribe la raza" : "Selecciona primero la especie"}
            label="Raza"
            disabled={!formData.especie}
          />
          {errors.raza && <p className="text-xs text-red-500 mt-1">{errors.raza}</p>}
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
          {errors.peso && <p className="text-xs text-red-500 mt-1">{errors.peso}</p>}
        </div>
        <div>
          <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
          <Input
            id="fechaNacimiento"
            type="date"
            value={formData.fechaNacimiento || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, fechaNacimiento: e.target.value }))}
          />
          {errors.fechaNacimiento && <p className="text-xs text-red-500 mt-1">{errors.fechaNacimiento}</p>}
          {formData.fechaNacimiento && edadCalculada !== undefined && edadCalculada !== null && (
            <p className="text-xs text-muted-foreground mt-1">
              Edad calculada: {edadCalculada} años
            </p>
          )}
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