import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ROLE_PERMISSIONS, UserRole } from '../types';

export const initializeDefaultPermissions = async (): Promise<void> => {
  console.log('Inicializando permisos por defecto...');
  
  try {
    // Verificar y crear permisos para cada rol
    for (const role of ['admin', 'veterinario', 'secretaria'] as UserRole[]) {
      const roleRef = doc(db, 'roles', role);
      const roleDoc = await getDoc(roleRef);
      
      if (!roleDoc.exists()) {
        console.log(`Creando permisos para el rol: ${role}`);
        await setDoc(roleRef, {
          permissions: ROLE_PERMISSIONS[role]
        });
      } else {
        console.log(`Permisos para el rol ${role} ya existen`);
      }
    }
    
    console.log('Permisos inicializados correctamente');
  } catch (error) {
    console.error('Error al inicializar permisos:', error);
    throw error;
  }
};

// Función para verificar si los permisos están configurados correctamente
export const verifyPermissions = async (): Promise<boolean> => {
  try {
    for (const role of ['admin', 'veterinario', 'secretaria'] as UserRole[]) {
      const roleRef = doc(db, 'roles', role);
      const roleDoc = await getDoc(roleRef);
      
      if (!roleDoc.exists()) {
        console.log(`Rol ${role} no existe en Firestore`);
        return false;
      }
      
      const permissions = roleDoc.data().permissions;
      if (!permissions || !Array.isArray(permissions)) {
        console.log(`Permisos para el rol ${role} no están configurados correctamente`);
        return false;
      }
      
      console.log(`Rol ${role} tiene ${permissions.length} permisos configurados`);
    }
    
    return true;
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return false;
  }
}; 