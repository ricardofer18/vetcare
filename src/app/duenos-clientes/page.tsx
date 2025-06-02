"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { Header } from '../../components/Header';
import ClientOwnerTable, { Client } from '../../components/ClientOwnerTable';
import { getClients, addClient } from '../../lib/firestore';
import Modal from '../../components/Modal';

export default function DuenosClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(clients.length / itemsPerPage);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, 'id'>>({
    image: '',
    name: '',
    code: '',
    rutDni: '',
    contact: '',
    pets: 0,
    lastAttention: '',
    status: 'Activo',
  });

  React.useEffect(() => {
    const fetchClients = async () => {
      try {
        const firestoreClients = await getClients();
        setClients(firestoreClients);
      } catch (err) {
        setError('Error al cargar clientes');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = clients.slice(startIndex, endIndex);
  const displayedStart = startIndex + 1;
  const displayedEnd = Math.min(endIndex, clients.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'pets' ? Number(value) : value }));
  };

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addClient(formData);
      setShowForm(false);
      setFormData({ image: '', name: '', code: '', rutDni: '', contact: '', pets: 0, lastAttention: '', status: 'Activo' });
      setLoading(true);
      const firestoreClients = await getClients();
      setClients(firestoreClients);
    } catch (err) {
      alert('Error al agregar cliente');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra lateral */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex flex-col flex-1 bg-[#121212]">
         {/* Barra superior */}
        <Header title="Dueños / Clientes" />

        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex justify-end mb-4">
            <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Agregar Cliente
            </button>
          </div>
          <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Agregar Cliente">
            <form onSubmit={handleAddClient} className="flex flex-col gap-4">
              <input name="name" value={formData.name} onChange={handleInputChange} placeholder="Nombre" className="p-2 rounded bg-gray-100 text-gray-800" required />
              <input name="code" value={formData.code} onChange={handleInputChange} placeholder="Código" className="p-2 rounded bg-gray-100 text-gray-800" required />
              <input name="rutDni" value={formData.rutDni} onChange={handleInputChange} placeholder="RUT/DNI" className="p-2 rounded bg-gray-100 text-gray-800" required />
              <input name="contact" value={formData.contact} onChange={handleInputChange} placeholder="Contacto" className="p-2 rounded bg-gray-100 text-gray-800" required />
              <input name="pets" type="number" value={formData.pets} onChange={handleInputChange} placeholder="Cantidad de mascotas" className="p-2 rounded bg-gray-100 text-gray-800" required />
              <input name="lastAttention" value={formData.lastAttention} onChange={handleInputChange} placeholder="Última atención" className="p-2 rounded bg-gray-100 text-gray-800" required />
              <label htmlFor="status" className="sr-only">Estado</label>
              <select id="status" name="status" value={formData.status} onChange={handleInputChange} className="p-2 rounded bg-gray-100 text-gray-800">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
              <button type="submit" className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Guardar</button>
              <button type="button" onClick={() => setShowForm(false)} className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">Cancelar</button>
            </form>
          </Modal>
          {/* Sección de filtros y búsqueda */}
          <div className="bg-white dark:bg-[#1f2937] rounded-lg shadow p-4 mb-6 flex flex-col md:flex-row items-center gap-4">
            {/* Filtros */}
            <div className="flex items-center gap-4">
              <div>
                <label htmlFor="estado" className="sr-only">Estado</label>
                <select id="estado" className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                  <option value="Todos">Estado: Todos</option>
                  {/* Add more status options here */}
                </select>
              </div>
              <div>
                 <label htmlFor="mascotas" className="sr-only">Mascotas</label>
                 <select id="mascotas" className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                   <option value="Todas">Mascotas: Todas</option>
                   {/* Add more pet count options here */}
                 </select>
               </div>
              <div>
                 <label htmlFor="ultima-atencion" className="sr-only">Última atención</label>
                 <select id="ultima-atencion" className="block w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-[#374151] text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm">
                   <option value="Cualquier fecha">Última atención: Cualquier fecha</option>
                   {/* Add more date range options here */}
                 </select>
              </div>
            </div>

            {/* Barra de búsqueda */}
            <div className="flex items-center flex-grow">
              <input 
                type="text" 
                placeholder="Buscar cliente por nombre, RUT..."
                className="w-full p-2 text-sm text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-[#374151] rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
              />
            </div>
          </div>

          {/* Tabla de dueños/clientes */}
          <div className="mb-6">
            {loading && <p className="text-gray-300">Cargando clientes...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && <ClientOwnerTable clients={currentClients} />}
          </div>

           {/* Paginación */}
          <div className="flex items-center justify-between border-t border-gray-700 bg-[#1f2937] px-4 py-3 sm:px-6 rounded-lg shadow">
             <div className="flex-1 flex justify-between sm:hidden">
               {/* Mobile pagination */}
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
                    Mostrando <span className="font-medium">{displayedStart}</span> to <span className="font-medium">{displayedEnd}</span> of <span className="font-medium">{clients.length}</span> clientes
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Pagination numbers */}
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

        </main>
      </div>
    </div>
  );
} 