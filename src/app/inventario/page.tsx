"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { Header } from '../../components/Header';
import InventoryTable, { Product } from '../../components/InventoryTable';
import { getInventoryItems } from '../../lib/firestore';

// Iconos SVG temporales (ejemplos)
const MedicationIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
  </svg>
);

const SupplyIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 10.5h12M8.25 14.25h12M8.25 18H12M3 6.75H7.5a1.5 1.5 0 0 1 1.5 1.5v3.75m-9-3.75H4.5M3 10.5H7.5a1.5 1.5 0 0 1 1.5 1.5v3.75m-9-3.75H4.5M9 16.5v-6a3 3 0 0 0-3-3H3m0 0l3-3m-3 3l3 3" />
  </svg>
);

const FoodIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 21h5.25m-1.5-10.375v1.5m0 0V21m-8.25-6.75h1.5m-1.5 3h1.5m-1.5 3h1.5M3 21h9m-9 0V3m0 18h.375a4.873 4.873 0 0 0 4.875-4.875V12.75m6.75 6.75h.75m-.75 3H16.5m-.75-3V12.75m0 0H12.75m-3 0h.375a4.873 4.873 0 0 0 4.875-4.875V6.75m-3 0V3m0 3.75H9M15 21h3.75a4.873 4.873 0 0 0 4.875-4.875V12.75m0-9h-3m-6-1.5h.375a4.873 4.873 0 0 0 4.875-4.875V3" />
  </svg>
);

const VaccineIcon = (
   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
     <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.029m2.25-7.177-.02-.029m2.25 7.177-.02-.029m0 3.004v3m-4.25 2.147L7.425 21L3 17.525m12.75-15l-.35.35A4.5 4.5 0 0 1 19.5 7.5V12m-8.25-6.75H12m-8.25 0H12m-3 2.25H12M12 18.75V21M4.5 11.25H12m-7.5 3.75H12m-9-6.42L3 16.5V4.5A2.25 2.25 0 0 1 5.25 2.25H9.568a2.25 2.25 0 0 1 1.59.659l2.182 2.182c.45.451.659 1.06.659 1.71V10.5M19.5 19.5h-.002m0 0v.002m0 .002h-.002v-.002ZM12 12.75h.002v.002H12v-.002Z" />
   </svg>
 );

const iconByCategory: { [key: string]: React.ReactNode } = {
  Medicamentos: MedicationIcon,
  Alimentos: FoodIcon,
  Insumos: SupplyIcon,
  Vacunas: VaccineIcon,
};

export default function InventarioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;
  const totalPages = Math.ceil(products.length / itemsPerPage);

  React.useEffect(() => {
    const fetchProducts = async () => {
      try {
        const firestoreProducts = await getInventoryItems();
        // Adaptar los datos para incluir el icono
        const adapted = firestoreProducts.map((item) => ({
          ...item,
          image: iconByCategory[item.category] || MedicationIcon,
        }));
        setProducts(adapted);
      } catch (err) {
        setError('Error al cargar inventario');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  const displayedStart = startIndex + 1;
  const displayedEnd = Math.min(endIndex, products.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Barra lateral */}
      <Sidebar />

      {/* Área de contenido principal */}
      <div className="flex flex-col flex-1 bg-[#121212]">
         {/* Barra superior */}
        <Header title="Inventario" />

        <main className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">Inventario</h2>
          
          {/* Aquí podrían ir filtros o controles si son necesarios, no se ven explícitamente en la imagen de la tabla */}

          {/* Controles o botón para agregar producto */}
          <div className="flex justify-end mb-4">
             <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
                 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
               </svg>
               Agregar Producto
             </button>
           </div>

          {/* Tabla de inventario */}
          <div className="mb-6">
            {loading && <p className="text-gray-300">Cargando inventario...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && <InventoryTable products={currentProducts} />}
          </div>

           {/* Paginación */}
          <div className="flex items-center justify-between border-t border-gray-700 bg-[#1f2937] px-4 py-3 sm:px-6 rounded-lg shadow">
             <div className="flex-1 flex justify-between sm:hidden">
               {/* Mobile pagination */}
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600"
                >
                  Anterior
                </button>
                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                   disabled={currentPage >= totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600"
                >
                  Siguiente
                </button>
             </div>
             <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-300">
                    Mostrando <span className="font-medium">{displayedStart}</span> a <span className="font-medium">{displayedEnd}</span> de <span className="font-medium">{products.length}</span> productos
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    {/* Pagination numbers */}
                     {[...Array(totalPages)].map((_, i) => (
                       <button
                         key={i}
                         onClick={() => handlePageChange(i + 1)}
                         className={`relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium ${currentPage === i + 1 ? 'z-10 bg-blue-700 border-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'}`}
                       >
                         {i + 1}
                       </button>
                     ))}
                  </nav>
                </div>
             </div>
          </div>

        </main>
      </div>
    </div>
  );
} 