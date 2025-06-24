import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Calcula la edad en años basándose en la fecha de nacimiento
 * @param fechaNacimiento - Fecha de nacimiento en formato string (YYYY-MM-DD)
 * @returns La edad en años como número, o null si no hay fecha de nacimiento
 */
export function calcularEdad(fechaNacimiento?: string): number | null {
  if (!fechaNacimiento) {
    return null;
  }

  try {
    const fechaNac = new Date(fechaNacimiento);
    const fechaActual = new Date();
    
    // Verificar que la fecha de nacimiento sea válida
    if (isNaN(fechaNac.getTime())) {
      return null;
    }
    
    // Verificar que la fecha de nacimiento no sea en el futuro
    if (fechaNac > fechaActual) {
      return null;
    }
    
    let edad = fechaActual.getFullYear() - fechaNac.getFullYear();
    const mesActual = fechaActual.getMonth();
    const mesNac = fechaNac.getMonth();
    const diaActual = fechaActual.getDate();
    const diaNac = fechaNac.getDate();
    
    // Ajustar la edad si aún no ha cumplido años
    if (mesActual < mesNac || (mesActual === mesNac && diaActual < diaNac)) {
      edad--;
    }
    
    return Math.max(0, edad); // Asegurar que la edad no sea negativa
  } catch (error) {
    console.error('Error al calcular la edad:', error);
    return null;
  }
}

/**
 * Formatea la edad para mostrar en la interfaz
 * @param edad - Edad en años
 * @param fechaNacimiento - Fecha de nacimiento opcional para cálculo automático
 * @returns String formateado de la edad
 */
export function formatearEdad(edad?: string | number, fechaNacimiento?: string): string {
  // Si hay fecha de nacimiento, calcular la edad automáticamente
  if (fechaNacimiento) {
    const edadCalculada = calcularEdad(fechaNacimiento);
    if (edadCalculada !== null) {
      return `${edadCalculada} años`;
    }
  }
  
  // Si no hay fecha de nacimiento o no se pudo calcular, usar la edad manual
  if (edad !== undefined && edad !== null && edad !== '') {
    const edadNum = typeof edad === 'string' ? parseInt(edad) : edad;
    if (!isNaN(edadNum) && edadNum >= 0) {
      return `${edadNum} años`;
    }
  }
  
  return 'Edad no especificada';
}

/**
 * Crea una fecha a partir de un string de fecha (YYYY-MM-DD) y hora (HH:mm)
 * Maneja correctamente las zonas horarias para evitar corrimientos de días
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param timeString - Hora en formato HH:mm
 * @returns Date object con la fecha y hora correctas en zona horaria local
 */
export function createDateFromString(dateString: string, timeString: string): Date {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = timeString.split(':').map(Number);
    
    // Validar que los valores sean números válidos
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      throw new Error('Valores de fecha u hora inválidos');
    }
    
    // Crear la fecha directamente en zona horaria local
    // Esto evita problemas de conversión UTC
    const localDate = new Date(year, month - 1, day, hour, minute, 0, 0);
    
    // Validar que la fecha resultante sea válida
    if (isNaN(localDate.getTime())) {
      throw new Error('Fecha resultante inválida');
    }
    
    console.log('createDateFromString - Input:', dateString, timeString);
    console.log('createDateFromString - Output:', localDate.toISOString());
    console.log('createDateFromString - Local:', localDate.toLocaleString('es-ES'));
    
    return localDate;
  } catch (error) {
    console.error('Error al crear fecha desde string:', error);
    // Fallback: fecha actual
    return new Date();
  }
}

/**
 * Formatea una fecha para mostrar en la interfaz de manera consistente
 * @param date - Date object a formatear
 * @param includeTime - Si incluir la hora en el formato
 * @returns String formateado de la fecha
 */
export function formatDateForDisplay(date: Date, includeTime: boolean = true): string {
  try {
    if (isNaN(date.getTime())) {
      return 'Fecha inválida';
    }
    
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    
    if (includeTime) {
      options.hour = '2-digit';
      options.minute = '2-digit';
    }
    
    return date.toLocaleDateString('es-ES', options);
  } catch (error) {
    console.error('Error al formatear fecha:', error);
    return 'Error de formato';
  }
}

/**
 * Convierte un Timestamp de Firestore a una fecha local de manera segura
 * Maneja correctamente las zonas horarias para evitar corrimientos
 * @param firestoreTimestamp - Timestamp de Firestore o Date object
 * @returns Date object en zona horaria local
 */
