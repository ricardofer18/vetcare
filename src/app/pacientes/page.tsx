"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient } from '@/types';
import { History, Edit, Eye, Trash2 } from 'lucide-react';
import { PatientHistoryModal } from '@/components/PatientHistoryModal';
import { EditPatientModal } from '@/components/EditPatientModal';
import { PatientDetailsModal } from '@/components/PatientDetailsModal';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DisabledButton, RouteGuard } from '@/components/RoleGuard';
import { formatearEdad } from '@/lib/utils';
import { deletePatient } from '@/lib/firestore';
import { useToast } from '@/components/ui/use-toast';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function PacientesPage() {
  const { toast } = useToast();
  const [pacientes, setPacientes] = useState<Patient[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

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
      
      const mascotas: Patient[] = [];
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
              apellido: duenoData.apellido,
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
      (mascota.raza?.toLowerCase().includes(busquedaLower) ?? false) ||
      mascota.dueno?.nombre.toLowerCase().includes(busquedaLower) ||
      mascota.dueno?.rut.includes(busqueda)
    );
  });

  const handleViewDetails = (paciente: Patient) => {
    setSelectedPatient(paciente);
    setIsDetailsModalOpen(true);
  };

  const handleViewHistory = (paciente: Patient) => {
    setSelectedPatient(paciente);
    setIsHistoryModalOpen(true);
  };

  const handleEditPatient = (paciente: Patient) => {
    setSelectedPatient(paciente);
    setIsEditModalOpen(true);
  };

  const handlePatientUpdated = () => {
    cargarPacientes();
    setIsEditModalOpen(false);
    setSelectedPatient(null);
  };

  const handleDeletePatient = async (paciente: Patient) => {
    try {
      console.log('Eliminando paciente:', paciente);
      
      const duenoId = paciente.duenoId || paciente.dueno?.id;
      
      if (!duenoId) {
        console.error('No se pudo obtener el duenoId del paciente');
        toast({
          title: "Error",
          description: "No se pudo identificar el dueño del paciente.",
          variant: 'destructive'
        });
        return;
      }

      await deletePatient(duenoId, paciente.id);

      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido eliminado exitosamente junto con todas sus consultas y citas relacionadas.",
      });

      // Recargar los pacientes
      cargarPacientes();
    } catch (error) {
      console.error('Error al eliminar paciente:', error);
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente. Por favor, intenta de nuevo.",
        variant: 'destructive'
      });
    }
  };

  return (
    <RouteGuard resource="pacientes" action="read">
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
          <Header title="Pacientes" />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-background">
            
            {/* Barra de búsqueda */}
            <div className="bg-card rounded-lg shadow border p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <div className="flex gap-2 sm:gap-4 flex-1 max-w-md">
                  <Input
                    placeholder="Buscar por nombre, especie, raza o dueño..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  {busqueda && (
                    <Button 
                      variant="outline"
                      onClick={() => setBusqueda('')}
                      size="sm"
                      className="text-xs sm:text-sm"
                    >
                      Limpiar
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Lista de pacientes */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-card-foreground">
                  Pacientes Registrados ({pacientesFiltrados.length})
                </h2>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-48 sm:h-64">
                  <LoadingSpinner size="md" variant="primary" />
                </div>
              ) : pacientesFiltrados.length === 0 ? (
                <div className="text-center py-8 sm:py-12 text-muted-foreground">
                  <p className="text-sm sm:text-base">
                    {busqueda 
                      ? 'No se encontraron pacientes que coincidan con la búsqueda'
                      : 'No hay pacientes registrados'
                    }
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                  {pacientesFiltrados.map((mascota) => (
                    <div
                      key={mascota.id}
                      className="bg-card border border-border rounded-lg p-3 sm:p-4 lg:p-6 hover:bg-accent/50 transition-colors cursor-pointer hover:shadow-md"
                      onClick={() => handleViewDetails(mascota)}
                    >
                      <div className="flex items-center justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-full flex items-center justify-center">
                            <span className="text-primary-foreground font-semibold text-base sm:text-lg">
                              {mascota.nombre.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-base sm:text-lg font-semibold text-card-foreground">
                              {mascota.nombre}
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatearEdad(mascota.edad, mascota.fechaNacimiento)}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs sm:text-sm text-muted-foreground">Especie:</span>
                          <span className="text-xs sm:text-sm font-medium">{mascota.especie}</span>
                        </div>
                        
                        {mascota.raza && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-muted-foreground">Raza:</span>
                            <span className="text-xs sm:text-sm font-medium">{mascota.raza}</span>
                          </div>
                        )}
                        
                        {mascota.dueno && (
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-muted-foreground">Dueño:</span>
                            <span className="text-xs sm:text-sm font-medium">{mascota.dueno.nombre}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-2 mt-4 sm:mt-6">
                        <DisabledButton
                          resource="pacientes"
                          action="read"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewHistory(mascota);
                          }}
                          tooltip="Ver historial"
                          className="text-xs sm:text-sm"
                        >
                          <History className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Historial
                        </DisabledButton>
                        
                        <DisabledButton
                          resource="pacientes"
                          action="update"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditPatient(mascota);
                          }}
                          tooltip="Editar paciente"
                          className="text-xs sm:text-sm"
                        >
                          <Edit className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Editar
                        </DisabledButton>
                        
                        <DisabledButton
                          resource="pacientes"
                          action="delete"
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPatientToDelete(mascota);
                            setIsDeleteModalOpen(true);
                          }}
                          tooltip="Eliminar paciente"
                          className="text-xs sm:text-sm"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                          Eliminar
                        </DisabledButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Modales */}
      {selectedPatient && (
        <>
          <PatientDetailsModal
            isOpen={isDetailsModalOpen}
            onClose={() => {
              setIsDetailsModalOpen(false);
              setSelectedPatient(null);
            }}
            paciente={selectedPatient}
          />
          
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

      {patientToDelete && (
        <ConfirmDialog
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setPatientToDelete(null);
          }}
          onConfirm={() => {
            handleDeletePatient(patientToDelete);
            setIsDeleteModalOpen(false);
          }}
          title="Confirmar eliminación"
          description={`¿Estás seguro de que quieres eliminar al paciente ${patientToDelete.nombre || 'Paciente'}? Esta acción eliminará también todas sus consultas y citas relacionadas. Esta acción no se puede deshacer.`}
        />
      )}
    </RouteGuard>
  );
} 