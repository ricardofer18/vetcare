import React from 'react';

interface AlertItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  time: string;
}

const AlertItem: React.FC<AlertItemProps> = ({
  icon,
  title,
  description,
  time,
}) => {
  return (
    <div className="flex items-start mb-4">
      <div className="mr-3 text-blue-500">{icon}</div>
      <div>
        <p className="text-sm font-medium text-gray-800 dark:text-white">{title}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{time}</p>
      </div>
    </div>
  );
};

const AlertsSection = () => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Alertas KPIs</h3>
      <div>
        <AlertItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>}
          title="Horarios saturados"
          description="Los lunes de 10:00 a 12:00 tienen una ocupación del 95%."
          time="Hoy, 10:23 AM"
        />
        <AlertItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" /></svg>}
          title="Alta tasa de cancelaciones"
          description="15 cancelaciones esta semana, 30% más que la media."
          time="Ayer, 15:15 PM"
        />
         <AlertItem 
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h05m0 0l-2 2m2-2l2 2M12 11V9m0 0V6m0 0H9m3 3h3m-9 1a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>}
          title="Baja en ingresos"
          description="Esta semana hay un 8% menos de ingresos que la anterior."
          time="13/07/2023, 09:45 AM"
        />
         {/* Baja demanda de servicio - no hay detalles en la imagen */}
         <div className="mt-4 text-blue-500 text-sm font-medium cursor-pointer">
           Ver todas las alertas →
         </div>

      </div>
    </div>
  );
};

export default AlertsSection; 