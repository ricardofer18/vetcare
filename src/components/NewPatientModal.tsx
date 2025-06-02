import React, { useState } from 'react';
import { addOwner, addPatient, Owner, Patient } from '../lib/firestore';

interface NewPatientModalProps {
  onClose: () => void;
  onPatientCreated: (patient: Patient) => void;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ onClose, onPatientCreated }) => {
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

  const handleSubmit = async (e: React.FormEvent) => {
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

      // Notificar al componente padre sobre la nueva mascota creada
      const newPatient = { id: patientId, ...patientData };
      onPatientCreated(newPatient);
      onClose();
    } catch (error) {
      console.error('Error creating new patient:', error);
      alert('Error al crear la nueva mascota. Por favor, intente nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Registrar Nueva Mascota</h3>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-2xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="newPatientName">
              Nombre de la Mascota
            </label>
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
            <label className="block text-sm font-medium mb-1" htmlFor="newPatientSpecies">
              Especie
            </label>
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
            <label className="block text-sm font-medium mb-1" htmlFor="newPatientBreed">
              Raza
            </label>
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
            <label className="block text-sm font-medium mb-1" htmlFor="newPatientAge">
              Edad
            </label>
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
            <label className="block text-sm font-medium mb-1" htmlFor="newPatientGender">
              Género
            </label>
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

          <div className="border-t pt-4 mt-4">
            <h4 className="font-bold mb-3">Datos del Dueño</h4>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="newOwnerName">
                Nombre del Dueño
              </label>
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

            <div className="mt-3">
              <label className="block text-sm font-medium mb-1" htmlFor="newOwnerPhone">
                Teléfono del Dueño
              </label>
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

            <div className="mt-3">
              <label className="block text-sm font-medium mb-1" htmlFor="newOwnerEmail">
                Email del Dueño
              </label>
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
          </div>

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPatientModal; 