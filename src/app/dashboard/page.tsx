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
import { Appointment, InventoryItem, QuickNote, Consulta } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { collection, getDocs, query, where, orderBy, limit, addDoc, deleteDoc, doc, collectionGroup } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { DisabledButton } from '@/components/RoleGuard';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend
} from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { startOfWeek, startOfMonth, startOfYear, format, isSameWeek, isSameMonth, isSameYear } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { convertFirestoreTimestamp } from '@/lib/utils';

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
  const [rangeConsultas, setRangeConsultas] = useState<'semana' | 'mes' | 'año'>('mes');
  const [rangeIngresos, setRangeIngresos] = useState<'dia' | 'semana' | 'mes' | 'año'>('mes');
  const [consultasData, setConsultasData] = useState<any[]>([]);
  const [ingresosData, setIngresosData] = useState<any[]>([]);
  const [stockData, setStockData] = useState<any[]>([]);

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
      loadConsultasYStock();
    }
  }, [user, rangeConsultas, rangeIngresos]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      //PICO PAL QUE LEE
      
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
      
      // Calcular ingresos según el rango seleccionado
      let totalRevenue = 0;
      let recentConsultations = 0;
      
      // Obtener consultas para calcular ingresos reales
      const consultasRef = collectionGroup(db, 'consultas');
      const consultasQuery = query(consultasRef, orderBy('fecha', 'desc'));
      const consultasSnapshot = await getDocs(consultasQuery);
      const consultas = consultasSnapshot.docs.map(doc => {
        const data = doc.data();
        
        // Usar la función utilitaria para manejar fechas de Firestore
        const fecha = convertFirestoreTimestamp(data.fecha);

        return {
          fecha,
          costoConsulta: data.costoConsulta || 0,
          estado: data.estado || 'Pendiente'
        };
      });

      if (rangeIngresos === 'dia') {
        const hoy = new Date();
        const consultasDia = consultas.filter(c => 
          c.fecha.getDate() === hoy.getDate() &&
          c.fecha.getMonth() === hoy.getMonth() &&
          c.fecha.getFullYear() === hoy.getFullYear() &&
          c.estado === 'Realizada'
        );
        totalRevenue = consultasDia.reduce((sum, c) => sum + (c.costoConsulta || 25000), 0);
        recentConsultations = consultasDia.length;
      } else if (rangeIngresos === 'semana') {
        const consultasSemana = consultas.filter(c => 
          isSameWeek(c.fecha, new Date(), { weekStartsOn: 1 }) && c.estado === 'Realizada'
        );
        totalRevenue = consultasSemana.reduce((sum, c) => sum + (c.costoConsulta || 25000), 0);
        recentConsultations = consultasSemana.length;
      } else if (rangeIngresos === 'mes') {
        const consultasMes = consultas.filter(c => 
          isSameMonth(c.fecha, new Date()) && c.estado === 'Realizada'
        );
        totalRevenue = consultasMes.reduce((sum, c) => sum + (c.costoConsulta || 25000), 0);
        recentConsultations = consultasMes.length;
      } else if (rangeIngresos === 'año') {
        const consultasAño = consultas.filter(c => 
          isSameYear(c.fecha, new Date()) && c.estado === 'Realizada'
        );
        totalRevenue = consultasAño.reduce((sum, c) => sum + (c.costoConsulta || 25000), 0);
        recentConsultations = consultasAño.length;
      }

      setStats({
        totalPatients: patients.length,
        totalOwners: owners.length,
        appointmentsToday,
        pendingAppointments,
        lowStockItems,
        totalRevenue,
        recentConsultations
      });

      // Próximas citas (sin filtro por rango)
      const filteredAppointments = appointments.filter(apt => apt.status === 'Programada');
      setUpcomingAppointments(filteredAppointments.slice(0, 5));

      // Productos con bajo stock (sin filtro por rango)
      const filteredLowStock = inventory.filter(item => item.quantity <= item.minQuantity);
      setLowStockProducts(filteredLowStock.slice(0, 5));

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

  const loadConsultasYStock = async () => {
    try {
      // Consultas
      const consultasRef = collectionGroup(db, 'consultas');
      const consultasQuery = query(consultasRef, orderBy('fecha', 'desc'));
      const snapshot = await getDocs(consultasQuery);
      const consultas: Consulta[] = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Usar la función utilitaria para manejar fechas de Firestore
        const fecha = convertFirestoreTimestamp(data.fecha);

        let proximaCita: Date | undefined;
        if (data.proximaCita) {
          proximaCita = convertFirestoreTimestamp(data.proximaCita);
        }

        return {
          id: doc.id,
          mascotaId: data.mascotaId,
          veterinarioId: data.veterinarioId,
          fecha,
          motivo: data.motivo,
          sintomas: data.sintomas,
          diagnostico: data.diagnostico,
          tratamiento: data.tratamiento,
          proximaCita,
          estado: data.estado || 'Pendiente',
          costoConsulta: data.costoConsulta || 0,
        };
      });

      console.log('Consultas procesadas:', consultas.length);
      console.log('Ejemplo de consulta:', consultas[0]);

      // Agrupación para consultas
      let agrupado: Record<string, { consultas: number; ingresos: number } > = {};
      let labels: string[] = [];
      
      if (rangeConsultas === 'semana') {
        // Agrupar por día de la semana actual
        const dias = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
        const hoy = new Date();
        const inicioSemana = startOfWeek(hoy, { weekStartsOn: 1 });
        
        for (let i = 0; i < 7; i++) {
          const label = dias[i];
          labels.push(label);
          agrupado[label] = { consultas: 0, ingresos: 0 };
        }
        
        consultas.forEach(c => {
          if (isSameWeek(c.fecha, hoy, { weekStartsOn: 1 })) {
            const diaSemana = c.fecha.getDay();
            const indiceDia = diaSemana === 0 ? 6 : diaSemana - 1; // Domingo = 0, pero queremos que sea índice 6
            const dia = dias[indiceDia];
            agrupado[dia].consultas++;
            agrupado[dia].ingresos += (c.costoConsulta || 25000);
          }
        });
      } else if (rangeConsultas === 'mes') {
        // Agrupar por día del mes actual
        const hoy = new Date();
        const diasMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0).getDate();
        for (let i = 1; i <= diasMes; i++) {
          const label = i.toString();
          labels.push(label);
          agrupado[label] = { consultas: 0, ingresos: 0 };
        }
        consultas.forEach(c => {
          if (isSameMonth(c.fecha, hoy)) {
            const dia = c.fecha.getDate().toString();
            agrupado[dia].consultas++;
            agrupado[dia].ingresos += (c.costoConsulta || 25000);
          }
        });
      } else if (rangeConsultas === 'año') {
        // Agrupar por mes del año actual
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        for (let i = 0; i < 12; i++) {
          const label = meses[i];
          labels.push(label);
          agrupado[label] = { consultas: 0, ingresos: 0 };
        }
        consultas.forEach(c => {
          if (isSameYear(c.fecha, new Date())) {
            const mes = meses[c.fecha.getMonth()];
            agrupado[mes].consultas++;
            agrupado[mes].ingresos += (c.costoConsulta || 25000);
          }
        });
      }
      
      const dataGrafico = labels.map(label => ({ periodo: label, ...agrupado[label] }));
      console.log('Datos del gráfico:', dataGrafico);
      setConsultasData(dataGrafico);
      setIngresosData(dataGrafico);
      
      // Inventario (solo stock actual)
      const inventoryRef = collection(db, 'inventory');
      const inventorySnap = await getDocs(inventoryRef);
      const stock = inventorySnap.docs.map(doc => {
        const data = doc.data() as InventoryItem;
        // Acortar nombres largos para que se muestren mejor en el gráfico
        const shortName = data.name.length > 15 ? data.name.substring(0, 12) + '...' : data.name;
        return { name: shortName, stock: data.quantity, fullName: data.name };
      });
      // Limitar a los primeros 8 productos para evitar sobrecarga visual
      setStockData(stock.slice(0, 8));
    } catch (error) {
      console.error('Error al cargar consultas y stock:', error);
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
          <Header title="Gestión de Veterinaria" />
          <main className="flex-1 p-2 sm:p-4 lg:p-6 xl:p-8 overflow-y-auto bg-background space-y-3 sm:space-y-4 lg:space-y-6">
            
            {/* Estadísticas Principales - Mejorado para móviles */}
            <div className="grid gap-2 sm:gap-3 lg:gap-4 grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-blue-700 dark:text-blue-300 leading-tight">Consultas Hoy</CardTitle>
                    <div className="p-1 sm:p-1.5 lg:p-2 bg-blue-500 rounded-lg">
                      <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 sm:pt-2">
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.appointmentsToday}</div>
                    <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 leading-tight">
                      {stats.appointmentsToday > 0 ? 'Citas programadas' : 'Sin citas hoy'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-green-500 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-green-700 dark:text-green-300 leading-tight">Pacientes</CardTitle>
                    <div className="p-1 sm:p-1.5 lg:p-2 bg-green-500 rounded-lg">
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 sm:pt-2">
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-green-900 dark:text-green-100">{stats.totalPatients}</div>
                    <p className="text-xs sm:text-sm text-green-600 dark:text-green-400 leading-tight">
                      {stats.totalOwners} dueños registrados
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-orange-500 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                    <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-orange-700 dark:text-orange-300 leading-tight">Citas Pendientes</CardTitle>
                    <div className="p-1 sm:p-1.5 lg:p-2 bg-orange-500 rounded-lg">
                      <Clock className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 sm:pt-2">
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-orange-900 dark:text-orange-100">{stats.pendingAppointments}</div>
                    <p className="text-xs sm:text-sm text-orange-600 dark:text-orange-400 leading-tight">
                      Por confirmar o reprogramar
                    </p>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-purple-500 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xs sm:text-sm lg:text-base font-medium text-purple-700 dark:text-purple-300 leading-tight">Ingresos</CardTitle>
                      <Tabs value={rangeIngresos} onValueChange={(val) => setRangeIngresos(val as 'dia' | 'semana' | 'mes' | 'año')}>
                        <TabsList className="h-6">
                          <TabsTrigger value="dia" className="text-xs px-2">D</TabsTrigger>
                          <TabsTrigger value="semana" className="text-xs px-2">S</TabsTrigger>
                          <TabsTrigger value="mes" className="text-xs px-2">M</TabsTrigger>
                          <TabsTrigger value="año" className="text-xs px-2">A</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    <div className="p-1 sm:p-1.5 lg:p-2 bg-purple-500 rounded-lg">
                      <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-1 sm:pt-2">
                    <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-purple-900 dark:text-purple-100">{formatCurrency(stats.totalRevenue)}</div>
                    <p className="text-xs sm:text-sm text-purple-600 dark:text-purple-400 leading-tight">
                      {stats.recentConsultations} consultas realizadas
                    </p>
                  </CardContent>
                </Card>
              </div>

            {/* Contenido Principal - Layout mejorado para diferentes pantallas */}
            <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 xl:grid-cols-3">
              
              {/* Próximas Citas - Ocupa 2 columnas en pantallas grandes */}
              <Card className="xl:col-span-2 border-l-4 border-l-indigo-500 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/20 dark:to-indigo-900/10">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 text-sm sm:text-base lg:text-lg">
                      <div className="p-1 sm:p-1.5 bg-indigo-500 rounded">
                        <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      Próximas Citas
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">
                    Citas programadas próximas
                  </p>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <div className="text-center py-4 sm:py-6 lg:py-8 text-indigo-600 dark:text-indigo-400">
                      <Calendar className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto mb-2 sm:mb-3 lg:mb-4 opacity-50" />
                      <p className="text-sm sm:text-base lg:text-lg">No hay citas programadas</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 sm:mt-3 lg:mt-4 border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-600 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
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
                          className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg border border-indigo-200 bg-white/50 hover:bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/20 dark:hover:bg-indigo-900/30 transition-colors cursor-pointer"
                          onClick={() => router.push('/consultas')}
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Clock className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-indigo-900 dark:text-indigo-100 text-sm sm:text-base lg:text-lg truncate">{appointment.patientName}</p>
                              <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 truncate">
                                {appointment.ownerName} • {appointment.type}
                              </p>
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0 ml-2 sm:ml-3">
                            <p className="text-xs sm:text-sm lg:text-base font-medium text-indigo-900 dark:text-indigo-100">{formatDate(appointment.date)}</p>
                            <p className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400">{appointment.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Columna derecha - Stack vertical en móviles, lado a lado en pantallas grandes */}
              <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-1">
                
                {/* Alertas de Inventario */}
                <Card className="border-l-4 border-l-red-500 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/10">
                  <CardHeader className="pb-2 sm:pb-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2 text-red-700 dark:text-red-300 text-sm sm:text-base lg:text-lg">
                        <div className="p-1 sm:p-1.5 bg-red-500 rounded">
                          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                        </div>
                        Alertas de Stock
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-red-600 dark:text-red-400">
                      Productos con bajo inventario
                    </p>
                  </CardHeader>
                  <CardContent>
                    {lowStockProducts.length === 0 ? (
                      <div className="text-center py-4 sm:py-6 lg:py-8 text-red-600 dark:text-red-400">
                        <Package className="h-8 w-8 sm:h-12 sm:w-12 lg:h-16 lg:w-16 mx-auto mb-2 sm:mb-3 lg:mb-4 opacity-50" />
                        <p className="text-sm sm:text-base lg:text-lg">Todo el inventario está bien</p>
                      </div>
                    ) : (
                      <div className="space-y-2 sm:space-y-3">
                        {lowStockProducts.map((product) => (
                          <div 
                            key={product.id}
                            className="flex items-center justify-between p-2 sm:p-3 lg:p-4 rounded-lg border border-red-200 bg-white/50 hover:bg-red-50 dark:border-red-700 dark:bg-red-950/20 dark:hover:bg-red-900/30 transition-colors cursor-pointer"
                            onClick={() => router.push('/inventario')}
                          >
                            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <Package className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-red-900 dark:text-red-100 text-sm sm:text-base lg:text-lg truncate">{product.name}</p>
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
                  <CardHeader className="pb-2 sm:pb-3">
                    <CardTitle className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-sm sm:text-base lg:text-lg">
                      <div className="p-1 sm:p-1.5 bg-emerald-500 rounded">
                        <Activity className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      Acciones Rápidas
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400">
                      Acceso directo a funciones principales
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-2 sm:space-y-3">
                    <DisabledButton 
                      resource="citas"
                      action="create"
                      variant="outline" 
                      className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30 text-xs sm:text-sm lg:text-base"
                      tooltip="Agendar nueva cita"
                      onClick={() => router.push('/agenda')}
                    >
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2" />
                      Agendar Cita
                    </DisabledButton>
                    <DisabledButton 
                      resource="consultas"
                      action="create"
                      variant="outline" 
                      className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30 text-xs sm:text-sm lg:text-base"
                      tooltip="Crear nueva consulta"
                      onClick={() => router.push('/consultas')}
                    >
                      <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2" />
                      Nueva Consulta
                    </DisabledButton>
                    <DisabledButton 
                      resource="pacientes"
                      action="create"
                      variant="outline" 
                      className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30 text-xs sm:text-sm lg:text-base"
                      tooltip="Registrar nuevo paciente"
                      onClick={() => router.push('/pacientes')}
                    >
                      <Users className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2" />
                      Registrar Paciente
                    </DisabledButton>
                    <DisabledButton 
                      resource="duenos"
                      action="create"
                      variant="outline" 
                      className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30 text-xs sm:text-sm lg:text-base"
                      tooltip="Agregar nuevo dueño"
                      onClick={() => router.push('/duenos-clientes')}
                    >
                      <UserCheck className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2" />
                      Agregar Dueño
                    </DisabledButton>
                    <DisabledButton 
                      resource="inventario"
                      action="read"
                      variant="outline" 
                      className="w-full justify-start border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-600 dark:text-emerald-300 dark:hover:bg-emerald-950/30 text-xs sm:text-sm lg:text-base"
                      tooltip="Gestionar inventario"
                      onClick={() => router.push('/inventario')}
                    >
                      <Package className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 mr-2" />
                      Gestionar Inventario
                    </DisabledButton>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Segunda fila - Estadísticas adicionales y notas */}
            <div className="grid gap-3 sm:gap-4 lg:gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              
              {/* Estadísticas Adicionales */}
              <Card className="border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/10">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 text-sm sm:text-base lg:text-lg">
                      <div className="p-1 sm:p-1.5 bg-amber-500 rounded">
                        <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      Resumen
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-600 dark:text-amber-400">
                    Actividad general del sistema
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm lg:text-base text-amber-700 dark:text-amber-300">Consultas realizadas</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base lg:text-lg">{stats.recentConsultations}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm lg:text-base text-amber-700 dark:text-amber-300">Nuevos pacientes</span>
                    <span className="font-semibold text-amber-900 dark:text-amber-100 text-sm sm:text-base lg:text-lg">{Math.floor(stats.totalPatients * 0.1)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm lg:text-base text-amber-700 dark:text-amber-300">Productos bajos</span>
                    <span className="font-semibold text-orange-600 text-sm sm:text-base lg:text-lg">{stats.lowStockItems}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm lg:text-base text-amber-700 dark:text-amber-300">Citas confirmadas</span>
                    <span className="font-semibold text-green-600 text-sm sm:text-base lg:text-lg">{stats.pendingAppointments}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Notas Rápidas - Ocupa 2 columnas en pantallas grandes */}
              <Card className="lg:col-span-2 border-l-4 border-l-cyan-500 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-950/20 dark:to-cyan-900/10">
                <CardHeader className="pb-2 sm:pb-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300 text-sm sm:text-base lg:text-lg">
                      <div className="p-1 sm:p-1.5 bg-cyan-500 rounded">
                        <FileText className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-white" />
                      </div>
                      Notas
                    </div>
                  </div>
                  <p className="text-xs sm:text-sm text-cyan-600 dark:text-cyan-400">
                    Recordatorios y notas recientes
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
                          className={`p-2 sm:p-3 lg:p-4 rounded-lg border flex items-center justify-between gap-2 shadow-sm transition-colors ${noteColorStyles[note.color]} hover:scale-[1.01]`}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-xs sm:text-sm lg:text-base font-medium truncate">{note.text}</p>
                            <p className="text-xs text-muted-foreground mt-1">{new Date(note.createdAt).toLocaleString('es-CL', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</p>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => handleCompleteNote(note.id)} className="flex-shrink-0">
                            <span className="sr-only">Marcar como completada</span>
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      ))
                    )}
                    <div className="flex gap-2 mt-2 flex-col sm:flex-row">
                      <input
                        type="text"
                        className="flex-1 p-2 sm:p-3 rounded border border-cyan-300 bg-white/50 text-cyan-900 dark:border-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-100 placeholder-cyan-600 dark:placeholder-cyan-400 text-xs sm:text-sm lg:text-base"
                        placeholder="Agregar nota rápida..."
                        value={newNote}
                        onChange={e => setNewNote(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') handleAddNote(); }}
                      />
                      <div className="flex gap-2">
                        <label htmlFor="note-color" className="sr-only">Color</label>
                        <select
                          id="note-color"
                          className="rounded border border-cyan-300 bg-white/50 text-cyan-900 dark:border-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-100 text-xs sm:text-sm lg:text-base px-2 sm:px-3"
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
                          className="border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-600 dark:text-cyan-300 dark:hover:bg-cyan-950/30 text-xs sm:text-sm lg:text-base"
                          onClick={handleAddNote}
                        >
                          <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          Agregar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Gráfico de Consultas */}
                <div className="bg-card rounded-lg p-4 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Consultas e Ingresos</h3>
                    <Tabs value={rangeConsultas} onValueChange={(val) => setRangeConsultas(val as 'semana' | 'mes' | 'año')}>
                      <TabsList>
                        <TabsTrigger value="semana">Semana</TabsTrigger>
                        <TabsTrigger value="mes">Mes</TabsTrigger>
                        <TabsTrigger value="año">Año</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                  <ResponsiveContainer width="100%" height={350}>
                    <LineChart data={consultasData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="periodo" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="consultas" stroke="#8884d8" name="Consultas" />
                      <Line type="monotone" dataKey="ingresos" stroke="#82ca9d" name="Ingresos" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                {/* Gráfico de Stock de Inventario */}
                <div className="bg-card rounded-lg p-4 shadow">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold">Stock de Inventario</h3>
                  </div>
                  <ResponsiveContainer width="100%" height={410}>
                    <BarChart data={stockData} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="name" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        tick={{ fontSize: 10 }}
                      />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name, props) => [
                          `${value} unidades`, 
                          `${props.payload.fullName || props.payload.name}`
                        ]}
                        labelFormatter={(label) => `Stock: ${label}`}
                      />
                      <Bar dataKey="stock" fill="#8884d8" name="Stock" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </GlobalLoading>
  );
} 