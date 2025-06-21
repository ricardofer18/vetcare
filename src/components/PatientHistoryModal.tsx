"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Patient, Consulta } from '@/types';
import { Calendar, Clock, FileText, User } from 'lucide-react';

interface PatientHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Patient;
}

export const PatientHistoryModal: React.FC<PatientHistoryModalProps> = ({
  isOpen,
  onClose,
  paciente
}) => {
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && paciente) {
      cargarHistorial();
    }
  }, [isOpen, paciente]);

  const cargarHistorial = async () => {
    try {
      setIsLoading(true);
      console.log('Cargando historial para paciente:', paciente.id, 'del dueño:', paciente.duenoId);
      
      // Buscar consultas en la subcolección de la mascota específica
      const consultasRef = collection(db, `duenos/${paciente.duenoId}/mascotas/${paciente.id}/consultas`);
      console.log('Ruta de consultas:', `duenos/${paciente.duenoId}/mascotas/${paciente.id}/consultas`);
      
      const q = query(
        consultasRef,
        orderBy('fecha', 'desc')
      );
      
      const consultasSnapshot = await getDocs(q);
      console.log('Consultas encontradas:', consultasSnapshot.size);
      
      const consultasData: Consulta[] = [];
      
      consultasSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Datos de consulta:', { id: doc.id, ...data });
        
        consultasData.push({
          id: doc.id,
          mascotaId: paciente.id,
          veterinarioId: data.veterinarioId,
          fecha: data.fecha.toDate(),
          motivo: data.motivo,
          sintomas: data.sintomas,
          diagnostico: data.diagnostico,
          tratamiento: data.tratamiento,
          proximaCita: data.proximaCita?.toDate(),
          veterinario: data.veterinario
        });
      });
      
      console.log('Consultas procesadas:', consultasData.length);
      setConsultas(consultasData);
    } catch (error) {
      console.error('Error al cargar historial:', error);
      // Mostrar error al usuario
      setConsultas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Historial de Consultas - {paciente.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="space-y-4 pr-4">
            {/* Información del paciente */}
            <div className="bg-muted rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Especie:</span>
                  <p className="font-medium">{paciente.especie}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Raza:</span>
                  <p className="font-medium">{paciente.raza}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Edad:</span>
                  <p className="font-medium">{paciente.edad} años</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Dueño:</span>
                  <p className="font-medium">{paciente.dueno?.nombre}</p>
                </div>
              </div>
            </div>

            {/* Lista de consultas */}
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : consultas.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No hay consultas registradas para este paciente</p>
              </div>
            ) : (
              <div className="space-y-4">
                {consultas.map((consulta) => (
                  <div
                    key={consulta.id}
                    className="bg-card border border-border rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="font-medium text-card-foreground">
                          {formatDate(consulta.fecha)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="grid gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground font-medium">Motivo:</span>
                        <p className="text-card-foreground mt-1">{consulta.motivo}</p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground font-medium">Síntomas:</span>
                        <p className="text-card-foreground mt-1">{consulta.sintomas}</p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground font-medium">Diagnóstico:</span>
                        <p className="text-card-foreground mt-1">{consulta.diagnostico}</p>
                      </div>
                      
                      <div>
                        <span className="text-muted-foreground font-medium">Tratamiento:</span>
                        <p className="text-card-foreground mt-1">{consulta.tratamiento}</p>
                      </div>
                      
                      {consulta.proximaCita && (
                        <div className="flex items-center space-x-2 text-primary">
                          <Clock className="w-4 h-4" />
                          <span className="text-sm">
                            Próxima cita: {formatDate(consulta.proximaCita)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 