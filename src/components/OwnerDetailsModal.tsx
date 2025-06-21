"use client";

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import PetDetailsModal from './PetDetailsModal';
import { Owner, Patient, getPatientsByOwnerId } from '../lib/firestore';
import { User, Mail, Phone, MapPin, PawPrint, AlertCircle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface OwnerDetailsModalProps {
  owner: Owner | null;
  isOpen: boolean;
  onClose: () => void;
}

const OwnerDetailsModal: React.FC<OwnerDetailsModalProps> = ({ owner, isOpen, onClose }) => {
  const [pets, setPets] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPet, setSelectedPet] = useState<Patient | null>(null);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);

  useEffect(() => {
    if (owner && isOpen) {
      const fetchPets = async () => {
        setLoading(true);
        setError(null);
        console.log(`[OwnerDetailsModal] Fetching pets for owner ID: ${owner.id}`);
        try {
          const ownerPets = await getPatientsByOwnerId(owner.id);
          console.log(`[OwnerDetailsModal] Found ${ownerPets.length} pets:`, ownerPets);
          setPets(ownerPets);
        } catch (err) {
          console.error(`[OwnerDetailsModal] Error fetching pets:`, err);
          setError('No se pudieron cargar las mascotas.');
        } finally {
          setLoading(false);
        }
      };
      fetchPets();
    }
  }, [owner, isOpen]);

  const handlePetClick = (pet: Patient) => {
    setSelectedPet(pet);
    setIsPetModalOpen(true);
  };

  const handleClosePetModal = () => {
    setIsPetModalOpen(false);
    setSelectedPet(null);
  };

  if (!owner) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Detalles del Dueño - {owner.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="space-y-6 pr-4">
            {/* Información del dueño */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Nombre:</span>
                  <p className="text-white">{owner.nombre}</p>
                </div>
                <div>
                  <span className="text-gray-400">RUT:</span>
                  <p className="text-white">{owner.rut}</p>
                </div>
                <div>
                  <span className="text-gray-400">Teléfono:</span>
                  <p className="text-white">{owner.telefono}</p>
                </div>
                <div>
                  <span className="text-gray-400">Email:</span>
                  <p className="text-white">{owner.email}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-gray-400">Dirección:</span>
                  <p className="text-white">{owner.direccion}</p>
                </div>
              </div>
            </div>

            {/* Lista de mascotas */}
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">
                <p>{error}</p>
              </div>
            ) : pets.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <p>No hay mascotas registradas para este dueño</p>
                <p className="text-sm text-gray-500 mt-2">
                  Las mascotas aparecerán aquí cuando se registren
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Mascotas ({pets.length})</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pets.map((pet) => (
                    <div key={pet.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-white">{pet.nombre}</h4>
                        <span className="text-xs text-gray-400">{pet.edad} años</span>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p className="text-gray-300">
                          <span className="text-gray-400">Especie:</span> {pet.especie}
                        </p>
                        <p className="text-gray-300">
                          <span className="text-gray-400">Raza:</span> {pet.raza}
                        </p>
                        {pet.sexo && (
                          <p className="text-gray-300">
                            <span className="text-gray-400">Sexo:</span> {pet.sexo}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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

export default OwnerDetailsModal; 