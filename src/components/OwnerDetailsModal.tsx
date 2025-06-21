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
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            Detalles del Dueño - {owner.nombre} {owner.apellido}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="space-y-6 pr-4">
            {/* Información del dueño */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Nombre:</span>
                  <p className="font-medium">{owner.nombre} {owner.apellido}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">RUT:</span>
                  <p className="font-medium">{owner.rut}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Teléfono:</span>
                  <p className="font-medium">{owner.telefono}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>
                  <p className="font-medium">{owner.email}</p>
                </div>
                <div className="md:col-span-2">
                  <span className="text-muted-foreground">Dirección:</span>
                  <p className="font-medium">{owner.direccion}</p>
                </div>
              </div>
            </div>

            {/* Lista de mascotas */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Mascotas</h3>
              {pets.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pets.map((pet) => (
                    <div key={pet.id} className="bg-card border border-border rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <span className="text-primary-foreground font-semibold text-sm">
                            {pet.nombre.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium text-card-foreground">{pet.nombre}</h4>
                          <p className="text-sm text-muted-foreground">{pet.especie} • {pet.raza}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Edad:</span>
                          <span className="text-card-foreground">{pet.edad} años</span>
                        </div>
                        {pet.sexo && (
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sexo:</span>
                            <span className="text-card-foreground">{pet.sexo}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No hay mascotas registradas para este dueño</p>
                </div>
              )}
            </div>
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

export default OwnerDetailsModal; 