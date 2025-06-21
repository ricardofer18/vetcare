import { db } from './firebase';
import { collection, addDoc, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';

export interface Dueno {
  id?: string;
  rut: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
}

export interface Mascota {
  id: string;
  duenoId: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  peso?: number;
  fechaNacimiento?: string;
  sexo?: 'Macho' | 'Hembra';
  color?: string;
  observaciones?: string;
}

export interface Consulta {
  id: string;
  duenoId: string;
  mascotaId: string;
  veterinarioId: string;
  fecha: string;
  motivo: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  proximaCita?: string;
  observaciones?: string;
  dueno?: Dueno | null;
  mascota?: Mascota | null;
}

// Buscar dueño por RUT
export async function buscarDuenoPorRut(rut: string): Promise<Dueno | null> {
  try {
    console.log('Buscando dueño con RUT:', rut);
    const duenosRef = collection(db, 'duenos');
    const q = query(duenosRef, where('rut', '==', rut));
    const querySnapshot = await getDocs(q);
    
    console.log('Query snapshot:', querySnapshot);
    console.log('Número de documentos encontrados:', querySnapshot.size);
    
    if (querySnapshot.empty) {
      console.log('No se encontró ningún dueño con ese RUT');
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    console.log('Datos del dueño encontrado:', { id: doc.id, ...data });
    
    return {
      id: doc.id,
      ...data
    } as Dueno;
  } catch (error) {
    console.error('Error al buscar dueño por RUT:', error);
    throw error;
  }
}

// Crear nuevo dueño
export async function crearDueno(dueno: Omit<Dueno, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'duenos'), dueno);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear dueño:', error);
    throw error;
  }
}

// Crear nueva mascota
export async function crearMascota(mascota: Omit<Mascota, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'mascotas'), mascota);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear mascota:', error);
    throw error;
  }
}

// Crear nueva consulta
export async function crearConsulta(consulta: Omit<Consulta, 'id'>): Promise<string> {
  try {
    // Validar datos requeridos
    if (!consulta.duenoId) {
      throw new Error('El ID del dueño es requerido');
    }
    if (!consulta.mascotaId) {
      throw new Error('El ID de la mascota es requerido');
    }
    if (!consulta.veterinarioId) {
      throw new Error('El ID del veterinario es requerido');
    }
    if (!consulta.motivo) {
      throw new Error('El motivo de la consulta es requerido');
    }
    if (!consulta.sintomas) {
      throw new Error('Los síntomas son requeridos');
    }
    if (!consulta.diagnostico) {
      throw new Error('El diagnóstico es requerido');
    }
    if (!consulta.tratamiento) {
      throw new Error('El tratamiento es requerido');
    }

    const docRef = await addDoc(collection(db, 'consultas'), consulta);
    return docRef.id;
  } catch (error) {
    console.error('Error al crear consulta:', error);
    throw error;
  }
}

export async function obtenerConsultas(): Promise<Consulta[]> {
  try {
    console.log('Obteniendo consultas...');
    const consultasRef = collection(db, 'consultas');
    const q = query(consultasRef, orderBy('fecha', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('Query snapshot:', querySnapshot);
    console.log('Número de consultas encontradas:', querySnapshot.size);
    
    const consultas = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data();
        console.log('Datos de consulta:', { id: docSnapshot.id, ...data });
        
        // Obtener datos del dueño
        const duenoRef = doc(db, 'duenos', data.duenoId);
        const duenoDoc = await getDoc(duenoRef);
        const duenoData = duenoDoc.data();
        console.log('Datos del dueño:', duenoData);
        
        // Obtener datos de la mascota
        const mascotaRef = doc(db, 'mascotas', data.mascotaId);
        const mascotaDoc = await getDoc(mascotaRef);
        const mascotaData = mascotaDoc.data();
        console.log('Datos de la mascota:', mascotaData);
        
        return {
          id: docSnapshot.id,
          duenoId: data.duenoId,
          mascotaId: data.mascotaId,
          veterinarioId: data.veterinarioId,
          fecha: data.fecha,
          motivo: data.motivo,
          sintomas: data.sintomas,
          diagnostico: data.diagnostico,
          tratamiento: data.tratamiento,
          proximaCita: data.proximaCita,
          observaciones: data.observaciones,
          dueno: duenoData ? { id: duenoDoc.id, ...duenoData } as Dueno : null,
          mascota: mascotaData ? { id: mascotaDoc.id, ...mascotaData } as Mascota : null,
        } as Consulta;
      })
    );
    
    console.log('Consultas procesadas:', consultas);
    return consultas;
  } catch (error) {
    console.error('Error al obtener consultas:', error);
    throw error;
  }
} 