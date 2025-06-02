"use client";

import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Header } from '../../components/Header';
import SummaryCard from '../../components/SummaryCard';
import UserManagementTable, { User } from '../../components/UserManagementTable';

// Datos de ejemplo para la tabla de usuarios
const sampleUsers: User[] = [
  {
    id: 1,
    name: 'Admin User',
    email: 'admin@vetcare.com',
    role: 'Administrador',
  },
  {
    id: 2,
    name: 'Dr. Smith',
    email: 'smith@vetcare.com',
    role: 'Veterinario',
  },
  {
    id: 3,
    name: 'Receptionist',
    email: 'reception@vetcare.com',
    role: 'Recepcionista',
  },
  {
    id: 4,
    name: 'Dr. Johnson',
    email: 'johnson@vetcare.com',
    role: 'Veterinario',
  },
  {
    id: 5,
    name: 'Assistant Miller',
    email: 'miller@vetcare.com',
    role: 'Recepcionista',
  },
  {
    id: 6,
    name: 'Dr. Davis',
    email: 'davis@vetcare.com',
    role: 'Veterinario',
  },
];

export default function AdministracionPage() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra lateral */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex flex-col flex-1 bg-[#121212]">
        {/* Barra superior */}
        <Header title="Administración" />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Sección de tarjetas resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <SummaryCard 
              title="Total Usuarios"
              value="50"
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372c.937 0 1.855-.184 2.719-.537M15 9.328a9.36 9.36 0 0 0 2.625.372c.937 0 1.855-.184 2.719-.537m-13.5 3.01c-.716 0-1.44-.19-2.104-.536m-3.507 1.042A9.326 9.326 0 0 1 1 19.128V18a3 3 0 0 1 3-3h2.25c.241 0 .475.059.678.179m0 0l4.03-4.03m3.724 2.515a9.326 9.326 0 0 0-3.724-2.515m-10.5 6.01a9.326 9.326 0 0 0 4.685 2.515M15 19.128v-.372a4.5 4.5 0 0 0-1.135-.134c-.165 0-.33-.03-.494-.064m-3.726 3.014A9.326 9.326 0 0 1 15 21.75c-1.416 0-2.813-.27-4.134-.8ZM4.253 12.244a9.326 9.326 0 0 0 2.625.372c.937 0 1.855-.184 2.719-.537M7.5 10.775v-.372c0-.096.01-.192.03-.286m.03-3.114A9.326 9.326 0 0 0 7.5 5.25c-.447 0-.89.05-1.316.145M12 12.75a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12 21.75c-1.416 0-2.813-.27-4.134-.8" />
                </svg>
              }
            />
             <SummaryCard 
              title="Reportes Generados"
              value="15"
              icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-500">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m.75 8.625.75-.75H12m-7.5 0H7.5m-1.5 0h3v-.75A7.5 7.5 0 0 0 3 11.25v4.125c0 1.036.84 1.875 1.875 1.875h1.5a2.25 2.25 0 0 0 2.25-2.25v-1.5a2.25 2.25 0 0 0-2.25-2.25H5.25Z" />
                 </svg>
              }
            />
             <SummaryCard 
              title="Tareas Pendientes"
              value="3"
              icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-yellow-500">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v.039m0 3.614v.039m0 3.614v.039M6.75 21h10.5c.966 0 1.831-.428 2.416-1.113l.108-.129A3.375 3.375 0 0 0 21.75 16.5V9.75c0-.965-.428-1.83-1.113-2.416l-.129-.108A3.375 3.375 0 0 0 16.5 5.25H7.5c-.966 0-1.831.428-2.416 1.113l-.129.108A3.375 3.375 0 0 0 3.75 9.75v6.75c0 .966.428 1.831 1.113 2.416l.129.108A3.375 3.375 0 0 0 7.5 21Z" />
                 </svg>
              }
            />
             <SummaryCard 
              title="Logs del Sistema"
              value="Actualizado"
              icon={
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-purple-500">
                   <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 0 1-.879 2.122L7.5 21H3m10-18H9a3 3 0 0 0-3 3v4.586A2.25 2.25 0 0 1 7.5 12h9a2.25 2.25 0 0 1 2.25 2.25V17.25m0 0a2.25 2.25 0 0 0 2.25 2.25M19.5 10.5h.002m-4.84 1.06a1.5 1.5 0 1 1-.75-1.296m3.85.01a1.5 1.5 0 1 1-.75-1.296M6.375 17.25H5.625m0 0H5.25c-.621 0-1.125-.504-1.125-1.125V9.75m9.25-3-3 3m-3-3 3 3" />
                 </svg>
              }
            />
          </div>

          {/* Placeholder para secciones administrativas adicionales */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#1f2937] rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-white mb-4">Gestión de Usuarios</h3>
              {/* Controles de gestión de usuarios */}
              <div className="flex justify-end mb-4">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  </svg>
                  Agregar Usuario
                </button>
              </div>
              {/* Tabla de gestión de usuarios */}
              <UserManagementTable users={sampleUsers} />
            </div>
            <div className="bg-[#1f2937] rounded-lg shadow p-6">
              <h3 className="text-xl font-bold text-white mb-4">Configuración del Sistema</h3>
              <p className="text-gray-300">Aquí irán las opciones de configuración general.</p>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
} 