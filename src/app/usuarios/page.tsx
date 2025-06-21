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
import { PlusCircle } from 'lucide-react';
import { UserCard } from '@/components/UserCard';

interface Usuario {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  lastSignInTime?: string;
  emailVerified?: boolean;
  disabled?: boolean;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const usuariosFiltrados = usuarios.filter(usuario => {
    const searchLower = searchTerm.toLowerCase();
    return (
      usuario.email?.toLowerCase().includes(searchLower) ||
      usuario.displayName?.toLowerCase().includes(searchLower) ||
      usuario.role?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <CreateUserModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserCreated={cargarUsuarios}
      />
      <div className="flex-1 overflow-y-auto bg-[#121212]">
        <div className="container mx-auto py-6 px-4">
          <Header title="Gestión de Usuarios" />
          
          <main className="flex-1 p-6 overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex gap-4 flex-1 max-w-md">
                <Input
                  placeholder="Buscar por email, nombre o rol..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-gray-700 text-white border-gray-600"
                />
              </div>
              <Button onClick={() => setIsCreateModalOpen(true)}>
                <PlusCircle className="w-5 h-5 mr-2" />
                Nuevo Usuario
              </Button>
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : usuariosFiltrados.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <p>No se encontraron usuarios que coincidan con la búsqueda.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {usuariosFiltrados.map((usuario) => (
                  <UserCard key={usuario.uid} usuario={usuario} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
} 