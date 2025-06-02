import React from 'react';

export interface Patient {
  id: string;
  image: string;
  name: string;
  code: string;
  species: string;
  age: string;
  owner: string;
  veterinarian: string;
  lastAttention: string;
  status: 'Activo' | 'En seguimiento' | 'Dado de alta';
}

interface PatientsTableProps {
  patients: Patient[];
}

const PatientsTable: React.FC<PatientsTableProps> = ({ patients }) => {
  const getStatusColor = (status: Patient['status']) => {
    switch (status) {
      case 'Activo':
        return 'bg-green-600';
      case 'En seguimiento':
        return 'bg-blue-600';
      case 'Dado de alta':
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
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Paciente</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Especie / Raza</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Edad</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Dueño</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Veterinario</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Última atención</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-[#1f2937] divide-y divide-gray-700">
          {patients.map(patient => (
            <tr key={patient.id} className="hover:bg-[#374151]">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    {/* Placeholder for patient image */}
                    <div className="h-10 w-10 rounded-full bg-gray-600 flex items-center justify-center text-gray-300 text-sm font-semibold">{patient.name.charAt(0)}</div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{patient.name}</div>
                    <div className="text-sm text-gray-400">{patient.code}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{patient.species}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{patient.age}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{patient.owner}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{patient.veterinarian}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{patient.lastAttention}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(patient.status)} text-white`}>
                  {patient.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  {/* View Icon */}
                   <button className="text-gray-400 hover:text-gray-300" aria-label="Ver detalles del paciente">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                   </button>
                  {/* Edit Icon */}
                  <button className="text-gray-400 hover:text-gray-300" aria-label="Editar paciente">
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

export default PatientsTable; 