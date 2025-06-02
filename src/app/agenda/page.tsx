"use client";

import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import AppointmentForm from '../../components/AppointmentForm';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment'; // Using moment as localizer for simplicity
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar-overrides.css'; // Import custom overrides AFTER default css
import { getAppointments, addAppointment, updateAppointment, deleteAppointment, Appointment } from '../../lib/firestore';

// Setup the localizer
const localizer = momentLocalizer(moment);

export default function AgendaCitasPage() {
  const [selectedDateRange, setSelectedDateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [events, setEvents] = useState<any[]>([]); // State to hold calendar events
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const appointments = await getAppointments();
        const calendarEvents = appointments.map(appointment => ({
          id: appointment.id,
          title: `Cita: ${appointment.patientName} (${appointment.type})`,
          start: new Date(`${appointment.date}T${appointment.time}`),
          end: new Date(new Date(`${appointment.date}T${appointment.time}`).getTime() + getTimeDuration(appointment.duration)),
          tipoAtencion: appointment.type,
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
  };

  const handleFormClose = () => {
    setIsFormVisible(false);
    setSelectedDateRange(null); // Clear selected range on close
  };

  const handleAppointmentSave = async (appointmentData: any) => {
    try {
      const newAppointment: Omit<Appointment, 'id'> = {
        patientId: appointmentData.patientId,
        patientName: appointmentData.mascota,
        date: appointmentData.date,
        time: appointmentData.time,
        type: appointmentData.tipoAtencion,
        veterinarian: appointmentData.veterinario,
        duration: appointmentData.duracion,
        notes: appointmentData.notas,
        status: 'Programada'
      };

      const appointmentId = await addAppointment(newAppointment);
      
      const newEvent = {
        id: appointmentId,
        title: `Cita: ${appointmentData.mascota} (${appointmentData.tipoAtencion})`,
        start: new Date(`${appointmentData.date}T${appointmentData.time}`),
        end: new Date(new Date(`${appointmentData.date}T${appointmentData.time}`).getTime() + getTimeDuration(appointmentData.duracion)),
        tipoAtencion: appointmentData.tipoAtencion,
      };
      
      setEvents([...events, newEvent]);
      setIsFormVisible(false);
      setSelectedDateRange(null);
    } catch (err) {
      console.error("Error saving appointment:", err);
      alert('Error al guardar la cita. Por favor, intente nuevamente.');
    }
  };

  // Helper function to get duration in milliseconds
  const getTimeDuration = (duration: string): number => {
    switch (duration) {
      case '15 minutos': return 15 * 60 * 1000;
      case '30 minutos': return 30 * 60 * 1000;
      case '45 minutos': return 45 * 60 * 1000;
      case '1 hora': return 60 * 60 * 1000;
      default: return 30 * 60 * 1000; // Default to 30 minutes
    }
  };

  // Function to assign colors based on tipoAtencion
  const eventPropGetter = (event: any) => {
    let className = '';
    switch (event.tipoAtencion) {
      case 'Consulta General':
        className = 'bg-blue-500'; 
        break;
      case 'Cirugía':
        className = 'bg-red-500'; 
        break;
      case 'Vacuna':
        className = 'bg-green-500'; 
        break;
      case 'Peluquería':
        className = 'bg-yellow-500';
        break;
      default:
        className = 'bg-gray-500';
        break;
    }
     // Ensure text color is readable in dark mode
    const textColorClass = 'text-white'; 

    return {
      className: `${className} ${textColorClass}`,
      // style: { backgroundColor: 'blue' } // Alternative: use inline styles
    };
  };

   // Memoize events to prevent unnecessary re-renders
   const memoizedEvents = useMemo(() => events, [events]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra lateral */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex flex-col flex-1">
        {/* Aquí podrías tener una barra superior específica de la agenda si es necesario */}
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Agenda de Citas</h2>
          
          {loading && <p className="text-gray-300">Cargando citas...</p>}
          {error && <p className="text-red-500">Error: {error}</p>}
          
          {!loading && !error && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex-1 h-[600px]"> {/* Added height here */}
               <Calendar
                localizer={localizer}
                events={memoizedEvents}
                startAccessor="start"
                endAccessor="end"
                selectable // Permite seleccionar franjas de tiempo
                onSelectSlot={handleSelectSlot} // Maneja la selección de franjas de tiempo
                // onSelectEvent={handleSelectEvent} // Maneja clic en un evento existente si es necesario
                defaultView='week' // Vista por defecto (day, week, month, agenda)
                style={{ height: '100%' }} // Make calendar fill the container
                eventPropGetter={eventPropGetter} // Apply custom styles/classes to events
              />
            </div>
          )}

          {/* Formulario de agendar citas (visible condicionalmente) */}
          {isFormVisible && (
            <AppointmentForm 
              selectedDate={selectedDateRange ? selectedDateRange.start : null} // Pass the start date of the selected range
              onClose={handleFormClose}
              onSave={handleAppointmentSave}
            />
          )}

        </main>
      </div>
    </div>
  );
} 