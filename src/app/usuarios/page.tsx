"use client";

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';
import { CreateUserModal } from '@/components/auth/CreateUserModal';
import { EditUserModal } from '@/components/EditUserModal';
import { PlusCircle } from 'lucide-react';
import { UserCard } from '@/components/UserCard';
import { UserRole } from '@/types';
import { DisabledButton } from '@/components/RoleGuard';

interface Usuario {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastSignInTime?: string;
  emailVerified?: boolean;
  disabled?: boolean;
  active?: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setLoading(true);
      const usuariosRef = collection(db, 'usuarios');
      const usuariosSnapshot = await getDocs(usuariosRef);
      
      const usuariosData = usuariosSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as Usuario[];

      setUsuarios(usuariosData);
    } catch (error: any) {
      console.error('Error al cargar usuarios:', error);
      
      let errorMessage = 'No se pudieron cargar los usuarios';
      
      // Manejar errores específicos de Firestore
      if (error.code) {
        switch (error.code) {
          case 'permission-denied':
            errorMessage = 'No tienes permisos para ver los usuarios';
            break;
          case 'unavailable':
            errorMessage = 'El servicio no está disponible. Por favor, intenta más tarde';
            break;
          case 'not-found':
            errorMessage = 'No se encontró la colección de usuarios';
            break;
          case 'unauthenticated':
            errorMessage = 'Debes iniciar sesión para ver los usuarios';
            break;
          default:
            errorMessage = `Error: ${error.message}`;
        }
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (usuario: Usuario) => {
    setSelectedUser(usuario);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const usuariosFiltrados = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    const roleNames = {
      admin: 'administrador',
      veterinario: 'veterinario',
      secretaria: 'secretaria'
    };
    
    return (
      usuario.email?.toLowerCase().includes(searchLower) ||
      usuario.displayName?.toLowerCase().includes(searchLower) ||
      roleNames[usuario.role]?.includes(searchLower)
    );
  });

  return (
    <>
      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={cargarUsuarios}
      />
      
      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUserUpdated={cargarUsuarios}
        usuario={selectedUser}
      />

      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
          <Header title="Gestión de Usuarios" />
          
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-background">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="flex gap-2 sm:gap-4 flex-1 max-w-md">
                  <Input
                    placeholder="Buscar por email, nombre o rol..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="text-sm sm:text-base"
                  />
              </div>
              <DisabledButton 
                resource="usuarios"
                action="create"
                onClick={() => setIsCreateModalOpen(true)}
                tooltip="Crear nuevo usuario del sistema"
                className="w-full sm:w-auto"
              >
                <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Nuevo Usuario</span>
                <span className="sm:hidden">Nuevo</span>
              </DisabledButton>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary"></div>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
                  <div className="text-center py-8 sm:py-12 text-muted-foreground">
                    <p className="text-sm sm:text-base">No se encontraron usuarios que coincidan con la búsqueda.</p>
              </div>
            ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                {usuariosFiltrados.map((usuario) => (
                      <UserCard 
                        key={usuario.uid} 
                        usuario={usuario}
                        onEdit={handleEditUser}
                      />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
} 