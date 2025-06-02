"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface SidebarProps {
  // Add any necessary props later, like user info
}

const Sidebar: React.FC<SidebarProps> = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navItems = [
    { href: '/', label: 'Dashboard', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7 7m-3 7v-3m-6 3v-3" /></svg> },
    { href: '/agenda', label: 'Agenda de Citas', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
    { href: '/pacientes', label: 'Pacientes', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.33 19.76A5.953 5.953 0 0010 21a5.953 5.953 0 005.67-1.24M12 10v1m0 0v1m0 1v1m0-3a3 3 0 100-6 3 3 0 000 6z" /></svg> },
    { href: '/duenos-clientes', label: 'Dueños / Clientes', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0A5.949 5.949 0 0112 15a5.949 5.949 0 014.244 1.143m4.243 1.143A5.949 5.949 0 0012 20.999m0 0H12m0-14a4 4 0 100 8 4 4 0 000-8z" /></svg> },
    { href: '/inventario', label: 'Inventario', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg> },
    { href: '/historial-clinico', label: 'Historial Clínico', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg> },
    { href: '/administracion', label: 'Administración', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.435 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { href: '/configuracion', label: 'Configuración', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.435 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
    { href: '/usuarios', label: 'Usuarios', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
  ];

  const handleLogout = () => {
    // TODO: Implement Firebase sign-out logic here
    console.log('Cerrar Sesión');
    // Clear any client-side authentication data (e.g., tokens, user state)

    // Redirect to login page or home page
    router.replace('/'); // Use replace to prevent going back to the dashboard
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow flex flex-col justify-between">
      <div>
        <div className="p-4">
          {/* Aquí irá el logo y nombre de la app */}
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">VetCare</h1>
        </div>
        <nav className="mt-4">
          <ul>
            {navItems.map((item) => (
              <li
                key={item.href}
                className={`px-4 py-2 cursor-pointer flex items-center ${pathname === item.href ? 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold' : 'text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                {item.icon}
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}

            {/* Cerrar Sesión */}
            <li> {/* Using li for semantic correctness within nav */}
              <button 
                onClick={handleLogout} // Add onClick handler
                className="group flex items-center px-2 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-gray-700 hover:text-white w-full"
              >
                <svg className="mr-3 flex-shrink-0 h-6 w-6 text-gray-400 group-hover:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                Cerrar Sesión
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Sección de usuario y modo oscuro */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {/* Aquí irá la información del usuario */}
        <div className="flex items-center mb-4">
          {/* Ícono de usuario temporal */}
          <div className="h-8 w-8 rounded-full bg-blue-500 mr-3 flex items-center justify-center text-white text-lg">CM</div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white">Dr. Carlos Mendoza</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
          </div>
           {/* Ícono de logout temporal */}
           <div className="ml-auto text-gray-500 dark:text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-gray-200">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
           </div>
        </div>
        {/* Switch de modo oscuro */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-800 dark:text-white">Modo Oscuro</span>
          <div 
            className={`h-6 w-10 rounded-full flex items-center p-1 cursor-pointer transition-colors duration-300 ${isDarkMode ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            <div className={`h-4 w-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${isDarkMode ? 'translate-x-4' : 'translate-x-0'}`}></div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 