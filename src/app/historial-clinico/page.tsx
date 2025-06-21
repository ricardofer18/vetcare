"use client";

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Header } from '../../components/Header';

export default function HistorialClinicoPage() {
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="container mx-auto py-6 px-4">
        {/* Barra superior */}
        <Header title="Historial Clínico" />

        <main className="flex-1 p-6 overflow-y-auto">
          {/* Contenido específico de Historial Clínico */}
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Historial Clínico</h2>
          <p className="text-gray-700 dark:text-gray-300">Aquí irá el contenido del Historial Clínico.</p>
        </main>
      </div>
    </div>
  );
} 