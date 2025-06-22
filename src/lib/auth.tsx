"use client"

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User as FirebaseUser,
  UserCredential,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useRouter } from "next/navigation"
import { UserRole, ROLE_PERMISSIONS, Permission } from '../types';
import { getUserRole as getUserRoleFromFirestore, createUserWithRole, getRolePermissions } from './firestore';
import { initializeDefaultPermissions } from './initializePermissions';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
}

export const registerUser = async (
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName });
  return userCredential;
};

export const loginUser = async (
  email: string,
  password: string
): Promise<UserCredential> => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async (): Promise<void> => {
  return firebaseSignOut(auth);
};

export const resetPassword = async (email: string): Promise<void> => {
  return sendPasswordResetEmail(auth, email);
};

export const getCurrentUser = (): FirebaseUser | null => {
  return auth.currentUser;
};

export const formatAuthUser = (user: FirebaseUser): AuthUser => {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL
  };
};

interface AppUser {
  uid: string
  email: string | null
  role: UserRole
  permissions: Permission[]
}

interface AuthContextType {
  user: AppUser | null
  loading: boolean
  signOut: () => Promise<void>
  hasPermission: (resource: string, action: string) => boolean
  userRole: UserRole | null
  checkAndRedirectIfNoPermission: (resource: string, action: string) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
  hasPermission: () => false,
  userRole: null,
  checkAndRedirectIfNoPermission: () => {},
})

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Inicializar permisos por defecto al cargar la aplicación
  useEffect(() => {
    const initPermissions = async () => {
      try {
        await initializeDefaultPermissions();
        console.log('[AuthProvider] Permisos inicializados correctamente');
      } catch (error) {
        console.error('[AuthProvider] Error al inicializar permisos:', error);
      }
    };
    
    initPermissions();
  }, []);

  useEffect(() => {
    console.log(`[AuthProvider] useEffect se ejecuta. Rol actual en dependencia: ${user?.role}`);

    let userListenerUnsubscribe: (() => void) | null = null;
    let roleListenerUnsubscribe: (() => void) | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Limpiar listeners anteriores al cambio de usuario
      if (userListenerUnsubscribe) userListenerUnsubscribe();
      if (roleListenerUnsubscribe) roleListenerUnsubscribe();

      if (firebaseUser) {
        setLoading(true);
        const userDocRef = doc(db, 'usuarios', firebaseUser.uid);

        userListenerUnsubscribe = onSnapshot(userDocRef, (userDoc) => {
          if (!userDoc.exists()) {
            console.error(`[Listener] Documento de usuario no encontrado para UID: ${firebaseUser.uid}`);
            setUser(null);
            setLoading(false);
            return;
          }

          const newRole = userDoc.data().role as UserRole;
          
          // Solo si el rol cambia, o si el listener de rol no está activo, lo (re)creamos.
          // Comparamos con el `user.role` del estado actual de React.
          if (user?.role !== newRole || !roleListenerUnsubscribe) {
            console.log(`[Role Sync] El rol del usuario es '${newRole}'. Sincronizando listener de permisos.`);
            
            // Limpiar listener de rol antiguo
            if (roleListenerUnsubscribe) roleListenerUnsubscribe();

            const roleDocRef = doc(db, 'roles', newRole);
            roleListenerUnsubscribe = onSnapshot(roleDocRef, (roleDoc) => {
              if (roleDoc.exists()) {
                const permissions = roleDoc.data().permissions as Permission[];
                console.log(`[Permissions] Permisos para el rol '${newRole}' actualizados.`);
                setUser({
                  uid: firebaseUser.uid,
                  email: firebaseUser.email,
                  role: newRole,
                  permissions,
                });
              } else {
                console.error(`[Permissions] Documento de rol '${newRole}' no encontrado.`);
                setUser(prev => prev ? { ...prev, permissions: [] } : null);
              }
              setLoading(false);
            });
          }
        });
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      console.log("[AuthProvider] Limpiando listeners al desmontar o cambiar dependencias.");
      authUnsubscribe();
      if (userListenerUnsubscribe) userListenerUnsubscribe();
      if (roleListenerUnsubscribe) roleListenerUnsubscribe();
    };
  }, [user?.role]); // <-- DEPENDENCIA CRÍTICA

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
      router.push("/login")
    } catch (error) {
      console.error("Error al cerrar sesión:", error)
    }
  }

  const hasPermission = (resource: string, action: string): boolean => {
    console.log(`[hasPermission] Verificando: ${resource}:${action}`);
    console.log(`[hasPermission] Usuario:`, user);
    console.log(`[hasPermission] Permisos del usuario:`, user?.permissions);
    
    if (!user?.permissions) {
      console.log(`[hasPermission] No hay permisos cargados, retornando false`);
      return false;
    }
    
    const resourcePermission = user.permissions.find(p => p.resource === resource);
    console.log(`[hasPermission] Permiso encontrado para ${resource}:`, resourcePermission);
    
    const hasAccess = resourcePermission?.actions.includes(action) || false;
    console.log(`[hasPermission] Acceso ${resource}:${action} = ${hasAccess}`);
    
    return hasAccess;
  };

  const checkAndRedirectIfNoPermission = (resource: string, action: string): void => {
    console.log(`[checkAndRedirectIfNoPermission] Verificando redirección para: ${resource}:${action}`);
    
    // Si es un permiso de lectura y el usuario no lo tiene, redirigir al dashboard
    if (action === 'read' && !hasPermission(resource, action)) {
      console.log(`[checkAndRedirectIfNoPermission] Redirigiendo al dashboard - sin permiso de lectura para ${resource}`);
      router.push('/dashboard');
    }
  };

  const value = {
    user,
    loading,
    signOut,
    hasPermission,
    userRole: user?.role || null,
    checkAndRedirectIfNoPermission,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Función para obtener el rol del usuario desde Firestore
const getUserRole = async (uid: string): Promise<UserRole> => {
  try {
    const role = await getUserRoleFromFirestore(uid);
    // Si se encuentra un rol, se devuelve. Si no, se asigna 'secretaria' por defecto.
    return role || 'secretaria';
  } catch (error) {
    console.error('Error al obtener rol del usuario:', error);
    // En caso de error, se asigna el rol más restrictivo para seguridad.
    return 'secretaria'; 
  }
};

export function useAuth() {
  return useContext(AuthContext)
} 