"use client";

import React, { useState, useMemo, useEffect } from 'react';
import AppointmentForm from '../../components/AppointmentForm';
import { Calendar, momentLocalizer, Views, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-overrides.css';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, Appointment } from '../../lib/firestore';
import { Header } from '@/components/Header';

// Setup the localizer
const localizer = momentLocalizer(moment);

// Configuración de las vistas disponibles
const views = {
  month: true,
  week: true,
  day: true,
  agenda: true
};

// Configuración de los horarios de trabajo
const minTime = new Date();
minTime.setHours(8, 0, 0);
const maxTime = new Date();
maxTime.setHours(20, 0, 0);

export default function AgendaCitasPage() {
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedView, setSelectedView] = useState<View>(Views.WEEK);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointments = await getAppointments();
        const calendarEvents = appointments.map(appointment => ({
          id: appointment.id,
          title: `${appointment.patientName} - ${appointment.type}`,
          start: new Date(`${appointment.date}T${appointment.time}`),
          end: new Date(new Date(`${appointment.date}T${appointment.time}`).getTime() + getTimeDuration(appointment.type)),
          tipoAtencion: appointment.type,
          status: appointment.status,
          notes: appointment.notes,
          veterinarian: appointment.veterinarian
        }));
        setEvents(calendarEvents);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        if (err instanceof Error) {
          setError(`Error al cargar citas: ${err.message}`);
        } else {
          setError("Error desconocido al cargar citas");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedDateRange({ start, end });
    setIsFormVisible(true);
    setSelectedEvent(null);
  };

  const handleSelectEvent = (event: any) => {
    setSelectedEvent(event);
    setIsFormVisible(true);
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setSelectedDateRange(null);
    setSelectedEvent(null);
  };

  const handleAppointmentSave = async (appointmentData: any) => {
    try {
      const newAppointment: Omit<Appointment, 'id'> = {
        patientId: appointmentData.patientId,
        patientName: appointmentData.mascota,
        ownerId: appointmentData.ownerId,
        ownerName: appointmentData.ownerName,
        date: appointmentData.date,
        time: appointmentData.time,
        type: appointmentData.tipoAtencion,
        veterinarian: appointmentData.veterinario,
        notes: appointmentData.notas,
        status: 'Programada'
      };

      const appointmentId = await addAppointment(newAppointment);
      
      const newEvent = {
        id: appointmentId,
        title: `${appointmentData.mascota} - ${appointmentData.tipoAtencion}`,
        start: new Date(`${appointmentData.date}T${appointmentData.time}`),
        end: new Date(new Date(`${appointmentData.date}T${appointmentData.time}`).getTime() + getTimeDuration(appointmentData.tipoAtencion)),
        tipoAtencion: appointmentData.tipoAtencion,
        status: 'Programada',
        notes: appointmentData.notas,
        veterinarian: appointmentData.veterinario
      };
      
      setEvents([...events, newEvent]);
      setIsFormVisible(false);
      setSelectedDateRange(null);
    } catch (err) {
      console.error("Error saving appointment:", err);
      alert('Error al guardar la cita. Por favor, intente nuevamente.');
    }
  };

  const getTimeDuration = (type: string): number => {
    switch (type) {
      case 'Consulta':
        return 30 * 60 * 1000; // 30 minutos
      case 'Cirugía':
        return 120 * 60 * 1000; // 2 horas
      case 'Vacunación':
        return 15 * 60 * 1000; // 15 minutos
      case 'Control':
        return 20 * 60 * 1000; // 20 minutos
      default:
        return 30 * 60 * 1000; // 30 minutos por defecto
    }
  };

  const eventPropGetter = (event: any) => {
    let className = '';
    switch (event.tipoAtencion) {
      case 'Consulta':
        className = 'bg-blue-500';
        break;
      case 'Cirugía':
        className = 'bg-red-500';
        break;
      case 'Vacunación':
        className = 'bg-green-500';
        break;
      case 'Control':
        className = 'bg-yellow-500';
        break;
      default:
        className = 'bg-gray-500';
        break;
    }

    if (event.status === 'Cancelada') {
      className += ' opacity-50';
    }

    return {
      className: `${className} text-white`,
    };
  };

  const memoizedEvents = useMemo(() => events, [events]);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto py-6 px-4">
        <Header title="Agenda de Citas" />
        
        {loading && (
          <div className="flex items-center justify-center h-[600px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex-1 h-[600px]">
            <Calendar
              localizer={localizer}
              events={memoizedEvents}
              startAccessor="start"
              endAccessor="end"
              selectable
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              view={selectedView}
              onView={(view) => setSelectedView(view)}
              views={views}
              min={minTime}
              max={maxTime}
              eventPropGetter={eventPropGetter}
              popup
              step={30}
              timeslots={2}
              className="h-full"
              messages={{
                next: "Siguiente",
                previous: "Anterior",
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Día",
                agenda: "Agenda",
                date: "Fecha",
                time: "Hora",
                event: "Evento",
                noEventsInRange: "No hay citas en este rango"
              }}
            />
          </div>
        )}

        {isFormVisible && (
          <AppointmentForm 
            selectedDate={selectedDateRange ? selectedDateRange.start : null}
            selectedEvent={selectedEvent}
            onClose={handleFormClose}
            onSave={handleAppointmentSave}
          />
        )}
      </div>
    </div>
  );
} 