export interface Dueno {
  id: string;
  nombre: string;
  rut: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface Mascota {
  id: string;
  nombre: string;
  especie: string;
  raza: string;
  edad: number;
  peso?: number;
  fechaNacimiento?: string;
  sexo?: 'Macho' | 'Hembra';
  color?: string;
  observaciones?: string;
  duenoId: string;
  dueno?: Dueno;
}

export interface MascotaInput {
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
  mascotaId: string;
  veterinarioId: string;
  fecha: Date;
  motivo: string;
  sintomas: string;
  diagnostico: string;
  tratamiento: string;
  proximaCita?: Date;
  mascota?: Mascota;
  veterinario?: {
    id: string;
    nombre: string;
  };
}

export interface ConsultaFormData {
  motivo: string
  sintomas: string
  diagnostico: string
  tratamiento: string
  proximaCita?: string
} 