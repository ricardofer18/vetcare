import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  DocumentData,
  limit,
  collectionGroup,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import { Patient, Dueno as Owner, Appointment, InventoryItem, UserRole, User, Permission, RolePermissions, ROLE_PERMISSIONS } from '../types';
import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import { getAuth } from 'firebase/auth';
import { initializeApp } from 'firebase/app';

// Funciones para Pacientes

// Para obtener TODOS los pacientes de todos los dueños, usamos una consulta de grupo de colección.
// Esto requiere un índice en Firestore. Si falla, Firestore proporcionará un enlace para crearlo.
export const getPatients = async (): Promise<Patient[]> => {
  const patientsGroupRef = collectionGroup(db, 'mascotas');
  const querySnapshot = await getDocs(patientsGroupRef);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Patient));
};

export const getPatient = async (ownerId: string, patientId: string): Promise<Patient | null> => {
  const docRef = doc(db, 'duenos', ownerId, 'mascotas', patientId);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Patient;
  }
  return null;
};

export const addPatient = async (ownerId: string, patient: Omit<Patient, 'id'>): Promise<string> => {
  const petsSubcollectionRef = collection(db, 'duenos', ownerId, 'mascotas');
  const docRef = await addDoc(petsSubcollectionRef, patient);
  return docRef.id;
};

export const updatePatient = async (ownerId: string, patientId: string, patient: Partial<Patient>): Promise<void> => {
  const docRef = doc(db, 'duenos', ownerId, 'mascotas', patientId);
  await updateDoc(docRef, patient);
};

export const deletePatient = async (ownerId: string, patientId: string): Promise<void> => {
  const docRef = doc(db, 'duenos', ownerId, 'mascotas', patientId);
  await deleteDoc(docRef);
};

// Funciones para Citas
export const appointmentsCollection = collection(db, 'appointments');

export const getAppointments = async (): Promise<Appointment[]> => {
  const querySnapshot = await getDocs(appointmentsCollection);
  const appointments = querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
  console.log('Citas recuperadas de Firestore:', appointments);
  return appointments;
};

export const getAppointment = async (id: string): Promise<Appointment | null> => {
  const docRef = doc(appointmentsCollection, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Appointment;
  }
  return null;
};

export const addAppointment = async (appointment: Omit<Appointment, 'id'>): Promise<string> => {
  console.log('Guardando cita en Firestore:', appointment);
  const docRef = await addDoc(appointmentsCollection, appointment);
  console.log('Cita guardada con ID:', docRef.id);
  return docRef.id;
};

export const updateAppointment = async (id: string, appointment: Partial<Appointment>): Promise<void> => {
  const docRef = doc(appointmentsCollection, id);
  await updateDoc(docRef, appointment);
};

export const deleteAppointment = async (id: string): Promise<void> => {
  const docRef = doc(appointmentsCollection, id);
  await deleteDoc(docRef);
};

export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  const q = query(
    appointmentsCollection,
    where('date', '==', date)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
};

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  const q = query(
    appointmentsCollection,
    where('patientId', '==', patientId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
};

export const getAppointmentsByOwner = async (ownerId: string): Promise<Appointment[]> => {
  const q = query(
    appointmentsCollection,
    where('ownerId', '==', ownerId)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
};

// Funciones para Inventario
export const inventoryCollection = collection(db, 'inventory');

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const querySnapshot = await getDocs(inventoryCollection);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InventoryItem));
  } catch (error) {
    console.error("Error getting inventory items: ", error);
    throw error;
  }
};

export const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
  try {
    const docRef = doc(inventoryCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
    }
    return null;
  } catch (error) {
    console.error("Error getting inventory item: ", error);
    throw error;
  }
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(inventoryCollection, item);
    return docRef.id;
  } catch (error) {
    console.error("Error adding inventory item: ", error);
    throw error;
  }
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>): Promise<void> => {
  try {
    const docRef = doc(inventoryCollection, id);
    await updateDoc(docRef, item);
  } catch (error) {
    console.error("Error updating inventory item: ", error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const docRef = doc(inventoryCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting inventory item: ", error);
    throw error;
  }
};

export const getLowStockItems = async (): Promise<InventoryItem[]> => {
  try {
    const q = query(
      inventoryCollection,
      where('quantity', '<=', 'minQuantity')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as InventoryItem));
  } catch (error) {
    console.error("Error getting low stock items: ", error);
    throw error;
  }
};

// Funciones para Dueños
export const ownersCollection = collection(db, 'duenos');

export const getOwners = async (): Promise<Owner[]> => {
  try {
    const querySnapshot = await getDocs(ownersCollection);
    const owners = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre || '',
        apellido: data.apellido || '',
        rut: data.rut || '',
        email: data.email || '',
        telefono: data.telefono || '',
        direccion: data.direccion || '',
      } as Owner
    });
    console.log('Owners fetched:', owners);
    return owners;
  } catch (error) {
    console.error('Error getting owners:', error);
    throw error;
  }
};

