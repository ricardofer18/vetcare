"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { getAppointments, deleteAppointment } from '../../lib/firestore';
import { Appointment } from '../../types';
import { PlusCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import AppointmentForm from '../../components/AppointmentForm';
import { Switch } from '@/components/ui/switch';
import { Label as UILabel } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { GlobalLoading } from '@/components/ui/loading-spinner';
import { CalendarDayButton } from '@/components/ui/calendar';
import { DayButton } from 'react-day-picker';
import { cn } from '@/lib/utils';
import { CanCreateCitas, DisabledButton } from '@/components/RoleGuard';

// Tip: Mapear los tipos de cita a colores para consistencia visual
const appointmentTypeColors: { [key: string]: string } = {
  'Consulta': 'bg-blue-500',
  'Cirugía': 'bg-red-500',
  'Vacunación': 'bg-green-500',
  'Control': 'bg-yellow-500',
  'Otro': 'bg-gray-500',
};

// Componente personalizado para mostrar puntos en los días con citas
function DayButtonWithDots({ 
  day, 
  modifiers, 
  appointments,
  ...props 
}: React.ComponentProps<typeof DayButton> & { appointments: Appointment[] }) {
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter(app => app.date === dateStr);
  };

  const dayAppointments = getAppointmentsForDate(day.date);
  const hasAppointments = dayAppointments.length > 0;

  return (
    <div className="relative w-full h-full">
      <CalendarDayButton
        day={day}
        modifiers={modifiers}
        {...props}
      />
      {hasAppointments && (
        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
          {dayAppointments.slice(0, 3).map((appointment, index) => (
            <div
              key={`${day.date.toISOString()}-${index}`}
              className={`w-1.5 h-1.5 rounded-full ${
                appointmentTypeColors[appointment.type] || 'bg-gray-500'
              }`}
              title={`${appointment.patientName} - ${appointment.type}`}
            />
          ))}
          {dayAppointments.length > 3 && (
            <div 
              className="w-1.5 h-1.5 rounded-full bg-gray-400" 
              title={`+${dayAppointments.length - 3} más`} 
            />
          )}
        </div>
      )}
    </div>
  );
}

