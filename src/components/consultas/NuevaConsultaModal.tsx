"use client";

import { useState } from 'react';
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
import { Mascota, Dueno, MascotaInput, ConsultaFormData } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface NuevaConsultaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConsultaCreated: () => void;
}

export function NuevaConsultaModal({ isOpen, onClose, onConsultaCreated }: NuevaConsultaModalProps) {
  const [rut, setRut] = useState('');
  const [duenoData, setDuenoData] = useState<Dueno | null>(null);
  const [mascotaData, setMascotaData] = useState<Mascota | null>(null);
  const [mascotasDueno, setMascotasDueno] = useState<Mascota[]>([]);
  const [mostrarFormMascota, setMostrarFormMascota] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

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

    try {
      const duenosRef = collection(db, 'duenos');
      const q = query(duenosRef, where('rut', '==', rut));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('No se encontró ningún dueño con ese RUT');
        return;
      }

      const duenoDoc = querySnapshot.docs[0];
      const dueno: Dueno = {
        id: duenoDoc.id,
        nombre: duenoDoc.data().nombre,
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
      } as Mascota));
      
      setMascotasDueno(mascotas);
    } catch (error) {
      console.error('Error al buscar dueño:', error);
      setError('Error al buscar el dueño');
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
    if (!duenoData) return;
    
    try {
      setIsLoading(true);
      setError(null);

      // Guardar la mascota en la subcolección del dueño
      const mascotasRef = collection(db, `duenos/${duenoData.id}/mascotas`);
      const mascotaDoc = await addDoc(mascotasRef, mascotaInput);

      const nuevaMascota: Mascota = {
        ...mascotaInput,
        id: mascotaDoc.id,
        duenoId: duenoData.id,
        dueno: duenoData
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
      await addDoc(consultaRef, {
        ...data,
        veterinarioId: user?.uid,
        fecha: new Date(),
        proximaCita: data.proximaCita ? new Date(data.proximaCita) : null
      });
      toast({
        title: "Consulta creada",
        description: "La consulta se ha creado correctamente",
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
          <DialogTitle>Nueva Consulta</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-4 pr-4">
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

            {error && (
              <div className="text-red-500 text-sm">{error}</div>
            )}

            {duenoData && !mascotaData && !mostrarFormMascota && (
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

            {duenoData && mostrarFormMascota && (
              <MascotaForm 
                duenoId={duenoData.id}
                onMascotaCreated={handleMascotaCreated}
                onCancel={() => setMostrarFormMascota(false)}
              />
            )}

            {mascotaData && (
              <ConsultaForm 
                mascota={mascotaData}
                onConsultaCreated={handleSubmit}
              />
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 