export const addOwner = async (owner: Omit<Owner, 'id'>): Promise<string> => {
  try {
    const docRef = await addDoc(ownersCollection, owner);
    return docRef.id;
  } catch (error) {
    console.error('Error adding owner:', error);
    throw error;
  }
};

export const getOwner = async (id: string): Promise<Owner | null> => {
  try {
    const docRef = doc(ownersCollection, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return { 
        id: docSnap.id,
        nombre: data.nombre,
        apellido: data.apellido,
        rut: data.rut,
        email: data.email,
        telefono: data.telefono,
        direccion: data.direccion,
      } as Owner;
    }
    return null;
  } catch (error) {
    console.error('Error getting owner:', error);
    throw error;
  }
};

export const updateOwner = async (id: string, owner: Partial<Owner>): Promise<void> => {
  try {
    const docRef = doc(ownersCollection, id);
    await updateDoc(docRef, owner);
  } catch (error) {
    console.error('Error updating owner:', error);
    throw error;
  }
};

export const deleteOwner = async (id: string): Promise<void> => {
  try {
    const docRef = doc(ownersCollection, id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting owner:', error);
    throw error;
  }
};

// Función para obtener las mascotas de un dueño específico
export const getPatientsByOwnerId = async (ownerId: string): Promise<Patient[]> => {
  try {
    const petsSubcollectionRef = collection(db, 'duenos', ownerId, 'mascotas');
    const querySnapshot = await getDocs(petsSubcollectionRef);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Patient));
  } catch (error) {
    console.error(`Error getting patients for owner ${ownerId}:`, error);
    throw error;
  }
};

// Función para inicializar datos de pacientes de ejemplo
export const initializeSamplePatients = async (): Promise<void> => {
  const ownersRef = collection(db, 'duenos');
  const ownersSnapshot = await getDocs(ownersRef);

  if (ownersSnapshot.empty) {
    console.log("No hay dueños, creando uno de ejemplo...");
    const newOwnerData = {
      nombre: 'Ricardo',
      apellido: 'Saavedra',
      rut: '21.758.535-k',
      email: 'ricardo@example.com',
      telefono: '+56987654321',
      direccion: 'Calle Falsa 123, Santiago'
    };
    const ownerDocRef = await addDoc(ownersRef, newOwnerData);
    
    const samplePatients = [
      { 
        nombre: 'elvistek', 
        especie: 'Perro', 
        raza: 'Pug', 
        edad: 12, 
        sexo: 'Macho',
        duenoId: ownerDocRef.id // <- Campo requerido añadido
      },
      // ... más pacientes de ejemplo si es necesario
    ];

    for (const patientData of samplePatients) {
      const petsSubcollectionRef = collection(db, 'duenos', ownerDocRef.id, 'mascotas');
      await addDoc(petsSubcollectionRef, patientData);
    }
    console.log("Dueño y mascotas de ejemplo creados.");
  }
};

