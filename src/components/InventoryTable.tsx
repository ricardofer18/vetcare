import React from 'react';

export interface Product {
  id: string;
  image: React.ReactNode; // Using ReactNode for icons
  name: string;
  code: string;
  category: string;
  presentation: string;
  stock: number;
  minStock: number;
  expiryDate: string;
  provider: string;
  status: 'Normal' | 'Bajo' | 'Crítico' | 'Por Vencer' | 'Vencido';
}

interface InventoryTableProps {
  products: Product[];
}

const InventoryTable: React.FC<InventoryTableProps> = ({ products }) => {
  const getStatusColor = (status: Product['status']) => {
    switch (status) {
      case 'Normal':
        return 'bg-green-600';
      case 'Bajo':
        return 'bg-yellow-600';
      case 'Crítico':
        return 'bg-red-600';
      case 'Por Vencer':
        return 'bg-orange-600'; // Using orange for 'Por Vencer'
      case 'Vencido':
        return 'bg-red-800'; // Darker red for 'Vencido'
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-[#1f2937] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-[#374151]">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoría</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Unidad/Presentación</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock Mínimo</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Próximo Venc.</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Proveedor</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody className="bg-[#1f2937] divide-y divide-gray-700">
          {products.map(product => (
            <tr key={product.id} className="hover:bg-[#374151]">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-gray-600 text-gray-300">
                     {/* Product Icon */}
                     {product.image}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{product.name}</div>
                    <div className="text-sm text-gray-400">{product.code}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.presentation}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.stock}</td>
               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.minStock}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.expiryDate}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.provider}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)} text-white`}>
                  {product.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable; 