export function convertFirestoreTimestamp(firestoreTimestamp: any): Date {
  try {
    let date: Date;
    
    if (firestoreTimestamp?.toDate) {
      // Es un Timestamp de Firestore
      date = firestoreTimestamp.toDate();
    } else if (firestoreTimestamp instanceof Date) {
      // Ya es un Date object
      date = firestoreTimestamp;
    } else if (typeof firestoreTimestamp === 'string') {
      // Es un string ISO
      date = new Date(firestoreTimestamp);
    } else if (firestoreTimestamp?.seconds) {
      // Es un Timestamp con seconds
      date = new Date(firestoreTimestamp.seconds * 1000);
    } else {
      // Fallback: fecha actual
      console.warn('Timestamp inválido, usando fecha actual:', firestoreTimestamp);
      date = new Date();
    }
    
    // Validar que la fecha sea válida
    if (isNaN(date.getTime())) {
      console.error('Fecha inválida después de conversión:', firestoreTimestamp);
      return new Date();
    }
    
    // Asegurar que la fecha esté en zona horaria local
    // Firestore Timestamp se guarda en UTC, pero queremos mostrarla en local
    const localDate = new Date(date.getTime());
    
    console.log('Timestamp original:', firestoreTimestamp);
    console.log('Fecha convertida:', localDate.toISOString());
    console.log('Fecha local formateada:', localDate.toLocaleString('es-ES'));
    
    return localDate;
  } catch (error) {
    console.error('Error al convertir timestamp de Firestore:', error);
    return new Date();
  }
}

/**
 * Crea una fecha para guardar en Firestore que mantenga la hora local exacta
 * Esta función crea una fecha que, cuando se recupere de Firestore, mostrará la hora correcta
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param timeString - Hora en formato HH:mm
 * @returns Date object optimizado para Firestore
 */
export function createDateForFirestore(dateString: string, timeString: string): Date {
  try {
    const [year, month, day] = dateString.split('-').map(Number);
    const [hour, minute] = timeString.split(':').map(Number);
    
    // Validar que los valores sean números válidos
    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute)) {
      throw new Error('Valores de fecha u hora inválidos');
    }
    
    // Crear la fecha en UTC para que Firestore la guarde correctamente
    // Esto compensa el hecho de que Firestore convierte automáticamente a UTC
    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0, 0));
    
    // Ajustar por la zona horaria local para compensar la conversión automática de Firestore
    const timezoneOffset = new Date().getTimezoneOffset() * 60000;
    const adjustedDate = new Date(utcDate.getTime() + timezoneOffset);
    
    console.log('createDateForFirestore - Input:', dateString, timeString);
    console.log('createDateForFirestore - UTC creada:', utcDate.toISOString());
    console.log('createDateForFirestore - Ajustada:', adjustedDate.toISOString());
    console.log('createDateForFirestore - Local esperada:', adjustedDate.toLocaleString('es-ES'));
    
    return adjustedDate;
  } catch (error) {
    console.error('Error al crear fecha para Firestore:', error);
    return new Date();
  }
}

/**
 * Función de debug para verificar el manejo de fechas y zonas horarias
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param timeString - Hora en formato HH:mm
 */
export function debugDateHandling(dateString: string, timeString: string) {
  console.log('=== DEBUG FECHA ===');
  console.log('Input:', dateString, timeString);
  
  const [year, month, day] = dateString.split('-').map(Number);
  const [hour, minute] = timeString.split(':').map(Number);
  
  // Método 1: Fecha local directa
  const localDate = new Date(year, month - 1, day, hour, minute);
  console.log('1. Fecha local directa:', localDate.toISOString(), localDate.toLocaleString('es-ES'));
  
  // Método 2: Fecha UTC
  const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
  console.log('2. Fecha UTC:', utcDate.toISOString(), utcDate.toLocaleString('es-ES'));
  
  // Método 3: Fecha ajustada para Firestore
  const timezoneOffset = new Date().getTimezoneOffset() * 60000;
  const adjustedDate = new Date(utcDate.getTime() + timezoneOffset);
  console.log('3. Fecha ajustada:', adjustedDate.toISOString(), adjustedDate.toLocaleString('es-ES'));
  
  // Método 4: Fecha con offset negativo
  const negativeAdjustedDate = new Date(utcDate.getTime() - timezoneOffset);
  console.log('4. Fecha con offset negativo:', negativeAdjustedDate.toISOString(), negativeAdjustedDate.toLocaleString('es-ES'));
  
  console.log('Timezone offset (minutos):', new Date().getTimezoneOffset());
  console.log('Timezone offset (ms):', timezoneOffset);
  console.log('=== FIN DEBUG ===');
}