// Función para buscar pacientes
export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  try {
    const patients: Patient[] = [];
    
    // Buscar en todos los dueños
    const duenosSnapshot = await getDocs(collection(db, 'duenos'));
    
    for (const duenoDoc of duenosSnapshot.docs) {
      const duenoData = duenoDoc.data() as Owner;
      
      // Buscar mascotas del dueño
      const mascotasRef = collection(db, `duenos/${duenoDoc.id}/mascotas`);
      const mascotasSnapshot = await getDocs(mascotasRef);
      
      mascotasSnapshot.forEach(mascotaDoc => {
        const mascotaData = mascotaDoc.data();
        const patient: Patient = {
          id: mascotaDoc.id,
          nombre: mascotaData.nombre,
          imagen: mascotaData.imagen || '',
          codigo: mascotaData.codigo || '',
          especie: mascotaData.especie,
          edad: mascotaData.edad,
          owner: duenoData.nombre,
          veterinario: mascotaData.veterinario || '',
          ultimaAtencion: mascotaData.ultimaAtencion || '',
          estado: mascotaData.estado || 'Activo',
          raza: mascotaData.raza,
          sexo: mascotaData.sexo,
          ownerId: duenoDoc.id,
          duenoId: duenoDoc.id,
          dueno: {
            id: duenoDoc.id,
            nombre: duenoData.nombre,
            apellido: duenoData.apellido,
            rut: duenoData.rut,
            email: duenoData.email,
            telefono: duenoData.telefono,
            direccion: duenoData.direccion
          }
        };
        
        // Filtrar por término de búsqueda
        const searchLower = searchTerm.toLowerCase();
        if (
          patient.nombre.toLowerCase().includes(searchLower) ||
          patient.especie.toLowerCase().includes(searchLower) ||
          patient.dueno?.nombre.toLowerCase().includes(searchLower) ||
          patient.dueno?.apellido.toLowerCase().includes(searchLower)
        ) {
          patients.push(patient);
        }
      });
    }
    
    return patients.slice(0, 10); // Limitar a 10 resultados
  } catch (error) {
    console.error('Error buscando pacientes:', error);
    return [];
  }
};

// Función para buscar dueños por nombre
export const searchOwners = async (searchTerm: string): Promise<Owner[]> => {
  try {
    const ownersRef = collection(db, 'duenos');
    const q = query(
      ownersRef,
      where('nombre', '>=', searchTerm),
      where('nombre', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const owners: Owner[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      owners.push({
        id: doc.id,
        nombre: data.nombre as string,
        apellido: data.apellido as string,
        rut: data.rut as string,
        email: data.email as string,
        telefono: data.telefono as string,
        direccion: data.direccion as string,
      });
    });
    
    return owners;
  } catch (error) {
    console.error('Error searching owners:', error);
    throw error;
  }
};

// Notas rápidas para el dashboard
export const quickNotesCollection = collection(db, 'quickNotes');

export const getQuickNotes = async (): Promise<import('../types').QuickNote[]> => {
  const querySnapshot = await getDocs(quickNotesCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as import('../types').QuickNote));
};

export const addQuickNote = async (note: Omit<import('../types').QuickNote, 'id' | 'createdAt'> & { createdAt?: string }): Promise<string> => {
  const noteData = {
    ...note,
    createdAt: note.createdAt || new Date().toISOString(),
  };
  const docRef = await addDoc(quickNotesCollection, noteData);
  return docRef.id;
};

export const deleteQuickNote = async (id: string): Promise<void> => {
  const docRef = doc(quickNotesCollection, id);
  await deleteDoc(docRef);
};

// Funciones para manejo de roles de usuario
export const createUserWithRole = async (
  uid: string,
  email: string,
  displayName: string,
  role: UserRole
): Promise<void> => {
  try {
    const userRef = doc(db, 'usuarios', uid);
    await setDoc(userRef, {
      uid,
      email,
      displayName,
      role,
      active: true,
      createdAt: new Date(),
      lastLogin: new Date()
    });
  } catch (error) {
    console.error('Error al crear usuario con rol:', error);
    throw error;
  }
};

export const getUserRole = async (uid: string): Promise<UserRole | null> => {
  try {
    const userRef = doc(db, 'usuarios', uid);
    const userDoc = await getDoc(userRef);
    
    console.log(`[firestore.ts] Buscando rol para UID: ${uid}. Documento encontrado: ${userDoc.exists()}`);

    if (userDoc.exists()) {
      const role = userDoc.data().role as UserRole;
      console.log(`[firestore.ts] Rol encontrado: ${role}`);
      return role;
    }
    
    console.log(`[firestore.ts] No se encontró un documento para el UID: ${uid}`);
    return null;
  } catch (error) {
    console.error('[firestore.ts] Error al obtener rol del usuario:', error);
    return null;
  }
};

export const updateUserRole = async (
  uid: string,
  newRole: UserRole
): Promise<void> => {
  try {
    const userRef = doc(db, 'usuarios', uid);
    await updateDoc(userRef, {
      role: newRole,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error al actualizar rol del usuario:', error);
    throw error;
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const usersRef = collection(db, 'usuarios');
    const usersSnapshot = await getDocs(usersRef);
    
    return usersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    throw error;
  }
};

export const deactivateUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'usuarios', uid);
    await updateDoc(userRef, {
      active: false,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error al desactivar usuario:', error);
    throw error;
  }
};

export const activateUser = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, 'usuarios', uid);
    await updateDoc(userRef, {
      active: true,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Error al activar usuario:', error);
    throw error;
  }
};

