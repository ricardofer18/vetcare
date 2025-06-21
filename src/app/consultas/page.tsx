'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { Header } from '@/components/Header';
import { NuevaConsultaModal } from '@/components/consultas/NuevaConsultaModal';
import { collection, query, where, orderBy, getDocs, collectionGroup, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Consulta } from '@/types';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { DetalleConsultaModal } from '@/components/consultas/DetalleConsultaModal';
import { useToast } from '@/components/ui/use-toast';

export default function ConsultasPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNuevaConsultaOpen, setIsNuevaConsultaOpen] = useState(false);
  const [selectedConsulta, setSelectedConsulta] = useState<Consulta | null>(null);
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
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

  useEffect(() => {
    cargarConsultas();
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

  const filteredConsultas = consultas.filter(consulta => {
    const searchLower = searchTerm.toLowerCase();
    return (
      consulta.mascota?.nombre.toLowerCase().includes(searchLower) ||
      consulta.mascota?.dueno?.nombre.toLowerCase().includes(searchLower) ||
      consulta.motivo.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Header title="Consultas" />
      
      <div className="flex justify-between items-center">
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
        <Button onClick={() => setIsNuevaConsultaOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Consulta
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : filteredConsultas.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No hay consultas registradas</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredConsultas.map((consulta) => (
            <Card 
              key={consulta.id} 
              className="cursor-pointer hover:bg-accent/50 transition-colors"
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
                  <span className="text-sm text-muted-foreground">
                    {formatDate(consulta.fecha)}
                  </span>
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

      <NuevaConsultaModal
        isOpen={isNuevaConsultaOpen}
        onClose={() => setIsNuevaConsultaOpen(false)}
        onConsultaCreated={cargarConsultas}
      />

      {selectedConsulta && (
        <DetalleConsultaModal
          consulta={selectedConsulta}
          isOpen={isDetalleOpen}
          onClose={() => {
            setIsDetalleOpen(false);
            setSelectedConsulta(null);
          }}
        />
      )}
    </div>
  );
} 