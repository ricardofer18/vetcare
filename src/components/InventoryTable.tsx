import React from 'react';
import { Button } from './ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { InventoryItem } from '../lib/firestore';

const MedicationIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const SupplyIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 10.5h12M8.25 14.25h12M8.25 18H12M3 6.75H7.5a1.5 1.5 0 0 1 1.5 1.5v3.75m-9-3.75H4.5M3 10.5H7.5a1.5 1.5 0 0 1 1.5 1.5v3.75m-9-3.75H4.5M9 16.5v-6a3 3 0 0 0-3-3H3m0 0l3-3m-3 3l3 3" /></svg>;
const FoodIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 21h5.25m-1.5-10.375v1.5m0 0V21m-8.25-6.75h1.5m-1.5 3h1.5m-1.5 3h1.5M3 21h9m-9 0V3m0 18h.375a4.873 4.873 0 0 0 4.875-4.875V12.75m6.75 6.75h.75m-.75 3H16.5m-.75-3V12.75m0 0H12.75m-3 0h.375a4.873 4.873 0 0 0 4.875-4.875V6.75m-3 0V3m0 3.75H9M15 21h3.75a4.873 4.873 0 0 0 4.875-4.875V12.75m0-9h-3m-6-1.5h.375a4.873 4.873 0 0 0 4.875-4.875V3" /></svg>;
const VaccineIcon = <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.029m2.25-7.177-.02-.029m2.25 7.177-.02-.029m0 3.004v3m-4.25 2.147L7.425 21L3 17.525m12.75-15l-.35.35A4.5 4.5 0 0 1 19.5 7.5V12m-8.25-6.75H12m-8.25 0H12m-3 2.25H12M12 18.75V21M4.5 11.25H12m-7.5 3.75H12m-9-6.42L3 16.5V4.5A2.25 2.25 0 0 1 5.25 2.25H9.568a2.25 2.25 0 0 1 1.59.659l2.182 2.182c.45.451.659 1.06.659 1.71V10.5M19.5 19.5h-.002m0 0v.002m0 .002h-.002v-.002ZM12 12.75h.002v.002H12v-.002Z" /></svg>;

const iconByCategory: { [key: string]: React.ReactNode } = {
  Medicamentos: MedicationIcon,
  Alimentos: FoodIcon,
  Insumos: SupplyIcon,
  Vacunas: VaccineIcon,
};

interface InventoryTableProps {
  products: InventoryItem[];
  onEdit: (product: InventoryItem) => void;
  onDelete: (productId: string) => void;
}

const InventoryTable: React.FC<InventoryTableProps> = ({ products, onEdit, onDelete }) => {
  const getStatusColor = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'bg-red-800';
    if (quantity < minQuantity) return 'bg-yellow-700';
    if (quantity === minQuantity) return 'bg-yellow-600';
    return 'bg-green-700';
  };

  const getStatusText = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'Sin Stock';
    if (quantity <= minQuantity) return 'Stock Bajo';
    return 'En Stock';
  };

  return (
    <div className="bg-[#1f2937] rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-[#374151]">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Producto</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Categoría</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Precio</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Última Reposición</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Acciones</th>
          </tr>
        </thead>
        <tbody className="bg-[#1f2937] divide-y divide-gray-700">
          {products.map(product => (
            <tr key={product.id} className="hover:bg-[#374151]">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 text-gray-400">
                    {iconByCategory[product.category] || MedicationIcon}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-white">{product.name}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{product.category}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                 <div className="flex items-center">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.quantity, product.minQuantity)} text-white mr-2`}>
                        {getStatusText(product.quantity, product.minQuantity)}
                    </span>
                    <span className="text-sm text-gray-300">{product.quantity} / {product.minQuantity}</span>
                 </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">${product.price.toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{product.lastRestock}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)} className="text-red-500 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InventoryTable; 