"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import OwnerTable from '../../components/OwnerTable';
import { getOwners, deleteOwner, initializeSamplePatients } from '../../lib/firestore';
import { Owner } from '@/types';
import OwnerDetailsModal from '../../components/OwnerDetailsModal';
import { EditOwnerModal } from '../../components/EditOwnerModal';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DisabledButton, RouteGuard } from '@/components/RoleGuard';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export default function DuenosClientesPage() {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  
  const [selectedOwner, setSelectedOwner] = useState<Owner | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [ownerToEdit, setOwnerToEdit] = useState<Owner | null>(null);
  const { toast } = useToast();
  const [busqueda, setBusqueda] = useState('');

  const fetchOwners = async () => {
    try {
      setLoading(true);
      setError(null);
      const firestoreOwners = await getOwners();
      setOwners(firestoreOwners);
      
      // Inicializar mascotas de ejemplo si es necesario
      await initializeSamplePatients();
      
    } catch (err) {
      setError(`Error al cargar dueños: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchOwners();
  }, []);
  
  const handleOwnerClick = (owner: Owner) => {
    setSelectedOwner(owner);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOwner(null);
  };

  const handleEditOwner = (owner: Owner) => {
    setOwnerToEdit(owner);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setOwnerToEdit(null);
  };

  const handleOwnerUpdated = async () => {
    await fetchOwners();
  };

  const handleDeleteOwner = async (ownerId: string) => {
    const ownerToDelete = owners.find(owner => owner.id === ownerId);
    if (!ownerToDelete) return;

    const confirmDelete = window.confirm(
      `¿Estás seguro de que quieres eliminar al dueño "${ownerToDelete.nombre} ${ownerToDelete.apellido}"?\n\n` +
      `Esta acción también eliminará todas las mascotas asociadas a este dueño y no se puede deshacer.`
    );

    if (confirmDelete) {
      try {
        setLoading(true);
        await deleteOwner(ownerId);
        
        toast({
          title: "Dueño eliminado",
          description: `El dueño "${ownerToDelete.nombre} ${ownerToDelete.apellido}" ha sido eliminado exitosamente.`,
        });

        // Recargar la lista de dueños
        await fetchOwners();
      } catch (err) {
        console.error('Error al eliminar dueño:', err);
        toast({
          title: "Error al eliminar",
          description: "No se pudo eliminar el dueño. Inténtalo de nuevo.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    };

  // Filtrar dueños basado en el término de búsqueda
  const ownersFiltrados = owners.filter(owner => {
    const busquedaLower = busqueda.toLowerCase();
    const nombreCompleto = `${owner.nombre} ${owner.apellido}`.toLowerCase();
    return (
      nombreCompleto.includes(busquedaLower) ||
      owner.rut.replace(/[.-]/g, '').includes(busquedaLower.replace(/[.-]/g, ''))
    );
  });

  const totalPages = Math.ceil(ownersFiltrados.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOwners = ownersFiltrados.slice(startIndex, endIndex);
  const displayedStart = startIndex + 1;
  const displayedEnd = Math.min(endIndex, ownersFiltrados.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <RouteGuard resource="duenos" action="read">
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
          <Header title="Dueños / Clientes" />
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-background">
            {/* Barra de búsqueda */}
            <div className="bg-card rounded-lg shadow border p-3 sm:p-4 mb-4 sm:mb-6">
              <div className="flex justify-between items-center gap-2 sm:gap-4">
                <div className="flex items-center flex-grow">
                  <Input 
                    type="text" 
                    placeholder="Buscar por nombre, apellido o RUT..."
                    className="w-full text-sm sm:text-base"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                  />
                </div>
                {busqueda && (
                  <Button variant="outline" onClick={() => setBusqueda('')} size="sm">
                    Limpiar
                  </Button>
                )}
                <DisabledButton
                  resource="duenos"
                  action="create"
                  onClick={() => {/* TODO: Implementar modal de nuevo dueño */}}
                  className="h-9 sm:h-11 px-3 sm:px-6 text-sm sm:text-base font-medium hover:scale-105 transition-all duration-200 cursor-pointer hover:shadow-lg"
                  tooltip="Agregar nuevo dueño"
                >
                  <span className="hidden sm:inline">Agregar Dueño</span>
                  <span className="sm:hidden">Agregar</span>
                </DisabledButton>
              </div>
            </div>

            {/* Tabla de dueños/clientes */}
            <div className="mb-4 sm:mb-6">
              {loading && (
                <div className="flex items-center justify-center p-6 sm:p-8">
                  <div className="text-center">
                    <LoadingSpinner size="md" variant="primary" className="mx-auto mb-3 sm:mb-4" />
                    <p className="text-muted-foreground text-sm sm:text-base">Cargando dueños...</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4">
                  <p className="font-semibold text-sm sm:text-base">Error:</p>
                  <p className="text-sm sm:text-base">{error}</p>
                </div>
              )}
              {!loading && !error && ownersFiltrados.length === 0 && (
                <div className="text-center p-6 sm:p-8">
                  <p className="text-muted-foreground text-sm sm:text-base">
                    {busqueda ? 'No se encontraron dueños que coincidan con la búsqueda.' : 'No hay dueños registrados.'}
                  </p>
              </div>
              )}
              {!loading && !error && ownersFiltrados.length > 0 && (
                <OwnerTable 
                  owners={currentOwners} 
                  onRowClick={handleOwnerClick}
                  onEdit={handleEditOwner}
                  onDelete={handleDeleteOwner}
                />
              )}
              </div>

               {/* Paginación */}
            <div className="flex items-center justify-between border-t border-border bg-card px-3 sm:px-4 py-2 sm:py-3 sm:px-6 rounded-lg shadow">
                 <div className="flex-1 flex justify-between sm:hidden">
                   {/* Mobile pagination */}
                    <button 
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-input text-xs sm:text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Anterior
                    </button>
                    <button 
                      onClick={() => handlePageChange(currentPage + 1)}
                       disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border border-input text-xs sm:text-sm font-medium rounded-md text-foreground bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Siguiente
                    </button>
                 </div>
                 <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      Mostrando <span className="font-medium">{displayedStart}</span> a <span className="font-medium">{displayedEnd}</span> de <span className="font-medium">{ownersFiltrados.length}</span> dueños
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                         {[...Array(totalPages)].map((_, i) => (
                           <button
                             key={i}
                             onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-medium ${
                            currentPage === i + 1 
                              ? 'z-10 bg-primary border-primary text-primary-foreground' 
                              : 'border-input text-foreground hover:bg-accent'
                          }`}
                           >
                             {i + 1}
                           </button>
                         ))}
                      </nav>
                    </div>
                 </div>
              </div>
            </main>
        </div>
      </div>
      
      <OwnerDetailsModal 
        owner={selectedOwner}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
      />
      
      <EditOwnerModal
        owner={ownerToEdit}
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onOwnerUpdated={handleOwnerUpdated}
      />
    </RouteGuard>
  );
} 