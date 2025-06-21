"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Usuario {
  uid: string;
  email: string;
  displayName: string;
  role: string;
  createdAt: string;
  lastSignInTime?: string;
  emailVerified?: boolean;
  disabled?: boolean;
}

interface UserCardProps {
  usuario: Usuario;
}

const getStatusBadge = (status: boolean, textVerified: string, textNotVerified: string, baseClasses: string, verifiedClasses: string, notVerifiedClasses: string) => (
  <p className={`${baseClasses} ${status ? verifiedClasses : notVerifiedClasses}`}>
    {status ? textVerified : textNotVerified}
  </p>
);

export const UserCard: React.FC<UserCardProps> = ({ usuario }) => {
  const baseBadgeClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';

  return (
    <Card className="bg-gray-800 border-gray-700 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-blue-400">
          {usuario.displayName || 'Sin nombre'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-400">Email</p>
              <p>{usuario.email}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Rol</p>
              <p>{usuario.role || 'Usuario'}</p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Estado</p>
              {getStatusBadge(!usuario.disabled, 'Activo', 'Inactivo', baseBadgeClasses, 'bg-green-900 text-green-300', 'bg-red-900 text-red-300')}
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-400">Email Verificado</p>
              {getStatusBadge(!!usuario.emailVerified, 'Verificado', 'No verificado', baseBadgeClasses, 'bg-green-900 text-green-300', 'bg-yellow-900 text-yellow-300')}
            </div>
          </div>
          {usuario.lastSignInTime && (
            <div className="text-sm text-gray-500 mt-2">
              <p>Último login: {new Date(usuario.lastSignInTime).toLocaleString()}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 