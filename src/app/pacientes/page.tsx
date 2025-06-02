"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import PatientsTable, { Patient } from '../../components/PatientsTable';
import { getPatients, addPatient, updatePatient, deletePatient } from '../../lib/firestore';

// Datos de ejemplo de pacientes (simulando datos de Firebase)
// Eliminaremos esto una vez que carguemos desde Firestore
const samplePatients: Patient[] = [
    {
        id: "1",
        image: '/path/to/rocky-image.jpg',
        name: 'Rocky',
        code: '#PAT-0025',
        species: 'Perro / Labrador',
        age: '3 años',
        owner: 'Manuel López',
        veterinarian: 'Dr. Carlos Mendoza',
        lastAttention: '15/07/2023',
        status: 'Activo',
    },
     {
        id: "2",
        image: '/path/to/luna-image.jpg',
        name: 'Luna',
        code: '#PAT-0018',
        species: 'Gato / Siamés',
        age: '2 años',
        owner: 'María Rodríguez',
        veterinarian: 'Dra. Laura Pérez',
        lastAttention: '12/07/2023',
        status: 'En seguimiento',
    },
     {
        id: "3",
        image: '/path/to/milo-image.jpg',
        name: 'Milo',
        code: '#PAT-0023',
        species: 'Perro / Bulldog',
        age: '4 años',
        owner: 'Ana García',
        veterinarian: 'Dr. Carlos Mendoza',
        lastAttention: '10/07/2023',
        status: 'Activo',
    },
      {
        id: "4",
        image: '/path/to/max-image.jpg',
        name: 'Max',
        code: '#PAT-0021',
        species: 'Perro / Pastor Alemán',
        age: '5 años',
        owner: 'Lucas Martínez',
        veterinarian: 'Dr. Javier Rodríguez',
        lastAttention: '05/07/2023',
        status: 'Activo',
    },
     {
        id: "5",
        image: '/path/to/nina-image.jpg',
        name: 'Nina',
        code: '#PAT-0019',
        species: 'Perro / Cocker',
        age: '6 años',
        owner: 'Laura Pérez',
        veterinarian: 'Dra. Laura Pérez',
        lastAttention: '01/07/2023',
        status: 'Dado de alta',
    },
      {
        id: "6",
        image: '/path/to/toby-image.jpg',
        name: 'Toby',
        code: '#PAT-0015',
        species: 'Perro / Poodle',
        age: '2 años',
        owner: 'Carlos Sánchez',
        veterinarian: 'Dr. Carlos Mendoza',
        lastAttention: '28/06/2023',
        status: 'Activo',
    },
       {
        id: "7",
        image: '/path/to/paco-image.jpg',
        name: 'Paco',
        code: '#PAT-0010',
        species: 'Ave / Loro',
        age: '1 año',
        owner: 'José Torres',
        veterinarian: 'Dra. Laura Pérez',
        lastAttention: '15/06/2023',
        status: 'En seguimiento',
    },
  // Add more patient data as needed to test pagination
];

export default function PacientesPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const patientsPerPage = 7;
  const totalPages = Math.ceil(patients.length / patientsPerPage);

  // Fetch patients from Firestore
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const patientsData = await getPatients();
        setPatients(patientsData);
      } catch (err) {
        console.error("Error fetching patients:", err);
        if (err instanceof Error) {
          setError(`Error al cargar pacientes: ${err.message}`);
        } else {
          setError("Error desconocido al cargar pacientes");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const currentPatients = patients;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Calculate displayed items range for the text below the table
  const startIndex = (currentPage - 1) * patientsPerPage;
  const endIndex = startIndex + patientsPerPage;
  const displayedStart = startIndex + 1;
  const displayedEnd = Math.min(endIndex, patients.length);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />

      <div className="flex flex-col flex-1 bg-[#121212]">
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Pacientes</h2>
          
          {/* Sección de filtros y búsqueda */}
          <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="especie" className="sr-only">Especie</label>
                <select id="especie" className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="Todas">Especie: Todas</option>
                </select>
              </div>
              <div>
                <label htmlFor="estado" className="sr-only">Estado</label>
                <select id="estado" className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="Todos">Estado: Todos</option>
                </select>
              </div>
              <div>
                <label htmlFor="veterinario" className="sr-only">Veterinario</label>
                <select id="veterinario" className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="Todos">Veterinario: Todos</option>
                </select>
              </div>
            </div>

            <div className="flex items-center flex-grow">
              <input 
                type="text" 
                placeholder="Buscar paciente..."
                className="w-full p-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#374151] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Tabla de pacientes */}
          <div className="mb-6">
            {loading && <p className="text-gray-300">Cargando pacientes...</p>}
            {error && <p className="text-red-500">Error: {error}</p>}
            {!loading && !error && patients.length > 0 && (
              <PatientsTable patients={currentPatients} />
            )}
            {!loading && !error && patients.length === 0 && (
              <p className="text-gray-300">No se encontraron pacientes.</p>
            )}
          </div>

          {/* Paginación */}
          {!loading && !error && patients.length > 0 && (
            <div className="flex items-center justify-between border-t border-gray-700 bg-[#1f2937] px-4 py-3 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600"
                >
                  Siguiente
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Mostrando <span className="font-medium">{displayedStart}</span> a <span className="font-medium">{displayedEnd}</span> de <span className="font-medium">{patients.length}</span> pacientes
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={() => handlePageChange(i + 1)}
                        className={`relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-blue-700 border-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
} 