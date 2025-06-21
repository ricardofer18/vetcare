import React from 'react';
import { Owner } from '../lib/firestore'; // Importar la interfaz Owner

interface OwnerTableProps {
  owners: Owner[];
  onRowClick: (owner: Owner) => void;
}

const OwnerTable: React.FC<OwnerTableProps> = ({ owners, onRowClick }) => {
  return (
    <div className="bg-[#1f2937] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-[#374151]">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dueño</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">RUT</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Contacto</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-[#1f2937] divide-y divide-gray-700">
          {owners.map(owner => (
            <tr key={owner.id} onClick={() => onRowClick(owner)} className="hover:bg-[#374151] cursor-pointer">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-sm font-semibold">
                      {owner.nombre.charAt(0)}{owner.apellido.charAt(0)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{owner.nombre} {owner.apellido}</div>
                    <div className="text-sm text-gray-400">{owner.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{owner.rut}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <div>{owner.telefono}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <button className="text-gray-400 hover:text-gray-300" aria-label="Editar dueño">
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

export default OwnerTable; 