"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';
import { MascotaForm } from './MascotaForm';
import { ConsultaForm } from './ConsultaForm';
import { DuenoForm } from './DuenoForm';
import { Patient, Dueno, MascotaInput, ConsultaFormData, Appointment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { updateInventoryItem } from '@/lib/firestore';
import { createDateFromString, createDateForFirestore, debugDateHandling } from '@/lib/utils';

interface NuevaConsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsultaCreated: () => void;
  selectedAppointment?: Appointment | null;
}

export function NuevaConsultaModal({ isOpen, onClose, onConsultaCreated, selectedAppointment }: NuevaConsultaModalProps) {
  const [rut, setRut] = useState('');
  const [duenoData, setDuenoData] = useState<Dueno | null>(null);
  const [mascotaData, setMascotaData] = useState<Patient | null>(null);
  const [mascotasDueno, setMascotasDueno] = useState<Patient[]>([]);
  const [mostrarFormMascota, setMostrarFormMascota] = useState(false);
  const [mostrarFormDueno, setMostrarFormDueno] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Efecto para pre-llenar datos cuando se selecciona una cita agendada
  useEffect(() => {
    if (selectedAppointment && isOpen) {
      // Si la cita tiene ownerId y patientId, cargar automáticamente
      if (selectedAppointment.ownerId && selectedAppointment.patientId) {
        const buscarDuenoPorCita = async () => {
          try {
            setIsLoading(true);
            setError(null);
            
            const duenosRef = collection(db, 'duenos');
            const q = query(duenosRef, where('__name__', '==', selectedAppointment.ownerId));
            const querySnapshot = await getDocs(q);
            
            if (!querySnapshot.empty) {
              const duenoDoc = querySnapshot.docs[0];
              const dueno: Dueno = {
                id: duenoDoc.id,
                nombre: duenoDoc.data().nombre,
                apellido: duenoDoc.data().apellido,
                rut: duenoDoc.data().rut,
                telefono: duenoDoc.data().telefono,
                email: duenoDoc.data().email,
                direccion: duenoDoc.data().direccion
              };
              setDuenoData(dueno);
              setRut(dueno.rut);
              
              // Buscar la mascota específica
              const mascotasRef = collection(db, `duenos/${duenoDoc.id}/mascotas`);
              const mascotaQuery = query(mascotasRef, where('__name__', '==', selectedAppointment.patientId));
              const mascotaSnapshot = await getDocs(mascotaQuery);
              
              if (!mascotaSnapshot.empty) {
                const mascotaDoc = mascotaSnapshot.docs[0];
                const mascotaData = mascotaDoc.data();
                const mascota: Patient = {
                  id: mascotaDoc.id,
                  nombre: mascotaData.nombre,
                  especie: mascotaData.especie,
                  edad: mascotaData.edad,
                  duenoId: duenoDoc.id,
                  dueno,
                  raza: mascotaData.raza,
                  sexo: mascotaData.sexo,
                  color: mascotaData.color,
                  observaciones: mascotaData.observaciones,
                  peso: mascotaData.peso,
                  fechaNacimiento: mascotaData.fechaNacimiento
                };
                setMascotaData(mascota);
                
                // Cargar todas las mascotas del dueño
                const todasMascotasSnapshot = await getDocs(mascotasRef);
                const mascotas = todasMascotasSnapshot.docs.map(doc => {
                  const data = doc.data();
                  return {
                    id: doc.id,
                    nombre: data.nombre,
                    especie: data.especie,
                    edad: data.edad,
                    duenoId: duenoDoc.id,
                    dueno,
                    raza: data.raza,
                    sexo: data.sexo,
                    color: data.color,
                    observaciones: data.observaciones,
                    peso: data.peso,
                    fechaNacimiento: data.fechaNacimiento
                  } as Patient;
                });
                setMascotasDueno(mascotas);
              }
            }
          } catch (error) {
            console.error('Error al cargar datos de la cita:', error);
            setError('Error al cargar los datos de la cita seleccionada');
          } finally {
            setIsLoading(false);
          }
        };
        
        buscarDuenoPorCita();
      } else {
        // Si la cita no tiene ownerId y patientId, mostrar mensaje para buscar manualmente
        setError('Esta cita no tiene paciente asignado. Por favor, busca el dueño para continuar.');
        setDuenoData(null);
        setMascotaData(null);
        setMascotasDueno([]);
      }
    }
  }, [selectedAppointment, isOpen]);

  const handleBuscarDueno = async () => {
    if (!rut) {
      setError('Por favor ingrese un RUT');
      return;
    }

    setIsLoading(true);
    setError(null);
    setDuenoData(null);
    setMascotaData(null);
    setMascotasDueno([]);
    setMostrarFormDueno(false);

    try {
      const duenosRef = collection(db, 'duenos');
      const q = query(duenosRef, where('rut', '==', rut));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No se encontró ningún dueño con ese RUT. ¿Deseas crear uno nuevo?');
        setMostrarFormDueno(true);
        return;
      }

      const duenoDoc = querySnapshot.docs[0];
      const dueno: Dueno = {
        id: duenoDoc.id,
        nombre: duenoDoc.data().nombre,
        apellido: duenoDoc.data().apellido,
        rut: duenoDoc.data().rut,
        telefono: duenoDoc.data().telefono,
        email: duenoDoc.data().email,
        direccion: duenoDoc.data().direccion
      };
      setDuenoData(dueno);

      // Cargar mascotas del dueño
      const mascotasRef = collection(db, `duenos/${duenoDoc.id}/mascotas`);
      const mascotasSnapshot = await getDocs(mascotasRef);
      
      const mascotas = mascotasSnapshot.docs.map(doc => ({
        id: doc.id,
        duenoId: duenoDoc.id,
        dueno,
        ...doc.data()
      } as Patient));
      
      setMascotasDueno(mascotas);
    } catch (error) {
      console.error('Error al buscar dueño:', error);
      setError('Error al buscar el dueño');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDuenoCreated = async (duenoInput: Omit<Dueno, 'id'>) => {
    try {
      setIsLoading(true);
      setError(null);

      // Crear el dueño en Firestore
      const duenosRef = collection(db, 'duenos');
      const duenoDoc = await addDoc(duenosRef, duenoInput);

      const nuevoDueno: Dueno = {
        ...duenoInput,
        id: duenoDoc.id
      };

      setDuenoData(nuevoDueno);
      setMascotasDueno([]);
      setMostrarFormDueno(false);
    } catch (error) {
      console.error('Error al crear dueño:', error);
      setError('Error al crear el dueño');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleBuscarDueno();
    }
  };

  const handleMascotaCreated = async (mascotaInput: MascotaInput) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!duenoData) {
        setError('No hay dueño seleccionado');
        return;
      }

      // Guardar la mascota en la subcolección del dueño
      const mascotasRef = collection(db, `duenos/${duenoData.id}/mascotas`);
      const mascotaDoc = await addDoc(mascotasRef, mascotaInput);

      const nuevaMascota: Patient = {
        ...mascotaInput,
        id: mascotaDoc.id,
        duenoId: duenoData.id,
        dueno: duenoData,
        edad: mascotaInput.edad || 0 // Asegurar que edad sea siempre un valor válido
      };

      setMascotasDueno(prev => [...prev, nuevaMascota]);
      setMascotaData(nuevaMascota);
      setMostrarFormMascota(false);
    } catch (error) {
      console.error('Error al crear mascota:', error);
      setError('Error al crear la mascota');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ConsultaFormData) => {
    try {
      setIsLoading(true);
      const consultaRef = collection(db, `duenos/${duenoData?.id}/mascotas/${mascotaData?.id}/consultas`);
      
      // Determinar la fecha de la consulta
      let fechaConsulta: Date;
      if (selectedAppointment) {
        // Debug: verificar el manejo de fechas
        debugDateHandling(selectedAppointment.date, selectedAppointment.time);
        
        // Si hay una cita agendada, usar su fecha y hora
        // Usar createDateForFirestore para evitar problemas de zona horaria
        fechaConsulta = createDateForFirestore(selectedAppointment.date, selectedAppointment.time);
        
        console.log('Fecha de cita original:', selectedAppointment.date, selectedAppointment.time);
        console.log('Fecha creada para Firestore:', fechaConsulta.toISOString());
        console.log('Fecha local formateada:', fechaConsulta.toLocaleString('es-ES'));
      } else {
        // Si no hay cita agendada, usar la fecha actual
        fechaConsulta = new Date();
      }
      
      // Crear la consulta con estado "Pendiente" por defecto
      const consultaData = {
        ...data,
        veterinarioId: user?.uid,
        fecha: fechaConsulta,
        estado: 'Pendiente' as const,
        proximaCita: data.proximaCita ? new Date(data.proximaCita) : null
      };
      
      await addDoc(consultaRef, consultaData);

      // Actualizar stock de los artículos usados
      if (Array.isArray(data.articulosUsados)) {
        for (const articulo of data.articulosUsados) {
          try {
            await updateInventoryItem(articulo.id, { quantity: (articulo.stock !== undefined ? articulo.stock : 0) - articulo.quantity });
          } catch (err) {
            console.error('Error al actualizar stock del artículo:', articulo.id, err);
          }
        }
      }
      
      // Si hay una cita agendada seleccionada, actualizar su estado y datos
      if (selectedAppointment) {
        try {
          const { updateAppointment } = await import('@/lib/firestore');
          
          // Actualizar la cita con los datos correctos del dueño y mascota
          const updateData: Partial<Appointment> = {
            status: 'Completada',
            ownerId: duenoData?.id || '',
            patientId: mascotaData?.id || '',
            patientName: mascotaData?.nombre || '',
            ownerName: duenoData ? `${duenoData.nombre} ${duenoData.apellido}` : '',
            veterinarian: user?.email || 'Pendiente'
          };
          
          await updateAppointment(selectedAppointment.id, updateData);
          console.log('Cita agendada actualizada:', selectedAppointment.id, updateData);
        } catch (error) {
          console.error('Error al actualizar estado de la cita:', error);
        }
      }
      
      toast({
        title: "Consulta creada",
        description: "La consulta se ha creado correctamente como pendiente y el stock ha sido actualizado",
      });
      onClose();
      onConsultaCreated();
    } catch (error) {
      console.error("Error al crear la consulta:", error);
      toast({
        title: "Error",
        description: "No se pudo crear la consulta",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {selectedAppointment 
              ? `Nueva Consulta - ${selectedAppointment.patientName} (${selectedAppointment.time})`
              : 'Nueva Consulta'
            }
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 pr-4">
            {selectedAppointment && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Cita Agendada Seleccionada:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-green-700">Paciente:</span>
                    <p className="text-green-800">{selectedAppointment.patientName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Dueño:</span>
                    <p className="text-green-800">{selectedAppointment.ownerName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Fecha y Hora:</span>
                    <p className="text-green-800">{selectedAppointment.date} a las {selectedAppointment.time}</p>
                  </div>
                  <div>
                    <span className="font-medium text-green-700">Tipo:</span>
                    <p className="text-green-800">{selectedAppointment.type}</p>
                  </div>
                </div>
              </div>
            )}

            {!mostrarFormDueno && !selectedAppointment && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="rut">RUT del Dueño</Label>
                  <Input
                    id="rut"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingrese el RUT del dueño"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleBuscarDueno} 
                    disabled={isLoading}
                    className="min-w-[100px]"
                  >
                    {isLoading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>
            )}

            {!mostrarFormDueno && selectedAppointment && !duenoData && (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Label htmlFor="rut">RUT del Dueño</Label>
                  <Input
                    id="rut"
                    value={rut}
                    onChange={(e) => setRut(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ingrese el RUT del dueño"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    onClick={handleBuscarDueno} 
                    disabled={isLoading}
                    className="min-w-[100px]"
                  >
                    {isLoading ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">{error}</p>
                {selectedAppointment && !duenoData && (
                  <p className="text-yellow-700 text-sm mt-2">
                    Busca el dueño por RUT para asignar el paciente a esta cita.
                  </p>
                )}
              </div>
            )}

            {mostrarFormDueno && (
              <div className="space-y-4">
                <DuenoForm 
                  onSubmit={handleDuenoCreated}
                  onCancel={() => {
                    setMostrarFormDueno(false);
                    setError(null);
                  }}
                />
              </div>
            )}

            {duenoData && !mascotaData && !mostrarFormMascota && !mostrarFormDueno && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold">Mascotas de {duenoData.nombre}</h3>
                  <Button onClick={() => setMostrarFormMascota(true)}>
                    Nueva Mascota
                  </Button>
                </div>

                <ScrollArea className="h-[300px] rounded-md border p-4">
                  <div className="space-y-4">
                    {mascotasDueno.length > 0 ? (
                      mascotasDueno.map((mascota) => (
                        <div
                          key={mascota.id}
                          className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setMascotaData(mascota)}
                        >
                          <div>
                            <h4 className="font-medium">{mascota.nombre}</h4>
                            <p className="text-sm text-gray-500">
                              {mascota.especie} - {mascota.raza}
                            </p>
                            <p className="text-sm text-gray-500">
                              {mascota.edad} años
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            Seleccionar
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        No hay mascotas registradas para este dueño
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            )}

            {mostrarFormMascota && duenoData && (
              <div className="space-y-4">
                <MascotaForm 
                  duenoId={duenoData.id}
                  onMascotaCreated={handleMascotaCreated}
                  onCancel={() => setMostrarFormMascota(false)}
                />
              </div>
            )}

            {mascotaData && duenoData && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-blue-800 mb-2">Consulta para:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-blue-700">Dueño:</span>
                      <p className="text-blue-800">{duenoData.nombre} ({duenoData.rut})</p>
                    </div>
                    <div>
                      <span className="font-medium text-blue-700">Mascota:</span>
                      <p className="text-blue-800">{mascotaData.nombre} - {mascotaData.especie}</p>
                    </div>
                  </div>
                </div>

                <ConsultaForm 
                  mascota={mascotaData}
                  onConsultaCreated={handleSubmit}
                />
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}