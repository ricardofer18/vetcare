"use client";

import React from 'react';
import Sidebar from '../../components/Sidebar';
import { Header } from '../../components/Header';

export default function ConfiguracionPage() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra lateral */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex flex-col flex-1 bg-[#121212]">
        {/* Barra superior */}
        <Header title="Configuración" />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Contenido específico de Configuración */}
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Configuración</h2>
          <p className="text-gray-700 dark:text-gray-300">Aquí irá el contenido de Configuración.</p>
        </main>
      </div>
    </div>
  );
} 