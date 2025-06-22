'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';
import { collection, query, where, orderBy, getDocs, collectionGroup, Timestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Consulta, Appointment } from '@/types';
import { Search, Calendar, Clock, Trash2, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DetalleConsultaModal } from '@/components/consultas/DetalleConsultaModal';
import { useToast } from '@/components/ui/use-toast';
import { getAppointments, deleteAppointment } from '@/lib/firestore';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { EditarConsultaModal } from '@/components/consultas/EditarConsultaModal';
import { NuevaConsultaModal } from '@/components/consultas/NuevaConsultaModal';
import { 
  CanCreateConsultas, 
  DisabledButton,
  RouteGuard
} from '@/components/RoleGuard';

export default function ConsultasPage() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [isEditarOpen, setIsEditarOpen] = useState(false);
  const [isNuevaConsultaOpen, setIsNuevaConsultaOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const cargarConsultas = async () => {
    try {
      setLoading(true);
      console.log('Iniciando carga de todas las consultas');
      
      // Obtener todas las consultas usando collectionGroup
      const consultasRef = collectionGroup(db, 'consultas');
      const consultasQuery = query(
        consultasRef,
        orderBy('fecha', 'desc')
      );
      
      const consultasSnapshot = await getDocs(consultasQuery);
      console.log('Consultas encontradas:', consultasSnapshot.size);
      
      const consultasPromises = consultasSnapshot.docs.map(async (consultaDoc) => {
        try {
          const consultaData = consultaDoc.data();
          console.log('Procesando consulta:', consultaDoc.id, consultaData);
          
          // Obtener el path completo y extraer los IDs
          const pathParts = consultaDoc.ref.path.split('/');
          const duenoId = pathParts[1];
          const mascotaId = pathParts[3];
          console.log('duenoId:', duenoId, 'mascotaId:', mascotaId);
          
          // Obtener datos de la mascota
          const mascotaRef = collection(db, 'duenos', duenoId, 'mascotas');
          const mascotaQuery = query(mascotaRef, where('__name__', '==', mascotaId));
          const mascotaSnapshot = await getDocs(mascotaQuery);
          
          if (mascotaSnapshot.empty) {
            console.error('No se encontró la mascota:', mascotaId);
            return null;
          }
          
          const mascotaData = mascotaSnapshot.docs[0].data();
          console.log('Datos de la mascota:', mascotaData);
          
          // Obtener datos del dueño
          const duenoRef = collection(db, 'duenos');
          const duenoQuery = query(duenoRef, where('__name__', '==', duenoId));
          const duenoSnapshot = await getDocs(duenoQuery);
          
          if (duenoSnapshot.empty) {
            console.error('No se encontró el dueño:', duenoId);
            return null;
          }
          
          const duenoData = duenoSnapshot.docs[0].data();
          console.log('Datos del dueño:', duenoData);
          
          // Construir el objeto consulta con todos los datos
          const consulta: Consulta = {
            id: consultaDoc.id,
            mascotaId,
            veterinarioId: consultaData.veterinarioId,
            fecha: (consultaData.fecha as Timestamp).toDate(),
            motivo: consultaData.motivo,
            sintomas: consultaData.sintomas,
            diagnostico: consultaData.diagnostico,
            tratamiento: consultaData.tratamiento,
            estado: consultaData.estado || 'Pendiente', // Por defecto pendiente si no existe
            proximaCita: consultaData.proximaCita ? (consultaData.proximaCita as Timestamp).toDate() : undefined,
            mascota: {
              id: mascotaId,
              nombre: mascotaData.nombre,
              especie: mascotaData.especie,
              raza: mascotaData.raza,
              edad: mascotaData.edad,
              duenoId,
              dueno: {
                id: duenoId,
                nombre: duenoData.nombre,
                apellido: duenoData.apellido,
                rut: duenoData.rut,
                telefono: duenoData.telefono,
                email: duenoData.email,
                direccion: duenoData.direccion
              }
            }
          };
          console.log('Consulta final construida:', consulta);
          
          return consulta;
        } catch (error) {
          console.error('Error al procesar consulta:', consultaDoc.id, error);
          return null;
        }
      });
      
      const consultasResults = await Promise.all(consultasPromises);
      const consultasValidas = consultasResults.filter((consulta): consulta is Consulta => consulta !== null);
      console.log('Consultas válidas:', consultasValidas.length);
      
      setConsultas(consultasValidas);
      
      if (consultasValidas.length === 0) {
        toast({
          title: 'Sin consultas',
          description: 'No se encontraron consultas registradas',
        });
      }
    } catch (error) {
      console.error('Error al cargar consultas:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las consultas. Por favor, intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const cargarCitasAgendadas = async () => {
    try {
      const fetchedAppointments = await getAppointments();
      // Filtrar solo las citas programadas o confirmadas (no completadas)
      const citasPendientes = fetchedAppointments.filter(app => 
        app.status === 'Programada' || app.status === 'Confirmada'
      );
      setAppointments(citasPendientes);
    } catch (error) {
      console.error('Error al cargar citas agendadas:', error);
    }
  };

  useEffect(() => {
    cargarConsultas();
    cargarCitasAgendadas();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAppointmentDate = (dateStr: string, timeStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) + ` a las ${timeStr}`;
  };

  const filteredConsultas = consultas.filter(consulta => {
    const searchLower = searchTerm.toLowerCase();
    return (
      consulta.mascota?.nombre.toLowerCase().includes(searchLower) ||
      consulta.mascota?.dueno?.nombre.toLowerCase().includes(searchLower) ||
      consulta.motivo.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteAppointment = async (appointmentId: string, patientName: string) => {
    if (confirm(`¿Estás seguro de que quieres eliminar la cita de ${patientName}?`)) {
      try {
        await deleteAppointment(appointmentId);
        toast({
          title: "Cita eliminada",
          description: "La cita ha sido eliminada exitosamente.",
        });
        // Recargar las citas
        cargarCitasAgendadas();
      } catch (error) {
        console.error('Error al eliminar cita:', error);
        toast({
          title: "Error",
          description: "No se pudo eliminar la cita. Por favor, intenta de nuevo.",
          variant: 'destructive'
        });
      }
    }
  };

  const handleMarcarComoRealizada = async (consulta: Consulta) => {
    try {
      console.log('Actualizando consulta:', consulta);
      
      // La ruta correcta debería ser: duenos/{duenoId}/mascotas/{mascotaId}/consultas/{consultaId}
      // Pero necesitamos obtener el duenoId de la consulta
      const duenoId = consulta.mascota?.duenoId || consulta.mascota?.dueno?.id;
      
      if (!duenoId) {
        console.error('No se pudo obtener el duenoId de la consulta');
        toast({
          title: "Error",
          description: "No se pudo identificar el dueño de la mascota.",
          variant: 'destructive'
        });
        return;
      }

      // Actualizar el estado de la consulta en Firestore
      const consultaRef = doc(db, 'duenos', duenoId, 'mascotas', consulta.mascotaId, 'consultas', consulta.id);
      console.log('Referencia de consulta:', consultaRef.path);
      
      await updateDoc(consultaRef, {
        estado: 'Realizada'
      });

      toast({
        title: "Consulta actualizada",
        description: "La consulta ha sido marcada como realizada.",
      });

      // Recargar las consultas
      cargarConsultas();
    } catch (error) {
      console.error('Error al actualizar consulta:', error);
      toast({
        title: "Error",
        description: "No se pudo actualizar la consulta. Por favor, intenta de nuevo.",
        variant: 'destructive'
      });
    }
  };

  const handleEditConsulta = (consulta: Consulta) => {
    setSelectedConsulta(consulta);
    setIsEditarOpen(true);
  };

  const handleConsultaUpdated = () => {
    cargarConsultas();
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    console.log('Cita agendada clickeada:', appointment);
    setSelectedAppointment(appointment);
    setIsNuevaConsultaOpen(true);
  };

  const handleNuevaConsultaCreated = () => {
    setIsNuevaConsultaOpen(false);
    setSelectedAppointment(null);
    cargarConsultas();
    cargarCitasAgendadas();
  };

  return (
    <RouteGuard resource="consultas" action="read">
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
          <Header title="Gestión de Consultas" />
          
          <main className="flex-1 p-6 overflow-y-auto bg-background space-y-6">
            {/* Sección de Citas Agendadas - Visible para todos pero con elementos desactivados */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Citas Agendadas</h2>
              </div>
              
              {appointments.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-muted-foreground">No hay citas agendadas pendientes</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Ve a la sección de Agenda para programar una cita
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-3">
                  {appointments.map((appointment) => (
                    <Card 
                      key={appointment.id} 
                      className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-primary"
                      onClick={() => handleAppointmentClick(appointment)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="font-semibold">{appointment.patientName}</span>
                              <span className="text-sm text-muted-foreground">
                                ({appointment.ownerName})
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatAppointmentDate(appointment.date, appointment.time)}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span>Tipo: {appointment.type}</span>
                              <span>Veterinario: {appointment.veterinarian}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <DisabledButton
                              resource="citas"
                              action="delete"
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              tooltip="Eliminar cita agendada"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteAppointment(appointment.id, appointment.patientName);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </DisabledButton>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Sección de Consultas Existentes */}
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">Consultas</h2>
                </div>
                <div className="flex gap-4 flex-1 max-w-md">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por mascota, dueño o motivo..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <LoadingSpinner size="md" variant="primary" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Consultas Pendientes */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-orange-600 flex items-center gap-2">
                      <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                      Consultas en proceso
                    </h3>
                    
                    {filteredConsultas.filter(c => c.estado === 'Pendiente').length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">No hay consultas en proceso</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {filteredConsultas
                          .filter(consulta => consulta.estado === 'Pendiente')
                          .map((consulta) => (
                          <Card 
                            key={consulta.id} 
                            className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-orange-500"
                            onClick={() => {
                              setSelectedConsulta(consulta);
                              setIsDetalleOpen(true);
                            }}
                          >
                            <CardHeader>
                              <CardTitle className="flex justify-between items-start">
                                <div>
                                  <span className="text-lg font-semibold">{consulta.mascota?.nombre}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    - {consulta.mascota?.dueno?.nombre}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(consulta.fecha)}
                                  </span>
                                  <DisabledButton
                                    resource="consultas"
                                    action="update"
                                    size="sm"
                                    variant="outline"
                                    tooltip="Editar consulta"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Botón Editar clickeado');
                                      handleEditConsulta(consulta);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DisabledButton>
                                  <DisabledButton
                                    resource="consultas"
                                    action="update"
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                    tooltip="Marcar consulta como realizada"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Botón Marcar como Realizada clickeado');
                                      handleMarcarComoRealizada(consulta);
                                    }}
                                  >
                                    Marcar como Realizada
                                  </DisabledButton>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Motivo:</strong> {consulta.motivo}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Diagnóstico:</strong> {consulta.diagnostico || 'Pendiente'}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Consultas Realizadas */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-green-600 flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      Consultas Realizadas
                    </h3>
                    
                    {filteredConsultas.filter(c => c.estado === 'Realizada').length === 0 ? (
                      <Card>
                        <CardContent className="p-6 text-center">
                          <p className="text-muted-foreground">No hay consultas realizadas</p>
                        </CardContent>
                      </Card>
                    ) : (
                      <div className="grid gap-4">
                        {filteredConsultas
                          .filter(consulta => consulta.estado === 'Realizada')
                          .map((consulta) => (
                          <Card 
                            key={consulta.id} 
                            className="cursor-pointer hover:bg-accent/50 transition-colors border-l-4 border-l-green-500"
                            onClick={() => {
                              setSelectedConsulta(consulta);
                              setIsDetalleOpen(true);
                            }}
                          >
                            <CardHeader>
                              <CardTitle className="flex justify-between items-start">
                                <div>
                                  <span className="text-lg font-semibold">{consulta.mascota?.nombre}</span>
                                  <span className="text-sm text-muted-foreground ml-2">
                                    - {consulta.mascota?.dueno?.nombre}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm text-muted-foreground">
                                    {formatDate(consulta.fecha)}
                                  </span>
                                  <DisabledButton
                                    resource="consultas"
                                    action="update"
                                    size="sm"
                                    variant="outline"
                                    tooltip="Editar consulta"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      console.log('Botón Editar clickeado');
                                      handleEditConsulta(consulta);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4 mr-2" />
                                    Editar
                                  </DisabledButton>
                                </div>
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground mb-2">
                                <strong>Motivo:</strong> {consulta.motivo}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                <strong>Diagnóstico:</strong> {consulta.diagnostico}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {selectedConsulta && (
        <>
          <DetalleConsultaModal
            consulta={selectedConsulta}
            isOpen={isDetalleOpen}
            onClose={() => {
              setIsDetalleOpen(false);
              setSelectedConsulta(null);
            }}
            onEdit={() => handleEditConsulta(selectedConsulta)}
          />
          <EditarConsultaModal
            consulta={selectedConsulta}
            isOpen={isEditarOpen}
            onClose={() => {
              setIsEditarOpen(false);
              setSelectedConsulta(null);
            }}
            onConsultaUpdated={handleConsultaUpdated}
          />
        </>
      )}

      {selectedAppointment && (
        <NuevaConsultaModal
          isOpen={isNuevaConsultaOpen}
          onClose={() => {
            setIsNuevaConsultaOpen(false);
            setSelectedAppointment(null);
          }}
          onConsultaCreated={handleNuevaConsultaCreated}
          selectedAppointment={selectedAppointment}
        />
      )}
    </RouteGuard>
  );
} 