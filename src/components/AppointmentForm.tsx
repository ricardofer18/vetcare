import React, { useState, useEffect } from 'react';
import { searchPatients, searchOwners, Patient, Owner, addOwner, addPatient } from '../lib/firestore';

interface AppointmentFormProps {
  selectedDate: Date | null;
  selectedEvent?: any;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDate,
  selectedEvent,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [tipoAtencion, setTipoAtencion] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [notas, setNotas] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showNewPatientForm, setShowNewPatientForm] = useState(false);
  const [newPatientData, setNewPatientData] = useState({
    name: '',
    species: '',
    breed: '',
    age: '',
    gender: '',
    ownerId: '',
    ownerName: '',
    ownerPhone: '',
    ownerEmail: ''
  });

  // Datos de ejemplo para dropdowns
  const tiposAtencion = ['Consulta', 'Cirugía', 'Vacunación', 'Control'];
  const veterinarios = ['Dr. Carlos Mendoza', 'Dra. Laura', 'Dr. Andrés'];

  useEffect(() => {
    if (selectedEvent) {
      // Cargar datos del evento seleccionado
      setTipoAtencion(selectedEvent.tipoAtencion);
      setVeterinario(selectedEvent.veterinarian);
      setNotas(selectedEvent.notes || '');
      setAppointmentTime(selectedEvent.start.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }));
    }
  }, [selectedEvent]);

  useEffect(() => {
    const searchPatientsAndOwners = async () => {
      if (searchTerm.length < 3) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        const patients = await searchPatients(searchTerm);
        setSearchResults(patients);
      } catch (error) {
        console.error('Error searching patients:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchPatientsAndOwners, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !tipoAtencion || !veterinario || !appointmentTime || !selectedDate) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const appointmentData = {
      date: selectedDate.toISOString().split('T')[0],
      time: appointmentTime,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      ownerId: selectedOwner?.id,
      ownerName: selectedOwner?.name,
      tipoAtencion,
      veterinario,
      notas,
    };
    onSave(appointmentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">
            {selectedEvent ? 'Editar Cita' : 'Nueva Cita'}
          </h3>
          <button onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none">
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="fecha">
                Fecha:
              </label>
              <input
                type="text"
                id="fecha"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 cursor-not-allowed"
                value={selectedDate?.toLocaleDateString() || '--/--/----'}
                disabled
              />
            </div>
            <div>
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="hora">
                Hora:
              </label>
              <input
                type="time"
                id="hora"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="tipoAtencion">
              Tipo de Atención:
            </label>
            <select
              id="tipoAtencion"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              value={tipoAtencion}
              onChange={(e) => setTipoAtencion(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {tiposAtencion.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="veterinario">
              Veterinario:
            </label>
            <select
              id="veterinario"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              value={veterinario}
              onChange={(e) => setVeterinario(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {veterinarios.map(vet => <option key={vet} value={vet}>{vet}</option>)}
            </select>
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="notas">
              Notas:
            </label>
            <textarea
              id="notas"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Ingrese notas o comentarios importantes..."
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-4">
            <button
              type="button"
              className="bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-700 text-gray-800 dark:text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={!selectedPatient}
            >
              {selectedEvent ? 'Actualizar Cita' : 'Guardar Cita'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm; 