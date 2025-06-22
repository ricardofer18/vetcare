"use client"

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleInfo } from '@/components/RoleInfo';
import { ThemeToggle } from '@/components/ThemeToggle';
import { UserRole, RolePermissions, Permission } from '@/types';
import { useAuth } from '@/lib/auth';
import { getAllRolePermissions, setRolePermissions } from '@/lib/firestore';
import { useToast } from '@/components/ui/use-toast';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { RouteGuard } from '@/components/RoleGuard';
import { 
  Shield, 
  Stethoscope, 
  UserCheck, 
  Settings,
  Users,
  User,
  Mail,
  Calendar,
  Save
} from 'lucide-react';

// Función helper para obtener el nombre del rol
const getRoleName = (role: UserRole | null): string => {
  switch (role) {
    case 'admin':
      return 'Administrador';
    case 'veterinario':
      return 'Veterinario';
    case 'secretaria':
      return 'Secretaria';
    default:
      return 'No asignado';
  }
};

// Función helper para obtener el ícono del rol
const getRoleIcon = (role: UserRole | null) => {
  switch (role) {
    case 'admin':
      return <Shield className="h-4 w-4 text-muted-foreground" />;
    case 'veterinario':
      return <Stethoscope className="h-4 w-4 text-muted-foreground" />;
    case 'secretaria':
      return <UserCheck className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

export default function ConfiguracionPage() {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin');
  
  // State for permissions
  const [permissions, setPermissions] = useState<RolePermissions | null>(null);
  const [initialPermissions, setInitialPermissions] = useState<RolePermissions | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (userRole === 'admin') {
        setIsLoading(true);
        try {
          const perms = await getAllRolePermissions();
          setPermissions(perms);
          setInitialPermissions(JSON.parse(JSON.stringify(perms))); // Deep copy for comparison
        } catch (error) {
          console.error("Error fetching permissions:", error);
          toast({ title: "Error", description: "No se pudieron cargar los permisos.", variant: "destructive" });
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchPermissions();
  }, [userRole, toast]);

  const handlePermissionChange = (resource: string, action: string, value: boolean) => {
    if (!permissions) return;
    
    setPermissions(prev => {
      const newPermissions = JSON.parse(JSON.stringify(prev)); // Deep copy
      const rolePerms = newPermissions[selectedRole].find((p: Permission) => p.resource === resource);
      if (rolePerms) {
        if (value) {
          if (!rolePerms.actions.includes(action)) {
            rolePerms.actions.push(action);
          }
        } else {
          rolePerms.actions = rolePerms.actions.filter((a: string) => a !== action);
        }
      }
      return newPermissions;
    });
  };

  const handleSaveChanges = async () => {
    if (!permissions) return;

    setIsSaving(true);
    try {
      await Promise.all([
        setRolePermissions('veterinario', permissions.veterinario),
        setRolePermissions('secretaria', permissions.secretaria),
      ]);
      
      setInitialPermissions(JSON.parse(JSON.stringify(permissions)));
      toast({ title: "Permisos guardados", description: "Los cambios se aplicarán en tiempo real a todos los usuarios afectados." });
    } catch (error) {
      console.error("Error saving permissions:", error);
      toast({ title: "Error", description: "No se pudieron guardar los cambios.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanges = JSON.stringify(permissions) !== JSON.stringify(initialPermissions);

  if (userRole !== 'admin') {
    // Vista para no administradores
    return (
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
          <Header title="Configuración" />
          <main className="flex-1 p-6 overflow-y-auto bg-background">
            <div className="max-w-4xl mx-auto space-y-6">
               <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración Personal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gestiona tu información personal y preferencias de la aplicación.
                  </p>
                </CardContent>
              </Card>

              <Tabs defaultValue="perfil" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="perfil" className="flex items-center gap-2"> <User className="h-4 w-4" /> Mi Perfil </TabsTrigger>
                  <TabsTrigger value="apariencia" className="flex items-center gap-2"> <Settings className="h-4 w-4" /> Apariencia </TabsTrigger>
                </TabsList>

                <TabsContent value="perfil" className="space-y-4">
                  <Card>
                    <CardHeader> <CardTitle>Información del Usuario</CardTitle> </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user?.email || 'No disponible'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">ID de Usuario</p>
                            <p className="text-sm text-muted-foreground">{user?.uid || 'No disponible'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          {getRoleIcon(userRole)}
                          <div>
                            <p className="text-sm font-medium">Rol</p>
                            <p className="text-sm text-muted-foreground">{getRoleName(userRole)}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="apariencia" className="space-y-4">
                  <ThemeToggle />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Vista para administradores
  return (
    <RouteGuard resource="configuracion" action="read">
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
          <Header title="Configuración" />
          <main className="flex-1 p-6 overflow-y-auto bg-background">
            <div className="max-w-6xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Configuración del Sistema
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Gestiona los permisos para cada rol y tus preferencias personales.
                  </p>
                </CardContent>
              </Card>

              <Tabs defaultValue="roles" className="space-y-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="roles" className="flex items-center gap-2"><Users className="h-4 w-4" />Sistema de Roles</TabsTrigger>
                  <TabsTrigger value="perfil" className="flex items-center gap-2"><User className="h-4 w-4" />Mi Perfil</TabsTrigger>
                  <TabsTrigger value="apariencia" className="flex items-center gap-2"><Settings className="h-4 w-4" />Apariencia</TabsTrigger>
                </TabsList>

                <TabsContent value="roles" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle>Sistema de Roles y Permisos</CardTitle>
                        <Button onClick={handleSaveChanges} disabled={!hasChanges || isSaving}>
                          {isSaving ? <LoadingSpinner size="sm" /> : <Save className="h-4 w-4 mr-2" />}
                          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {isLoading ? (
                        <div className="flex justify-center items-center h-64">
                          <LoadingSpinner size="lg" />
                        </div>
                      ) : (
                        permissions && (
                          <div className="grid gap-4">
                            <div className="flex gap-2 border-b pb-4">
                              <Button variant={selectedRole === 'admin' ? 'default' : 'outline'} onClick={() => setSelectedRole('admin')}><Shield className="h-4 w-4 mr-2" />Administrador</Button>
                              <Button variant={selectedRole === 'veterinario' ? 'default' : 'outline'} onClick={() => setSelectedRole('veterinario')}><Stethoscope className="h-4 w-4 mr-2" />Veterinario</Button>
                              <Button variant={selectedRole === 'secretaria' ? 'default' : 'outline'} onClick={() => setSelectedRole('secretaria')}><UserCheck className="h-4 w-4 mr-2" />Secretaria</Button>
                            </div>
                            <RoleInfo 
                              role={selectedRole}
                              permissions={permissions[selectedRole]}
                              onPermissionChange={handlePermissionChange}
                              isEditingDisabled={selectedRole === 'admin'}
                            />
                          </div>
                        )
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="perfil" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Información del Administrador</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Email</p>
                            <p className="text-sm text-muted-foreground">{user?.email || 'No disponible'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">ID de Usuario</p>
                            <p className="text-sm text-muted-foreground">{user?.uid || 'No disponible'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Rol</p>
                            <p className="text-sm text-muted-foreground">Administrador</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3 border rounded-lg">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Fecha de Registro</p>
                            <p className="text-sm text-muted-foreground">Información no disponible</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="apariencia" className="space-y-4">
                  <ThemeToggle />
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
