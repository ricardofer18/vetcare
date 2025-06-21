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
  collectionGroup
} from 'firebase/firestore';
import { db } from './firebase';

// Tipos de datos
export interface Patient {
  id: string;
  nombre: string;
  imagen: string;
  codigo: string;
  especie: string;
  edad: string;
  owner: string;
  veterinario: string;
  ultimaAtencion: string;
  estado: 'Activo' | 'En seguimiento' | 'Dado de alta';
  raza?: string;
  sexo?: string;
  ownerId?: string;
  ownerDetails?: Owner;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  ownerId: string;
  ownerName: string;
  date: string;
  time: string;
  type: 'Consulta' | 'Cirugía' | 'Vacunación' | 'Control' | 'Otro';
  status: 'Programada' | 'Confirmada' | 'Completada' | 'Cancelada';
  notes?: string;
  veterinarian: string;
  cost?: number;
  paymentStatus?: 'Pendiente' | 'Pagado' | 'Parcial';
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  category: string;
  supplier: string;
  lastRestock: string;
  minQuantity: number;
  image?: string;
}

// Interfaces
export interface Owner {
  id: string;
  nombre: string;
  apellido: string;
  rut: string;
  email: string;
  telefono: string;
  direccion: string;
}

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
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
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
  const docRef = await addDoc(appointmentsCollection, appointment);
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
  try {
    const allOwners = await getOwners();
    if (allOwners.length === 0) {
      console.log('[initializeSamplePatients] No owners found. Skipping patient initialization.');
      return;
    }
    console.log(`[initializeSamplePatients] Found ${allOwners.length} owners. Checking if patients exist.`);

    const allPatients = await getPatients();
    if (allPatients.length > 0) {
      console.log('[initializeSamplePatients] Patients already exist, skipping initialization.');
      return;
    }
    
    console.log('[initializeSamplePatients] No patients found. Creating sample patients...');

    const samplePatients = [
      {
        nombre: 'Max',
        imagen: '',
        codigo: 'PET001',
        especie: 'Perro',
        raza: 'Golden Retriever',
        edad: '3 años',
        ownerId: allOwners[0].id, // Asignar al primer dueño
        owner: `${allOwners[0].nombre} ${allOwners[0].apellido}`,
        veterinario: 'Dra. Ana',
        ultimaAtencion: '2024-05-10',
        estado: 'Activo' as const,
      },
      {
        nombre: 'Luna',
        imagen: '',
        codigo: 'PET002',
        especie: 'Gato',
        raza: 'Siamés',
        edad: '1 año',
        ownerId: allOwners[0].id, // Asignar al primer dueño
        owner: `${allOwners[0].nombre} ${allOwners[0].apellido}`,
        veterinario: 'Dr. Carlos',
        ultimaAtencion: '2024-05-20',
        estado: 'En seguimiento' as const,
      },
    ];

    if (allOwners.length > 1) {
      samplePatients.push({
        nombre: 'Rocky',
        imagen: '',
        codigo: 'PET003',
        especie: 'Perro',
        raza: 'Bulldog',
        edad: '5 años',
        ownerId: allOwners[1].id, // Asignar al segundo dueño
        owner: `${allOwners[1].nombre} ${allOwners[1].apellido}`,
        veterinario: 'Dra. Ana',
        ultimaAtencion: '2024-04-12',
        estado: 'Activo' as const,
      });
    }

    for (const patient of samplePatients) {
      if (patient.ownerId) {
        await addPatient(patient.ownerId, patient);
      }
    }

    console.log('[initializeSamplePatients] Sample patients initialized successfully.');
  } catch (error) {
    console.error('[initializeSamplePatients] Error initializing sample patients:', error);
  }
};

// Función para buscar pacientes por nombre o nombre del dueño
export const searchPatients = async (searchTerm: string): Promise<Patient[]> => {
  try {
    const patientsRef = collection(db, 'patients');
    const q = query(
      patientsRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const patients: Patient[] = [];
    
    for (const docSnapshot of querySnapshot.docs) {
      const patientData = docSnapshot.data() as DocumentData;
      const ownerRef = doc(db, 'duenos', patientData.ownerId);
      const ownerDoc = await getDoc(ownerRef);
      const ownerData = ownerDoc.data() as DocumentData;
      
      if (ownerData) {
        patients.push({
          id: docSnapshot.id,
          nombre: patientData.name,
          imagen: patientData.image || '',
          codigo: patientData.code || '',
          especie: patientData.species,
          edad: patientData.age,
          owner: patientData.owner,
          veterinario: patientData.veterinarian || '',
          ultimaAtencion: patientData.lastAttention || '',
          estado: patientData.status || 'Activo',
          raza: patientData.breed,
          sexo: patientData.gender,
          ownerId: patientData.ownerId,
          ownerDetails: {
            id: ownerDoc.id,
            nombre: ownerData.nombre as string,
            apellido: ownerData.apellido as string,
            rut: ownerData.rut as string,
            email: ownerData.email as string,
            telefono: ownerData.telefono as string,
            direccion: ownerData.direccion as string,
          }
        });
      }
    }
    
    return patients;
  } catch (error) {
    console.error('Error searching patients:', error);
    throw error;
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