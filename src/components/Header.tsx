import React from 'react';

interface HeaderProps {
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="flex items-center justify-between p-6 bg-white dark:bg-gray-800 shadow-md">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white">{title}</h1>

      {/* Ícono de notificaciones */}
      // ... existing code ...
    </header>
  );
}; 