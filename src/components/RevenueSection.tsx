"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

type Tab = 'Diario' | 'Semanal' | 'Mensual';

const RevenueSection = () => {
  const [activeTab, setActiveTab] = useState<Tab>('Diario');

  // Datos de ejemplo para los gráficos
  const data: Record<Tab, any> = {
    Diario: {
      labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
      datasets: [
        {
          label: 'Ingresos Diarios',
          data: [500, 700, 600, 800, 900, 750, 850],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
      ],
    },
    Semanal: {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      datasets: [
        {
          label: 'Ingresos Semanales',
          data: [3000, 3500, 3200, 3800],
          backgroundColor: 'rgba(153, 102, 255, 0.6)',
        },
      ],
    },
    Mensual: {
      labels: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio'],
      datasets: [
        {
          label: 'Ingresos Mensuales',
          data: [10000, 12000, 11000, 13000, 15000, 14000, 24580],
          backgroundColor: 'rgba(255, 159, 64, 0.6)',
        },
      ],
    },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Gráfico de Ingresos ${activeTab}`,
      },
    },
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Ingresos</h3>
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-4">
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'Diario' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
          onClick={() => setActiveTab('Diario')}
        >
          Diario
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'Semanal' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
          onClick={() => setActiveTab('Semanal')}
        >
          Semanal
        </button>
        <button
          className={`px-4 py-2 text-sm font-medium ${activeTab === 'Mensual' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
          onClick={() => setActiveTab('Mensual')}
        >
          Mensual
        </button>
      </div>
      {/* Área del gráfico */}
      <div className="h-64">
         <Bar data={data[activeTab]} options={options} />
      </div>

       <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        {/* Aquí irían los puntos de color y etiquetas del gráfico real */}
        • Consultas • Cirugías • Vacunas
      </div>
       <div className="mt-2 text-lg font-bold text-gray-800 dark:text-white">
        Total de ingresos acumulados este mes: $24,580
      </div>
    </div>
  );
};

export default RevenueSection; 