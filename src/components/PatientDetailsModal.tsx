"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Mascota } from '@/types';
import { Calendar, MapPin, Phone, Mail, User, PawPrint, Weight, Palette, FileText } from 'lucide-react';

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Mascota;
}

export function PatientDetailsModal({ isOpen, onClose, paciente }: PatientDetailsModalProps) {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getSexoLabel = (sexo: string | undefined) => {
    return sexo === 'Macho' ? 'Macho' : sexo === 'Hembra' ? 'Hembra' : 'No especificado';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PawPrint className="w-5 h-5" />
            Detalles del Paciente
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {/* Información Principal del Paciente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {paciente.nombre.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{paciente.nombre}</h2>
                    <p className="text-muted-foreground">
                      {paciente.especie} • {paciente.raza}
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Edad:</span>
                    </div>
                    <p className="font-medium">{paciente.edad} años</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Weight className="w-4 h-4" />
                      <span>Peso:</span>
                    </div>
                    <p className="font-medium">
                      {paciente.peso ? `${paciente.peso} kg` : 'No especificado'}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Sexo:</span>
                    </div>
                    <Badge variant="secondary">
                      {getSexoLabel(paciente.sexo)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Palette className="w-4 h-4" />
                      <span>Color:</span>
                    </div>
                    <p className="font-medium">
                      {paciente.color || 'No especificado'}
                    </p>
                  </div>
                </div>
                
                {paciente.fechaNacimiento && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Fecha de Nacimiento:</span>
                    </div>
                    <p className="font-medium">{formatDate(paciente.fechaNacimiento)}</p>
                  </div>
                )}
                
                {paciente.observaciones && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                    </div>
                    <p className="text-sm bg-muted p-3 rounded-md">
                      {paciente.observaciones}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Información del Dueño */}
            {paciente.dueno && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Información del Dueño
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{paciente.dueno.nombre} {paciente.dueno.apellido}</p>
                        <p className="text-sm text-muted-foreground">RUT: {paciente.dueno.rut}</p>
                      </div>
                    </div>
                    
                    {paciente.dueno.telefono && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-muted-foreground" />
                        <span>{paciente.dueno.telefono}</span>
                      </div>
                    )}
                    
                    {paciente.dueno.email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span>{paciente.dueno.email}</span>
                      </div>
                    )}
                    
                    {paciente.dueno.direccion && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{paciente.dueno.direccion}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 