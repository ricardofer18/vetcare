'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Patient, ConsultaFormData } from '@/types';
import { AITextarea } from '@/components/ui/ai-textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  motivo: z.string().min(1, 'El motivo es requerido'),
  sintomas: z.string().min(1, 'Los síntomas son requeridos'),
  diagnostico: z.string().min(1, 'El diagnóstico es requerido'),
  tratamiento: z.string().min(1, 'El tratamiento es requerido'),
  proximaCita: z.string().optional(),
});

interface ConsultaFormProps {
  mascota: Patient | null;
  onConsultaCreated: (data: ConsultaFormData) => void;
}

export function ConsultaForm({ mascota, onConsultaCreated }: ConsultaFormProps) {
  const [showProximaCita, setShowProximaCita] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      motivo: '',
      sintomas: '',
      diagnostico: '',
      tratamiento: '',
      proximaCita: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onConsultaCreated(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4">
          {/* Datos de paciente y dueño */}
          {mascota ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel>Paciente</FormLabel>
                <Input value={mascota.nombre} disabled className="bg-muted" />
              </div>
              <div>
                <FormLabel>Dueño</FormLabel>
                <Input value={mascota.dueno?.nombre || ''} disabled className="bg-muted" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel>Paciente</FormLabel>
                <Input placeholder="Nombre del paciente" required />
              </div>
              <div>
                <FormLabel>Dueño</FormLabel>
                <Input placeholder="Nombre del dueño" required />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="motivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo de la consulta</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el motivo de la consulta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sintomas"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AITextarea
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describa los síntomas presentados"
                    label="Síntomas"
                    field="sintomas"
                    mascotaInfo={mascota ? {
                      nombre: mascota.nombre,
                      especie: mascota.especie,
                      raza: mascota.raza,
                      edad: mascota.edad,
                      peso: mascota.peso,
                      sexo: mascota.sexo,
                    } as any : undefined}
                    motivo={form.watch('motivo')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diagnostico"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AITextarea
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ingrese el diagnóstico"
                    label="Diagnóstico"
                    field="diagnostico"
                    mascotaInfo={mascota ? {
                      nombre: mascota.nombre,
                      especie: mascota.especie,
                      raza: mascota.raza,
                      edad: mascota.edad,
                      peso: mascota.peso,
                      sexo: mascota.sexo,
                    } as any : undefined}
                    motivo={form.watch('motivo')}
                    sintomas={form.watch('sintomas')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tratamiento"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AITextarea
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describa el tratamiento indicado"
                    label="Tratamiento"
                    field="tratamiento"
                    mascotaInfo={mascota ? {
                      nombre: mascota.nombre,
                      especie: mascota.especie,
                      raza: mascota.raza,
                      edad: mascota.edad,
                      peso: mascota.peso,
                      sexo: mascota.sexo,
                    } as any : undefined}
                    motivo={form.watch('motivo')}
                    sintomas={form.watch('sintomas')}
                    diagnostico={form.watch('diagnostico')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="proximaCita"
              checked={showProximaCita}
              onCheckedChange={(checked) => setShowProximaCita(checked as boolean)}
            />
            <label
              htmlFor="proximaCita"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Programar próxima cita
            </label>
          </div>

          {showProximaCita && (
            <FormField
              control={form.control}
              name="proximaCita"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de próxima cita</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <Button type="submit" className="w-full">
          Guardar Consulta
        </Button>
      </form>
    </Form>
  );
} 