export default function AgendaPage() {
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setLoading(true);
        const fetchedAppointments = await getAppointments();
        console.log('Citas cargadas:', fetchedAppointments);
        setAppointments(fetchedAppointments);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido al cargar citas.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleAppointmentSave = async () => {
    setIsFormOpen(false);
    setLoading(true);
    try {
      const fetchedAppointments = await getAppointments();
      console.log('Citas recargadas:', fetchedAppointments);
      setAppointments(fetchedAppointments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al recargar citas.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAppointment = async (appointmentId: string, patientName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la cita de ${patientName}?`)) {
      try {
        await deleteAppointment(appointmentId);
        toast({
          title: "Cita eliminada",
          description: "La cita ha sido eliminada exitosamente.",
        });
        const fetchedAppointments = await getAppointments();
        setAppointments(fetchedAppointments);
      } catch (error) {
        console.error('Error al eliminar cita:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la cita. Inténtalo de nuevo.",
          variant: "destructive",
        });
      }
    }
  };

  const selectedDayAppointments = appointments.filter(app => {
    const selectedDateStr = date ? date.toISOString().split('T')[0] : '';
    const isSameDay = app.date === selectedDateStr;
    const shouldShow = showCompleted || app.status !== 'Completada';
    
    console.log(`Cita ${app.id}: fecha=${app.date}, hora=${app.time}, fechaSeleccionada=${selectedDateStr}, esMismoDia=${isSameDay}, mostrar=${shouldShow}`);
    return isSameDay && shouldShow;
  }).sort((a, b) => a.time.localeCompare(b.time));

  const workDayHours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <GlobalLoading isLoading={loading}>
      <div className="flex-1 overflow-y-auto bg-background">
        <div className="container mx-auto py-6 px-4">
          <Header title="Agenda" />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
            {/* Columna Izquierda: Calendario y Acciones */}
            <div className="md:col-span-1 space-y-6">
              <Card>
                <CardContent className="p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md"
                    components={{
                      DayButton: (props) => (
                        <DayButtonWithDots 
                          {...props} 
                          appointments={appointments}
                        />
                      ),
                    }}
                    classNames={{
                      root: "w-full",
                      day: "relative w-full h-full p-0 text-center [&:first-child[data-selected=true]_button]:rounded-l-md [&:last-child[data-selected=true]_button]:rounded-r-md group/day aspect-square select-none",
                    }}
                  />
                  
                  {/* Estilos CSS para los puntos de citas */}
                  <style jsx global>{`
                    .rdp-day[data-has-appointments="true"]::after {
                      content: '';
                      position: absolute;
                      bottom: 2px;
                      left: 50%;
                      transform: translateX(-50%);
                      width: 6px;
                      height: 6px;
                      background-color: #3b82f6;
                      border-radius: 50%;
                      z-index: 10;
                    }
                    
                    .rdp-day[data-has-appointments="true"]:hover::after {
                      background-color: #2563eb;
                    }
                  `}</style>
                </CardContent>
              </Card>
              
              {/* Leyenda de colores */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Tipos de Cita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {Object.entries(appointmentTypeColors).map(([type, color]) => (
                    <div key={type} className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm text-muted-foreground">{type}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
              
              <DisabledButton
                resource="citas"
                action="create"
                className="w-full"
                size="lg"
                tooltip="Agendar una nueva cita en el calendario"
                onClick={() => setIsFormOpen(true)}
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Agendar Nueva Cita
              </DisabledButton>
            </div>

            {/* Columna Derecha: Visualización de Citas del Día */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                      Citas para el {date ? date.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '...'}
                    </CardTitle>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-completed"
                        checked={showCompleted}
                        onCheckedChange={setShowCompleted}
                      />
                      <UILabel htmlFor="show-completed" className="text-sm">
                        {showCompleted ? (
                          <>
                            <Eye className="w-4 h-4 inline mr-1" />
                            Ocultar completadas
                          </>
                        ) : (
                          <>
                            <EyeOff className="w-4 h-4 inline mr-1" />
                            Mostrar completadas
                          </>
                        )}
                      </UILabel>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {error ? (
                    <p className="text-destructive text-center py-8">{error}</p>
                  ) : (
                    <div className="max-h-[600px] overflow-y-auto">
                      <div className="space-y-1">
                        {workDayHours.map(hour => {
                          const appointmentsInHour = selectedDayAppointments.filter(app => {
                            // Extraer la hora de la cita (formato HH:mm)
                            const timeParts = app.time.split(':');
                            if (timeParts.length >= 1) {
                              const appointmentHour = parseInt(timeParts[0], 10);
                              console.log(`Cita ${app.id}: hora=${app.time}, horaExtraida=${appointmentHour}, horaFiltro=${hour}`);
                              return appointmentHour === hour;
                            }
                            return false;
                          });

                          return (
                            <div key={hour} className="flex min-h-[3rem]">
                              <div className="w-16 text-right pr-4 pt-1">
                                <span className="text-sm font-semibold text-muted-foreground">
                                  {`${String(hour).padStart(2, '0')}:00`}
                                </span>
                              </div>
                              <div className="w-full border-l border-border pl-4 space-y-1 py-1">
                                {appointmentsInHour.length > 0 ? (
                                  appointmentsInHour.map(app => (
                                    <div 
                                      key={app.id} 
                                      className={`flex items-start gap-3 p-2 rounded-lg ${
                                        app.status === 'Completada' 
                                          ? 'bg-muted/50 opacity-60' 
                                          : 'bg-muted'
                                      }`}
                                    >
                                      <div className={`mt-1 w-2 h-2 rounded-full ${
                                        app.status === 'Completada' 
                                          ? 'bg-gray-400' 
                                          : appointmentTypeColors[app.type] || 'bg-gray-400'
                                      }`}></div>
                                      <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${
                                          app.status === 'Completada' ? 'line-through' : ''
                                        }`}>
                                          {app.patientName}
                                        </p>
                                        <p className="text-xs text-muted-foreground">{app.type}</p>
                                        <p className="text-xs text-muted-foreground">{app.veterinarian}</p>
                                        {app.status === 'Completada' && (
                                          <p className="text-xs text-green-600 font-medium">✓ Completada</p>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-mono text-xs flex-shrink-0">{app.time}</p>
                                        {app.status !== 'Completada' && (
                                          <DisabledButton
                                            resource="citas"
                                            action="delete"
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 text-destructive hover:text-destructive"
                                            tooltip="Eliminar esta cita"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteAppointment(app.id, app.patientName);
                                            }}
                                          >
                                            <Trash2 className="h-3 w-3" />
                                          </DisabledButton>
                                        )}
                                      </div>
                                    </div>
                                  ))
                                ) : (
                                  <div className="h-full border-t border-transparent"></div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {isFormOpen && (
          <AppointmentForm 
            selectedDate={date || new Date()}
            onClose={() => setIsFormOpen(false)}
            onSave={handleAppointmentSave}
          />
        )}
      </div>
    </GlobalLoading>
  );
} 