import React from 'react';
import Image from "next/image";
import SummaryCard from '../components/SummaryCard';
import RevenueSection from '../components/RevenueSection';
import AlertsSection from '../components/AlertsSection';
import Sidebar from '../components/Sidebar';
import { Header } from '../components/Header';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra lateral */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex flex-col flex-1">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Panel de Administración</h2>
          
          {/* Cuadros resumen */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <SummaryCard 
              title="Ingresos mensuales"
              value="$24.580"
              percentageChange="↑12% este mes"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
              iconBgColor="bg-green-500"
            />
            <SummaryCard 
              title="Atenciones realizadas"
              value="437"
              percentageChange="↑ 8% este mes"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
              iconBgColor="bg-blue-500"
            />
            <SummaryCard 
              title="Consultas"
              value="Servicio más solicitado"
              percentageChange="↑ 15% de los ingresos"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
              iconBgColor="bg-yellow-500"
            />
             <SummaryCard 
              title="Profesional más activo"
              value="Dra. Laura"
              percentageChange="↑ 125 atenciones"
              icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
              iconBgColor="bg-red-500"
            />
          </div>

          {/* Secciones principales: Ingresos y Alertas */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sección de Ingresos (2/3 del ancho en pantallas grandes)*/}
            <div className="lg:col-span-2">
               <RevenueSection />
            </div>

            {/* Sección de Alertas KPIs (1/3 del ancho en pantallas grandes)*/}
            <div className="lg:col-span-1">
              <AlertsSection />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}
