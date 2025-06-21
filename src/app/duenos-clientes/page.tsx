"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import OwnerTable from '../../components/OwnerTable';
import { Owner, getOwners, addOwner, initializeSamplePatients } from '../../lib/firestore';
import Modal from '../../components/Modal';
import OwnerDetailsModal from '../../components/OwnerDetailsModal';

export default function DuenosClientesPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(owners.length / itemsPerPage);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Owner, 'id'>>({
    nombre: '',
    apellido: '',
    rut: '',
    email: '',
    telefono: '',
    direccion: '',
  });
  
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  React.useEffect(() => {
    const fetchOwners = async () => {
      try {
        setLoading(true);
        setError(null);
        const firestoreOwners = await getOwners();
        setOwners(firestoreOwners);
        
        // Inicializar mascotas de ejemplo si es necesario
        await initializeSamplePatients();
        
      } catch (err) {
        setError(`Error al cargar dueños: ${err instanceof Error ? err.message : 'Error desconocido'}`);
      } finally {
        setLoading(false);
      }
    };
    fetchOwners();
  }, []);
  
  const handleOwnerClick = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOwner(null);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOwners = owners.slice(startIndex, endIndex);
  const displayedStart = startIndex + 1;
  const displayedEnd = Math.min(endIndex, owners.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addOwner(formData);
      setShowForm(false);
      setFormData({
        nombre: '',
        apellido: '',
        rut: '',
        email: '',
        telefono: '',
        direccion: '',
      });
      setLoading(true);
      const firestoreOwners = await getOwners();
      setOwners(firestoreOwners);
    } catch (err) {
      alert('Error al agregar dueño');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <OwnerDetailsModal 
        owner={selectedOwner}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
      
      <div className="container mx-auto py-6 px-4">
        <div className="flex flex-col flex-1">
          {/* Barra superior */}
          <Header title="Dueños / Clientes" />

          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-end mb-4">
              <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Agregar Dueño
              </button>
            </div>
            <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Agregar Dueño">
              <form onSubmit={handleAddOwner} className="flex flex-col gap-4">
                <input name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder="Nombre" className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" required />
                <input name="apellido" value={formData.apellido} onChange={handleInputChange} placeholder="Apellido" className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" required />
                <input name="rut" value={formData.rut} onChange={handleInputChange} placeholder="RUT" className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" required />
                <input name="email" value={formData.email} onChange={handleInputChange} placeholder="Email" className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" type="email" />
                <input name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder="Teléfono" className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" />
                <input name="direccion" value={formData.direccion} onChange={handleInputChange} placeholder="Dirección" className="p-2 rounded bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white" />
                <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
              </form>
            </Modal>
            {/* Sección de filtros y búsqueda */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
              {/* Filtros */}
              <div className="flex items-center gap-4">
                <div>
                  <label htmlFor="estado" className="sr-only">Estado</label>
                  <select id="estado" className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                    <option value="Todos">Estado: Todos</option>
                    {/* Add more status options here */}
                  </select>
                </div>
              </div>

              {/* Barra de búsqueda */}
              <div className="flex items-center flex-grow">
                <input 
                  type="text" 
                  placeholder="Buscar dueño por nombre, RUT..."
                  className="w-full p-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                />
              </div>
            </div>

            {/* Tabla de dueños/clientes */}
            <div className="mb-6">
              {loading && (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Cargando dueños...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-4 py-3 rounded mb-4">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              {!loading && !error && owners.length === 0 && (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">No se encontraron dueños.</p>
                </div>
              )}
              {!loading && !error && owners.length > 0 && (
                <OwnerTable owners={currentOwners} onRowClick={handleOwnerClick} />
              )}
            </div>

             {/* Paginación */}
            <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 sm:px-6 rounded-lg shadow">
               <div className="flex-1 flex justify-between sm:hidden">
                 {/* Mobile pagination */}
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Mostrando <span className="font-medium">{displayedStart}</span> a <span className="font-medium">{displayedEnd}</span> de <span className="font-medium">{owners.length}</span> dueños
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1 
                              ? 'z-10 bg-blue-600 border-blue-600 text-white' 
                              : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
} 