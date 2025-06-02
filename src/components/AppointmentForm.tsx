import React, { useState, useEffect } from 'react';
import { searchPatients, searchOwners, Patient, Owner, addOwner, addPatient } from '../lib/firestore';

interface AppointmentFormProps {
  selectedDate: Date | null;
  onClose: () => void;
  onSave: (appointmentData: any) => void;
}

const AppointmentForm: React.FC<AppointmentFormProps> = ({
  selectedDate,
  onClose,
  onSave,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [tipoAtencion, setTipoAtencion] = useState('');
  const [veterinario, setVeterinario] = useState('');
  const [duracion, setDuracion] = useState('');
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
  const tiposAtencion = ['Consulta General', 'Cirugía', 'Vacuna', 'Peluquería'];
  const veterinarios = ['Dr. Carlos Mendoza', 'Dra. Laura', 'Dr. Andrés'];
  const duraciones = ['15 minutos', '30 minutos', '45 minutos', '1 hora'];

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

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedOwner(patient.ownerDetails || null);
    setSearchTerm('');
    setSearchResults([]);
  };

  const handleNewPatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Primero crear el dueño
      const ownerData = {
        name: newPatientData.ownerName,
        phone: newPatientData.ownerPhone,
        email: newPatientData.ownerEmail
      };
      const ownerId = await addOwner(ownerData);

      // Luego crear la mascota
      const patientData = {
        name: newPatientData.name,
        species: newPatientData.species,
        breed: newPatientData.breed,
        age: newPatientData.age,
        gender: newPatientData.gender,
        ownerId: ownerId,
        owner: newPatientData.ownerName,
        image: '',
        code: '',
        veterinarian: '',
        lastAttention: '',
        status: 'Activo' as const,
        ownerDetails: {
          id: ownerId,
          name: newPatientData.ownerName,
          phone: newPatientData.ownerPhone,
          email: newPatientData.ownerEmail
        }
      };
      const patientId = await addPatient(patientData);

      // Seleccionar la nueva mascota
      const newPatient = { id: patientId, ...patientData };
      handlePatientSelect(newPatient);
      setShowNewPatientForm(false);
      setNewPatientData({
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
    } catch (error) {
      console.error('Error creating new patient:', error);
      alert('Error al crear la nueva mascota. Por favor, intente nuevamente.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !tipoAtencion || !veterinario || !duracion || !appointmentTime || !selectedDate) {
      alert('Por favor, completa todos los campos obligatorios.');
      return;
    }

    const appointmentData = {
      date: selectedDate.toISOString().split('T')[0],
      time: appointmentTime,
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      tipoAtencion,
      veterinario,
      duracion,
      notas,
    };
    onSave(appointmentData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Nueva Cita</h3>
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
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="search">
              Buscar Mascota:
            </label>
            <div className="relative">
              <input
                type="text"
                id="search"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre de mascota o dueño..."
              />
              {isSearching && (
                <div className="absolute right-3 top-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                </div>
              )}
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-48 overflow-y-auto border rounded">
                {searchResults.map((patient) => (
                  <div
                    key={patient.id}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handlePatientSelect(patient)}
                  >
                    <div className="font-medium">{patient.name}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Dueño: {patient.ownerDetails?.name || patient.owner}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {selectedPatient && (
            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
              <h4 className="font-bold mb-2">Mascota Seleccionada:</h4>
              <p><span className="font-medium">Nombre:</span> {selectedPatient.name}</p>
              <p><span className="font-medium">Especie:</span> {selectedPatient.species}</p>
              <p><span className="font-medium">Raza:</span> {selectedPatient.breed}</p>
              <p><span className="font-medium">Dueño:</span> {selectedPatient.ownerDetails?.name || selectedPatient.owner}</p>
              <p><span className="font-medium">Teléfono:</span> {selectedPatient.ownerDetails?.phone}</p>
            </div>
          )}

          {!selectedPatient && !showNewPatientForm && (
            <div className="mb-4">
              <button
                type="button"
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                onClick={() => setShowNewPatientForm(true)}
              >
                + Registrar nueva mascota
              </button>
            </div>
          )}

          {showNewPatientForm && (
            <div className="mb-4 p-4 border rounded">
              <h4 className="font-bold mb-3">Registrar Nueva Mascota</h4>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPatientName">Nombre de la Mascota</label>
                  <input
                    type="text"
                    id="newPatientName"
                    className="w-full p-2 border rounded"
                    value={newPatientData.name}
                    onChange={(e) => setNewPatientData({...newPatientData, name: e.target.value})}
                    required
                    placeholder="Ingrese el nombre de la mascota"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPatientSpecies">Especie</label>
                  <input
                    type="text"
                    id="newPatientSpecies"
                    className="w-full p-2 border rounded"
                    value={newPatientData.species}
                    onChange={(e) => setNewPatientData({...newPatientData, species: e.target.value})}
                    required
                    placeholder="Ingrese la especie"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPatientBreed">Raza</label>
                  <input
                    type="text"
                    id="newPatientBreed"
                    className="w-full p-2 border rounded"
                    value={newPatientData.breed}
                    onChange={(e) => setNewPatientData({...newPatientData, breed: e.target.value})}
                    required
                    placeholder="Ingrese la raza"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPatientAge">Edad</label>
                  <input
                    type="number"
                    id="newPatientAge"
                    className="w-full p-2 border rounded"
                    value={newPatientData.age}
                    onChange={(e) => setNewPatientData({...newPatientData, age: e.target.value})}
                    required
                    placeholder="Ingrese la edad"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newPatientGender">Género</label>
                  <select
                    id="newPatientGender"
                    className="w-full p-2 border rounded"
                    value={newPatientData.gender}
                    onChange={(e) => setNewPatientData({...newPatientData, gender: e.target.value})}
                    required
                    title="Seleccione el género de la mascota"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Macho">Macho</option>
                    <option value="Hembra">Hembra</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newOwnerName">Nombre del Dueño</label>
                  <input
                    type="text"
                    id="newOwnerName"
                    className="w-full p-2 border rounded"
                    value={newPatientData.ownerName}
                    onChange={(e) => setNewPatientData({...newPatientData, ownerName: e.target.value})}
                    required
                    placeholder="Ingrese el nombre del dueño"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newOwnerPhone">Teléfono del Dueño</label>
                  <input
                    type="tel"
                    id="newOwnerPhone"
                    className="w-full p-2 border rounded"
                    value={newPatientData.ownerPhone}
                    onChange={(e) => setNewPatientData({...newPatientData, ownerPhone: e.target.value})}
                    required
                    placeholder="Ingrese el teléfono del dueño"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="newOwnerEmail">Email del Dueño</label>
                  <input
                    type="email"
                    id="newOwnerEmail"
                    className="w-full p-2 border rounded"
                    value={newPatientData.ownerEmail}
                    onChange={(e) => setNewPatientData({...newPatientData, ownerEmail: e.target.value})}
                    required
                    placeholder="Ingrese el email del dueño"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                    onClick={() => setShowNewPatientForm(false)}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={handleNewPatientSubmit}
                  >
                    Guardar
                  </button>
                </div>
              </div>
            </div>
          )}

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

          <div className="mb-4">
            <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="duracion">
              Duración:
            </label>
            <select
              id="duracion"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600"
              value={duracion}
              onChange={(e) => setDuracion(e.target.value)}
              required
            >
              <option value="">Seleccione...</option>
              {duraciones.map(d => <option key={d} value={d}>{d}</option>)}
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
              Guardar Cita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AppointmentForm; 