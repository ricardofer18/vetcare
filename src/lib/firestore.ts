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
  limit
} from 'firebase/firestore';
import { db } from './firebase';

// Tipos de datos
export interface Patient {
  id: string;
  name: string;
  image: string;
  code: string;
  species: string;
  age: string;
  owner: string;
  veterinarian: string;
  lastAttention: string;
  status: 'Activo' | 'En seguimiento' | 'Dado de alta';
  breed?: string;
  gender?: string;
  ownerId?: string;
  ownerDetails?: Owner;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  veterinarian: string;
  duration: string;
  notes: string;
  status: 'Programada' | 'Completada' | 'Cancelada';
}

export interface InventoryItem {
  id: string;
  name: string;
  code: string;
  category: string;
  presentation: string;
  stock: number;
  minStock: number;
  expiryDate: string;
  provider: string;
  status: 'Normal' | 'Bajo' | 'Crítico' | 'Por Vencer' | 'Vencido';
}

export interface Client {
  id: string;
  name: string;
  image: string;
  code: string;
  rutDni: string;
  contact: string;
  pets: number;
  lastAttention: string;
  status: 'Activo' | 'Inactivo';
}

// Interfaces
export interface Owner {
  id: string;
  name: string;
  phone: string;
  email: string;
}

// Funciones para Pacientes
export const patientsCollection = collection(db, 'patients');

export const getPatients = async (): Promise<Patient[]> => {
  const querySnapshot = await getDocs(patientsCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Patient));
};

export const getPatient = async (id: string): Promise<Patient | null> => {
  const docRef = doc(patientsCollection, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Patient;
  }
  return null;
};

export const addPatient = async (patient: Omit<Patient, 'id'>): Promise<string> => {
  const docRef = await addDoc(patientsCollection, patient);
  return docRef.id;
};

export const updatePatient = async (id: string, patient: Partial<Patient>): Promise<void> => {
  const docRef = doc(patientsCollection, id);
  await updateDoc(docRef, patient);
};

export const deletePatient = async (id: string): Promise<void> => {
  const docRef = doc(patientsCollection, id);
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

export const getAppointmentsByDate = async (date: string): Promise<Appointment[]> => {
  const q = query(appointmentsCollection, where('date', '==', date));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Appointment));
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

// Funciones para Inventario
export const inventoryCollection = collection(db, 'inventory');

export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  const querySnapshot = await getDocs(inventoryCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as InventoryItem));
};

export const getInventoryItem = async (id: string): Promise<InventoryItem | null> => {
  const docRef = doc(inventoryCollection, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as InventoryItem;
  }
  return null;
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<string> => {
  const docRef = await addDoc(inventoryCollection, item);
  return docRef.id;
};

export const updateInventoryItem = async (id: string, item: Partial<InventoryItem>): Promise<void> => {
  const docRef = doc(inventoryCollection, id);
  await updateDoc(docRef, item);
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const docRef = doc(inventoryCollection, id);
  await deleteDoc(docRef);
};

// Funciones para Clientes
export const clientsCollection = collection(db, 'clients');

export const getClients = async (): Promise<Client[]> => {
  const querySnapshot = await getDocs(clientsCollection);
  return querySnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Client));
};

export const getClient = async (id: string): Promise<Client | null> => {
  const docRef = doc(clientsCollection, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Client;
  }
  return null;
};

export const addClient = async (client: Omit<Client, 'id'>): Promise<string> => {
  const docRef = await addDoc(clientsCollection, client);
  return docRef.id;
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<void> => {
  const docRef = doc(clientsCollection, id);
  await updateDoc(docRef, client);
};

export const deleteClient = async (id: string): Promise<void> => {
  const docRef = doc(clientsCollection, id);
  await deleteDoc(docRef);
};

// Funciones para Dueños
export const ownersCollection = collection(db, 'owners');

export const addOwner = async (owner: Omit<Owner, 'id'>): Promise<string> => {
  const docRef = await addDoc(ownersCollection, owner);
  return docRef.id;
};

export const getOwner = async (id: string): Promise<Owner | null> => {
  const docRef = doc(ownersCollection, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Owner;
  }
  return null;
};

export const updateOwner = async (id: string, owner: Partial<Owner>): Promise<void> => {
  const docRef = doc(ownersCollection, id);
  await updateDoc(docRef, owner);
};

export const deleteOwner = async (id: string): Promise<void> => {
  const docRef = doc(ownersCollection, id);
  await deleteDoc(docRef);
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
      const ownerRef = doc(db, 'owners', patientData.ownerId);
      const ownerDoc = await getDoc(ownerRef);
      const ownerData = ownerDoc.data() as DocumentData;
      
      if (ownerData) {
        patients.push({
          id: docSnapshot.id,
          name: patientData.name,
          image: patientData.image || '',
          code: patientData.code || '',
          species: patientData.species,
          age: patientData.age,
          owner: patientData.owner,
          veterinarian: patientData.veterinarian || '',
          lastAttention: patientData.lastAttention || '',
          status: patientData.status || 'Activo',
          breed: patientData.breed,
          gender: patientData.gender,
          ownerId: patientData.ownerId,
          ownerDetails: {
            id: ownerDoc.id,
            name: ownerData.name as string,
            phone: ownerData.phone as string,
            email: ownerData.email as string
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
    const ownersRef = collection(db, 'owners');
    const q = query(
      ownersRef,
      where('name', '>=', searchTerm),
      where('name', '<=', searchTerm + '\uf8ff'),
      limit(10)
    );
    const querySnapshot = await getDocs(q);
    const owners: Owner[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data() as DocumentData;
      owners.push({
        id: doc.id,
        name: data.name as string,
        phone: data.phone as string,
        email: data.email as string
      });
    });
    
    return owners;
  } catch (error) {
    console.error('Error searching owners:', error);
    throw error;
  }
}; 