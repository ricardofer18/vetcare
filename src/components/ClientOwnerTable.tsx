import React from 'react';

export interface Client {
  id: string;
  image: string;
  name: string;
  code: string;
  rutDni: string;
  contact: string;
  pets: number;
  lastAttention: string;
  status: 'Activo' | 'Inactivo';
}

interface ClientOwnerTableProps {
  clients: Client[];
}

const ClientOwnerTable: React.FC<ClientOwnerTableProps> = ({ clients }) => {
  const getStatusColor = (status: Client['status']) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-600';
      case 'Inactivo':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-[#1f2937] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-[#374151]">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cliente</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">RUT / DNI</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contacto</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Mascotas</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Última atención</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-[#1f2937] divide-y divide-gray-700">
          {clients.map(client => (
            <tr key={client.id} className="hover:bg-[#374151]">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {/* Placeholder for client image or avatar */}
                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-sm font-semibold">{client.name.charAt(0)}</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{client.name}</div>
                    <div className="text-sm text-gray-400">{client.code}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.rutDni}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div>{client.contact}</div>
              </td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.pets}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{client.lastAttention}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(client.status)} text-white`}>
                  {client.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  {/* Message Icon */}
                   <button className="text-gray-400 hover:text-gray-300" aria-label="Enviar mensaje al cliente">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                   </button>
                  {/* Edit Icon */}
                  <button className="text-gray-400 hover:text-gray-300" aria-label="Editar cliente">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 0 002-2v-5m-1.414-.707a2 2 0 012.828 0l.707.707m-2.828-.707l-.707.707m-7.071 0l-.707.707M17 10l-2 2m-4 4l-2 2m3-4l2 2m-3-4l2 2" /></svg>
                   </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientOwnerTable; 