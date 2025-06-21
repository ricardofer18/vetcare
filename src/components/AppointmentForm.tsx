"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { addAppointment } from '@/lib/firestore';
import { Appointment } from '@/types';
import { CalendarIcon, Clock, Stethoscope } from 'lucide-react';

// Esquema de validación con Zod
const appointmentSchema = z.object({
  time: z.string().min(1, "La hora es obligatoria."),
  type: z.enum(['Consulta', 'Cirugía', 'Vacunación', 'Control', 'Otro']),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  selectedDate: Date;
  onClose: () => void;
  onSave: () => void;
}

export default function AppointmentForm({ selectedDate, onClose, onSave }: AppointmentFormProps) {
  const { toast } = useToast();

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      time: '',
      notes: '',
    },
  });

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      console.log('Datos del formulario:', data);
      const newAppointment: Omit<Appointment, 'id'> = {
        patientId: '', // Se asignará después
        patientName: 'Pendiente', // Se asignará después
        ownerId: '', // Se asignará después
        ownerName: 'Pendiente', // Se asignará después
        date: selectedDate.toISOString().split('T')[0],
        time: data.time,
        type: data.type,
        status: 'Programada',
        notes: data.notes,
        veterinarian: 'Pendiente', // Se asignará después
      };
      console.log('Cita a guardar:', newAppointment);
      await addAppointment(newAppointment);
      toast({
        title: "Hora Agendada",
        description: `Se ha agendado la hora para el ${selectedDate.toLocaleDateString('es-ES')} a las ${data.time}. Ve a la sección de Consultas para asignar paciente y crear la consulta.`,
      });
      onSave();
      form.reset();
      } catch (error) {
      console.error('Error al agendar cita:', error);
      toast({
        title: "Error",
        description: "No se pudo agendar la cita. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            Agendar Nueva Cita
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Agendando para el: <span className="font-semibold text-foreground">{selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </p>

            <FormField control={form.control} name="time" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Clock className="w-4 h-4" /> Hora</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="type" render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-2"><Stethoscope className="w-4 h-4" /> Tipo de Atención</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Consulta">Consulta</SelectItem>
                    <SelectItem value="Cirugía">Cirugía</SelectItem>
                    <SelectItem value="Vacunación">Vacunación</SelectItem>
                    <SelectItem value="Control">Control</SelectItem>
                    <SelectItem value="Otro">Otro</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}/>

            <FormField control={form.control} name="notes" render={({ field }) => (
              <FormItem>
                <FormLabel>Notas Adicionales</FormLabel>
                <FormControl>
                  <Textarea placeholder="Anotaciones importantes sobre la cita..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}/>

            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Agendando..." : "Agendar Cita"}
              </Button>
            </DialogFooter>
        </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 