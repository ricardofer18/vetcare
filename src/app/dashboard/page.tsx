'use client';

import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Label } from '@/components/ui/label';
import { Header } from '@/components/Header';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <div className="flex flex-col flex-1">
        <Header title="Dashboard" />
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Consultas Hoy</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Pacientes</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Citas Pendientes</h3>
              <p className="text-3xl font-bold">0</p>
            </div>
            <div className="p-4 bg-white rounded-lg shadow dark:bg-gray-800">
              <h3 className="text-lg font-semibold">Ingresos del Mes</h3>
              <p className="text-3xl font-bold">$0</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
} 