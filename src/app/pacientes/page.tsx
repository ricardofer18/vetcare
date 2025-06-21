"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Mascota, Dueno } from '@/types';
import { History, Edit, Eye } from 'lucide-react';
import { PatientHistoryModal } from '@/components/PatientHistoryModal';
import { EditPatientModal } from '@/components/EditPatientModal';

export default function PacientesPage() {
  const [pacientes, setPacientes] = useState<Mascota[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Mascota | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    cargarPacientes();
  }, []);

  const cargarPacientes = async () => {
    try {
      setIsLoading(true);
      console.log('Iniciando carga de pacientes...');
      
      // Obtenemos todos los dueños
      const duenosRef = collection(db, 'duenos');
      const duenosSnapshot = await getDocs(duenosRef);
      
      console.log('Dueños encontrados:', duenosSnapshot.size);
      
      const mascotas: Mascota[] = [];
      for (const duenoDoc of duenosSnapshot.docs) {
        const duenoData = duenoDoc.data();
        console.log('Datos del dueño:', duenoData);

        // Obtenemos las mascotas del dueño
        const mascotasRef = collection(db, `duenos/${duenoDoc.id}/mascotas`);
        const mascotasSnapshot = await getDocs(mascotasRef);
        
        for (const mascotaDoc of mascotasSnapshot.docs) {
          const mascotaData = mascotaDoc.data();
          console.log('Datos de mascota:', mascotaData);
          
          mascotas.push({
            id: mascotaDoc.id,
            nombre: mascotaData.nombre,
            especie: mascotaData.especie,
            raza: mascotaData.raza,
            edad: mascotaData.edad,
            peso: mascotaData.peso,
            fechaNacimiento: mascotaData.fechaNacimiento,
            sexo: mascotaData.sexo,
            color: mascotaData.color,
            observaciones: mascotaData.observaciones,
            duenoId: duenoDoc.id,
            dueno: {
              id: duenoDoc.id,
              nombre: duenoData.nombre,
              rut: duenoData.rut,
              telefono: duenoData.telefono,
              email: duenoData.email,
              direccion: duenoData.direccion
            }
          });
        }
      }
      
      console.log('Total de mascotas procesadas:', mascotas.length);
      setPacientes(mascotas);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pacientesFiltrados = pacientes.filter(mascota => {
    const busquedaLower = busqueda.toLowerCase();
    return (
      mascota.nombre.toLowerCase().includes(busquedaLower) ||
      mascota.especie.toLowerCase().includes(busquedaLower) ||
      mascota.raza.toLowerCase().includes(busquedaLower) ||
      mascota.dueno?.nombre.toLowerCase().includes(busquedaLower) ||
      mascota.dueno?.rut.includes(busqueda)
    );
  });

  const handleViewHistory = (paciente: Mascota) => {
    setSelectedPatient(paciente);
    setIsHistoryModalOpen(true);
  };

  const handleEditPatient = (paciente: Mascota) => {
    setSelectedPatient(paciente);
    setIsEditModalOpen(true);
  };

  const handlePatientUpdated = () => {
    cargarPacientes();
    setIsEditModalOpen(false);
    setSelectedPatient(null);
  };

  return (
    <>
      <div className="flex-1 overflow-y-auto">
        <div className="container mx-auto py-6 px-4">
          <Header title="Gestión de Pacientes" />
          
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex gap-4 flex-1 max-w-md mb-6">
              <Input
                placeholder="Buscar por nombre, especie, raza o dueño..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {busqueda && (
                <Button 
                  variant="outline"
                  onClick={() => setBusqueda('')}
                >
                  Limpiar
                </Button>
              )}
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : pacientesFiltrados.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p>{busqueda 
                  ? 'No se encontraron pacientes que coincidan con la búsqueda'
                  : 'No hay pacientes registrados'}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pacientesFiltrados.map((mascota) => (
                  <div
                    key={mascota.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {mascota.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">{mascota.nombre}</h3>
                          <p className="text-sm text-muted-foreground">{mascota.edad} años</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Especie:</span>
                        <span>{mascota.especie}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Raza:</span>
                        <span>{mascota.raza}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Dueño:</span>
                        <span>{mascota.dueno?.nombre}</span>
                      </div>
                      {mascota.peso && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Peso:</span>
                          <span>{mascota.peso} kg</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewHistory(mascota)}
                        className="flex-1"
                      >
                        <History className="w-4 h-4 mr-2" />
                        Historial
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditPatient(mascota)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {selectedPatient && (
        <>
          <PatientHistoryModal
            isOpen={isHistoryModalOpen}
            onClose={() => {
              setIsHistoryModalOpen(false);
              setSelectedPatient(null);
            }}
            paciente={selectedPatient}
          />
          <EditPatientModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedPatient(null);
            }}
            paciente={selectedPatient}
            onPatientUpdated={handlePatientUpdated}
          />
        </>
      )}
    </>
  );
} 