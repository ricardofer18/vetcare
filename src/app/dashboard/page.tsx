'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/Header';
import { LoadingSpinner, GlobalLoading } from '@/components/ui/loading-spinner';
import { 
  Calendar, 
  Users, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Plus, 
  TrendingUp, 
  Activity,
  Stethoscope,
  Package,
  UserCheck,
  FileText,
  Check
} from 'lucide-react';
import { 
  getAppointments, 
  getOwners, 
  getInventoryItems, 
  getPatients,
  getQuickNotes,
  addQuickNote,
  deleteQuickNote
} from '@/lib/firestore';
import { Appointment, InventoryItem, QuickNote } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DisabledButton } from '@/components/RoleGuard';

interface DashboardStats {
  totalPatients: number;
  totalOwners: number;
  appointmentsToday: number;
  pendingAppointments: number;
  lowStockItems: number;
  totalRevenue: number;
  recentConsultations: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    totalOwners: 0,
    appointmentsToday: 0,
    pendingAppointments: 0,
    lowStockItems: 0,
    totalRevenue: 0,
    recentConsultations: 0
  });
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [noteColor, setNoteColor] = useState<QuickNote['color']>('blue');
  const [notesLoading, setNotesLoading] = useState(false);

  const noteColorStyles: Record<QuickNote['color'], string> = {
    blue: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-100',
    green: 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-900 dark:text-green-100',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-900 dark:text-yellow-100',
    red: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-900 dark:text-red-100',
  };

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
      loadNotes();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Cargar datos en paralelo
      const [appointments, owners, inventory, patients] = await Promise.all([
        getAppointments(),
        getOwners(),
        getInventoryItems(),
        getPatients()
      ]);

      // Calcular estadísticas
      const today = new Date().toISOString().split('T')[0];
      const appointmentsToday = appointments.filter(apt => apt.date === today).length;
      const pendingAppointments = appointments.filter(apt => apt.status === 'Programada').length;
      const lowStockItems = inventory.filter(item => item.quantity <= item.minQuantity).length;
      
      // Simular ingresos (en una app real vendría de las consultas)
      const totalRevenue = appointments.filter(apt => apt.status === 'Completada').length * 25000;

      setStats({
        totalPatients: patients.length,
        totalOwners: owners.length,
        appointmentsToday,
        pendingAppointments,
        lowStockItems,
        totalRevenue,
        recentConsultations: appointments.filter(apt => apt.status === 'Completada').length
      });

      // Próximas citas (próximos 3 días)
      const next3Days = appointments
        .filter(apt => apt.status === 'Programada')
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(0, 5);
      setUpcomingAppointments(next3Days);

      // Productos con bajo stock
      const lowStock = inventory
        .filter(item => item.quantity <= item.minQuantity)
        .slice(0, 5);
      setLowStockProducts(lowStock);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNotes = async () => {
    setNotesLoading(true);
    try {
      const notes = await getQuickNotes();
      setQuickNotes(notes.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      // Manejo de error opcional
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    await addQuickNote({ text: newNote, color: noteColor });
    setNewNote('');
    loadNotes();
  };

  const handleCompleteNote = async (id: string) => {
    try {
      await deleteQuickNote(id);
      await loadNotes();
    } catch (error) {
      console.error('Error al completar nota:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-CL', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="md" variant="primary" />
      </div>
    );
  }

  return (
    <GlobalLoading isLoading={loading || isLoading}>
      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
        <Header title="Dashboard" />
          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-background space-y-4 sm:space-y-6">
            
            {/* Estadísticas Principales */}
            <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-blue-700 dark:text-blue-300">Consultas Hoy</CardTitle>
                    <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                      <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.appointmentsToday}</div>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      {stats.appointmentsToday > 0 ? 'Citas programadas' : 'Sin citas hoy'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-green-700 dark:text-green-300">Pacientes</CardTitle>
                    <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalPatients}</div>
                    <p className="text-xs text-green-600 dark:text-green-400">
                      {stats.totalOwners} dueños registrados
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Citas Pendientes</CardTitle>
                    <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingAppointments}</div>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      Por confirmar o reprogramar
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-xs sm:text-sm font-medium text-purple-700 dark:text-purple-300">Ingresos del Mes</CardTitle>
                    <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl sm:text-2xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs text-purple-600 dark:text-purple-400">
                      {stats.recentConsultations} consultas realizadas
                    </p>
                  </CardContent>
                </Card>
              </div>

            {/* Contenido Principal */}
            <div className="grid gap-4 sm:gap-6 grid-cols-1 lg:grid-cols-3">
              
              {/* Próximas Citas */}
              <Card className="lg:col-span-2 border-l-4 border-l-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm sm:text-base">
                    <div className="p-1 bg-indigo-500 rounded">
                      <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    Próximas Citas
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                    Citas programadas para los próximos días
                  </p>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-indigo-600 dark:text-indigo-400">
                      <Calendar className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">No hay citas programadas</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 sm:mt-4 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
                        onClick={() => router.push('/agenda')}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                        Agendar Cita
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {upcomingAppointments.map((appointment) => (
                        <div 
                          key={appointment.id}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-indigo-200 bg-white/50 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                          onClick={() => router.push('/consultas')}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-indigo-500 rounded-full flex items-center justify-center">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-indigo-900 dark:text-indigo-100 text-sm sm:text-base truncate">{appointment.patientName}</p>
                              <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 truncate">
                                {appointment.ownerName} • {appointment.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-xs sm:text-sm font-medium text-indigo-900 dark:text-indigo-100">{formatDate(appointment.date)}</p>
                            <p className="text-xs text-indigo-600 dark:text-indigo-400">{appointment.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Alertas de Inventario */}
              <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm sm:text-base">
                    <div className="p-1 bg-red-500 rounded">
                      <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    Alertas de Stock
                  </CardTitle>
                  <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                    Productos con bajo inventario
                  </p>
                </CardHeader>
                <CardContent>
                  {lowStockProducts.length === 0 ? (
                    <div className="text-center py-6 sm:py-8 text-red-600 dark:text-red-400">
                      <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 sm:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base">Todo el inventario está bien</p>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      {lowStockProducts.map((product) => (
                        <div 
                          key={product.id}
                          className="flex items-center justify-between p-2 sm:p-3 rounded-lg border border-red-200 bg-white/50 hover:bg-red-50 dark:border-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                          onClick={() => router.push('/inventario')}
                        >
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-500 rounded-full flex items-center justify-center">
                              <Package className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-red-900 dark:text-red-100 text-sm sm:text-base truncate">{product.name}</p>
                              <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                                Stock: {product.quantity} / {product.minQuantity}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Acciones Rápidas */}
              <Card className="border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/20 dark:to-emerald-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <div className="p-1 bg-emerald-500 rounded">
                      <Activity className="h-5 w-5 text-white" />
                    </div>
                    Acciones Rápidas
                  </CardTitle>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400">
                    Acceso directo a funciones principales
                  </p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <DisabledButton 
                    resource="citas"
                    action="create"
                    variant="outline" 
                    className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                    tooltip="Agendar nueva cita"
                    onClick={() => router.push('/agenda')}
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar Cita
                  </DisabledButton>
                  <DisabledButton 
                    resource="consultas"
                    action="create"
                    variant="outline" 
                    className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                    tooltip="Crear nueva consulta"
                    onClick={() => router.push('/consultas')}
                  >
                    <Stethoscope className="h-4 w-4 mr-2" />
                    Nueva Consulta
                  </DisabledButton>
                  <DisabledButton 
                    resource="pacientes"
                    action="create"
                    variant="outline" 
                    className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                    tooltip="Registrar nuevo paciente"
                    onClick={() => router.push('/pacientes')}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Registrar Paciente
                  </DisabledButton>
                  <DisabledButton 
                    resource="duenos"
                    action="create"
                    variant="outline" 
                    className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                    tooltip="Agregar nuevo dueño"
                    onClick={() => router.push('/duenos-clientes')}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Agregar Dueño
                  </DisabledButton>
                  <DisabledButton 
                    resource="inventario"
                    action="read"
                    variant="outline" 
                    className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                    tooltip="Gestionar inventario"
                    onClick={() => router.push('/inventario')}
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Gestionar Inventario
                  </DisabledButton>
                </CardContent>
              </Card>

              {/* Estadísticas Adicionales */}
              <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
                    <div className="p-1 bg-amber-500 rounded">
                      <TrendingUp className="h-5 w-5 text-white" />
                    </div>
                    Resumen Semanal
                  </CardTitle>
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Actividad de la última semana
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Consultas realizadas</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-100">{stats.recentConsultations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Nuevos pacientes</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-100">{Math.floor(stats.totalPatients * 0.1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Productos bajos</span>
                    <span className="font-semibold text-orange-600">{stats.lowStockItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-amber-700 dark:text-amber-300">Citas confirmadas</span>
                    <span className="font-semibold text-green-600">{stats.pendingAppointments}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notas Rápidas */}
              <Card className="border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                    <div className="p-1 bg-cyan-500 rounded">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    Notas del Día
                  </CardTitle>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400">
                    Recordatorios y notas importantes
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {notesLoading ? (
                      <div className="text-center py-4 text-cyan-600 dark:text-cyan-400">Cargando notas...</div>
                    ) : quickNotes.length === 0 ? (
                      <div className="text-center py-4 text-cyan-600 dark:text-cyan-400">No hay notas guardadas.</div>
                    ) : (
                      quickNotes.map(note => (
                        <div
                          key={note.id}
                          className={`p-3 rounded-lg border flex items-center justify-between gap-2 shadow-sm transition-colors ${noteColorStyles[note.color]} hover:scale-[1.01]`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{note.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(note.createdAt).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleCompleteNote(note.id)}>
                            <span className="sr-only">Marcar como completada</span>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      ))
                    )}
                    <div className="flex gap-2 mt-2">
                      <input
                        type="text"
                        className="flex-1 p-2 rounded border border-cyan-300 bg-white/50 text-cyan-900 dark:border-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-100 placeholder-cyan-600 dark:placeholder-cyan-400"
                        placeholder="Agregar nota rápida..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
                      />
                      <label htmlFor="note-color" className="sr-only">Color</label>
                      <select
                        id="note-color"
                        className="rounded border border-cyan-300 bg-white/50 text-cyan-900 dark:border-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-100"
                        value={noteColor}
                        onChange={e => setNoteColor(e.target.value as QuickNote['color'])}
                      >
                        <option value="blue">Azul</option>
                        <option value="green">Verde</option>
                        <option value="yellow">Amarillo</option>
                        <option value="red">Rojo</option>
                      </select>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-950/30"
                        onClick={handleAddNote}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Agregar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </div>
    </GlobalLoading>
  );
} 