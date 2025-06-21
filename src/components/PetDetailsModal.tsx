"use client";

import React from 'react';
import Modal from './Modal';
import { Patient } from '../lib/firestore';
import { PawPrint, Tag, Calendar, User, Activity, CircleUserRound, Hash } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface PetDetailsModalProps {
  pet: Patient | null;
  isOpen: boolean;
  onClose: () => void;
}

const PetDetailsModal: React.FC<PetDetailsModalProps> = ({ pet, isOpen, onClose }) => {
  if (!pet) return null;

  const getStatusColor = (status: Patient['estado']) => {
    switch (status) {
      case 'Activo': return 'bg-green-500/20 text-green-300';
      case 'En seguimiento': return 'bg-yellow-500/20 text-yellow-300';
      case 'Dado de alta': return 'bg-gray-500/20 text-gray-300';
      default: return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Detalles de la Mascota - {pet.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="space-y-6 pr-4">
            {/* Información de la mascota */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Información de la Mascota</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Nombre:</span>
                  <p className="text-white">{pet.nombre}</p>
                </div>
                <div>
                  <span className="text-gray-400">Especie:</span>
                  <p className="text-white">{pet.especie}</p>
                </div>
                <div>
                  <span className="text-gray-400">Raza:</span>
                  <p className="text-white">{pet.raza}</p>
                </div>
                <div>
                  <span className="text-gray-400">Edad:</span>
                  <p className="text-white">{pet.edad} años</p>
                </div>
                <div>
                  <span className="text-gray-400">Código:</span>
                  <p className="text-white">{pet.codigo}</p>
                </div>
                <div>
                  <span className="text-gray-400">Veterinario:</span>
                  <p className="text-white">{pet.veterinario}</p>
                </div>
                <div>
                  <span className="text-gray-400">Última Atención:</span>
                  <p className="text-white">{pet.ultimaAtencion}</p>
                </div>
                <div>
                  <span className="text-gray-400">Estado:</span>
                  <p className="text-white">{pet.estado}</p>
                </div>
              </div>
            </div>

            {/* Información del dueño */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Información del Dueño</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Nombre:</span>
                  <p className="text-white">{pet.owner}</p>
                </div>
                <div>
                  <span className="text-gray-400">ID del Dueño:</span>
                  <p className="text-white">{pet.ownerId}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PetDetailsModal; 