export interface Dueno {
  id: string;
  nombre: string;
  apellido: string;
  rut: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface Owner {
  id: string;
  nombre: string;
  apellido: string;
  rut: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface Patient {
  id: string;
  nombre: string;
  imagen?: string;
  codigo?: string;
  especie: string;
  raza?: string;
  edad: string | number;
  peso?: number;
  fechaNacimiento?: string;
  sexo?: 'Macho' | 'Hembra';
  color?: string;
  observaciones?: string;
  owner?: string;
  veterinario?: string;
  ultimaAtencion?: string;
  estado?: 'Activo' | 'En seguimiento' | 'Dado de alta';
  ownerId?: string;
  duenoId: string;
  dueno?: Dueno;
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
  estado: 'Pendiente' | 'Realizada';
  mascota?: Patient;
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

export interface QuickNote {
  id: string;
  text: string;
  color: 'blue' | 'green' | 'yellow' | 'red';
  createdAt: string;
}

// Sistema de Roles
export type UserRole = 'admin' | 'veterinario' | 'secretaria';

export interface User {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  active: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface Permission {
  resource: string;
  actions: string[];
}

export interface RolePermissions {
  admin: Permission[];
  veterinario: Permission[];
  secretaria: Permission[];
}

// Definición de permisos por rol
export const ROLE_PERMISSIONS: RolePermissions = {
  admin: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'usuarios', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'pacientes', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'duenos', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'consultas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'citas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'inventario', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'configuracion', actions: ['read', 'update'] },
  ],
  veterinario: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'usuarios', actions: ['read'] },
    { resource: 'pacientes', actions: ['read', 'update'] },
    { resource: 'duenos', actions: ['read'] },
    { resource: 'consultas', actions: ['create', 'read', 'update'] },
    { resource: 'citas', actions: ['read'] },
    { resource: 'inventario', actions: ['read'] },
    { resource: 'configuracion', actions: ['read'] },
  ],
  secretaria: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'usuarios', actions: ['read'] },
    { resource: 'pacientes', actions: ['read'] },
    { resource: 'duenos', actions: ['create', 'read', 'update'] },
    { resource: 'consultas', actions: ['read'] },
    { resource: 'citas', actions: ['create', 'read', 'update', 'delete'] },
    { resource: 'inventario', actions: ['read'] },
    { resource: 'configuracion', actions: ['read'] },
  ],
};

// Tipos para datos médicos vs personales
export interface MedicalData {
  diagnostico: string;
  tratamiento: string;
  sintomas: string;
  proximaCita?: Date;
  observaciones?: string;
}

export interface PersonalData {
  nombre: string;
  apellido: string;
  rut: string;
  telefono: string;
  email: string;
  direccion: string;
} 