// --- Role Management ---

export const getRolePermissions = async (role: UserRole): Promise<Permission[]> => {
  const roleRef = doc(db, 'roles', role);
  const roleSnap = await getDoc(roleRef);

  if (roleSnap.exists()) {
    const permissionsData = roleSnap.data().permissions;
    if (Array.isArray(permissionsData)) {
      return permissionsData as Permission[];
    }
  }
  
  console.warn(`Rol "${role}" no encontrado en Firestore. Usando permisos por defecto.`);
  await setRolePermissions(role, ROLE_PERMISSIONS[role]);
  return ROLE_PERMISSIONS[role];
};

export const setRolePermissions = async (role: UserRole, permissions: Permission[]): Promise<void> => {
  const roleRef = doc(db, 'roles', role);
  await setDoc(roleRef, { permissions });
};

export const getAllRolePermissions = async (): Promise<RolePermissions> => {
    const rolesRef = collection(db, 'roles');
    const rolesSnap = await getDocs(rolesRef);
    let rolesInDb: string[] = [];

    rolesSnap.forEach(doc => {
      rolesInDb.push(doc.id);
    });

    const allRolesExist = ['admin', 'veterinario', 'secretaria'].every(r => rolesInDb.includes(r));

    if (rolesSnap.empty || !allRolesExist) {
        console.log("Algunos roles no se encontraron en Firestore. Inicializando con permisos por defecto.");
        
        await Promise.all([
            setRolePermissions('admin', ROLE_PERMISSIONS.admin),
            setRolePermissions('veterinario', ROLE_PERMISSIONS.veterinario),
            setRolePermissions('secretaria', ROLE_PERMISSIONS.secretaria),
        ]);
        return ROLE_PERMISSIONS;
    }

    const allPermissions: RolePermissions = {
        admin: [],
        veterinario: [],
        secretaria: [],
    };

    rolesSnap.forEach(doc => {
        allPermissions[doc.id as UserRole] = doc.data().permissions;
    });

    return allPermissions;
}

// Nueva función para crear usuario usando Firebase Auth directamente
export const createUserDirectly = async (
  email: string,
  displayName: string,
  role: UserRole,
  password: string
): Promise<string> => {
  try {
    // Crear una instancia completamente separada de Firebase Auth
    const { initializeApp } = await import('firebase/app');
    const { getAuth, createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
    
    // Crear una nueva instancia de Firebase para crear usuarios
    const tempApp = initializeApp({
      apiKey: "AIzaSyAB7YtjFBU3b2iWWjML2HQCyg98fwZ_9Mo",
      authDomain: "vetcare-8bf32.firebaseapp.com",
      projectId: "vetcare-8bf32",
      storageBucket: "vetcare-8bf32.appspot.com",
      messagingSenderId: "688144507799",
      appId: "1:688144507799:web:c1d31faa82f1c9444fdad2",
      measurementId: "G-KTLLYKKV1L"
    }, 'temp-auth');
    
    const tempAuth = getAuth(tempApp);
    
    // Crear el usuario con Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(tempAuth, email, password);
    const user = userCredential.user;
    
    // Actualizar el displayName del usuario
    await updateProfile(user, {
      displayName: displayName
    });
    
    // Guardar información adicional en Firestore
    const userRef = doc(db, 'usuarios', user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: displayName,
      role: role,
      active: true,
      createdAt: new Date(),
      lastLogin: new Date(),
      passwordSet: true
    });

    // Cerrar sesión del usuario temporal
    const { signOut } = await import('firebase/auth');
    await signOut(tempAuth);
    
    console.log('Usuario creado exitosamente en Firebase Auth y Firestore:', user.uid);
    return user.uid;
  } catch (error: any) {
    console.error('Error al crear usuario directamente:', error);
    
    // Manejar errores específicos de Firebase Auth
    if (error.code) {
      switch (error.code) {
        case 'auth/email-already-in-use':
          throw new Error('Este correo electrónico ya está registrado');
        case 'auth/invalid-email':
          throw new Error('El correo electrónico no es válido');
        case 'auth/weak-password':
          throw new Error('La contraseña es demasiado débil. Debe tener al menos 6 caracteres');
        case 'auth/operation-not-allowed':
          throw new Error('La creación de usuarios con email y contraseña no está habilitada');
        default:
          throw new Error(`Error de Firebase Auth: ${error.message}`);
      }
    }
    
    throw error;
  }
}; 