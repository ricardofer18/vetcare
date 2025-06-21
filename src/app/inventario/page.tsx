"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import InventoryTable from '../../components/InventoryTable';
import ProductFormModal from '../../components/ProductFormModal';
import { ProductDetailsModal } from '../../components/ProductDetailsModal';
import { 
  getInventoryItems, 
  addInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem
} from '../../lib/firestore';
import { InventoryItem } from '@/types';
import { PlusCircle } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { DisabledButton } from '@/components/RoleGuard';
import { Header } from '@/components/Header';

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
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<InventoryItem | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<InventoryItem | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const firestoreProducts = await getInventoryItems();
      setProducts(firestoreProducts);
    } catch (err) {
      setError('Error al cargar inventario');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleOpenModal = (product: InventoryItem | null = null) => {
    setProductToEdit(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProductToEdit(null);
  };

  const handleViewProduct = (product: InventoryItem) => {
    setSelectedProduct(product);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleSaveProduct = async (productData: Omit<InventoryItem, 'id'> | InventoryItem) => {
    try {
      if ('id' in productData) {
        await updateInventoryItem(productData.id, productData);
      } else {
        await addInventoryItem(productData);
      }
      handleCloseModal();
      fetchProducts(); // Recargar productos
    } catch (error) {
      console.error("Failed to save product:", error);
      // Aquí podrías mostrar una notificación de error al usuario
    }
  };
  
  const handleDeleteProduct = async (productId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await deleteInventoryItem(productId);
        fetchProducts(); // Recargar productos
      } catch (error) {
        console.error("Failed to delete product:", error);
      }
    }
  };

  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  const displayedStart = products.length > 0 ? startIndex + 1 : 0;
  const displayedEnd = Math.min(endIndex, products.length);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <>
      <ProductFormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveProduct}
        productToEdit={productToEdit}
      />
      
      {selectedProduct && (
        <ProductDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={handleCloseDetailsModal}
          product={selectedProduct}
        />
      )}

      <div className="flex h-screen bg-background">
        <div className="flex flex-col flex-1">
          <div className="flex justify-between items-center p-3 sm:p-4 lg:p-6 border-b">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">Inventario</h2>
            <DisabledButton
              resource="inventario"
              action="create"
              onClick={() => handleOpenModal()}
              className="h-9 sm:h-11 px-3 sm:px-6 text-sm sm:text-base font-medium hover:scale-105 transition-all duration-200 cursor-pointer hover:shadow-lg"
              tooltip="Agregar nuevo producto al inventario"
            >
              <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
              <span className="hidden sm:inline">Agregar Producto</span>
              <span className="sm:hidden">Agregar</span>
            </DisabledButton>
          </div>

          <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto bg-background">
            <div className="mb-4 sm:mb-6">
              {loading && (
                <div className="flex justify-center items-center py-6 sm:py-8">
                  <LoadingSpinner size="md" variant="primary" />
                </div>
              )}
              {error && <p className="text-center text-destructive py-6 sm:py-8 text-sm sm:text-base">{error}</p>}
              {!loading && !error && (
                <InventoryTable 
                  products={currentProducts}
                  onEdit={handleOpenModal}
                  onDelete={handleDeleteProduct}
                  onView={handleViewProduct}
                />
              )}
            </div>

            {products.length > 0 && (
              <div className="flex items-center justify-between border-t border-border bg-card px-3 sm:px-4 py-2 sm:py-3 sm:px-6 rounded-lg shadow">
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Mostrando <span className="font-medium">{displayedStart}</span> a <span className="font-medium">{displayedEnd}</span> de <span className="font-medium">{products.length}</span> productos
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i}
                            onClick={() => handlePageChange(i + 1)}
                            className={`relative inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 border text-xs sm:text-sm font-medium ${
                              currentPage === i + 1 
                                ? 'z-10 bg-primary border-primary text-primary-foreground' 
                                : 'border-input text-foreground hover:bg-accent'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </nav>
                    </div>
                </div>
                {/* Paginación móvil */}
                <div className="flex-1 flex justify-between sm:hidden">
                  <button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="relative inline-flex items-center px-3 py-1.5 border border-input text-xs font-medium rounded-md text-foreground bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <span className="text-xs text-muted-foreground self-center">
                    {currentPage} de {totalPages}
                  </span>
                  <button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="relative inline-flex items-center px-3 py-1.5 border border-input text-xs font-medium rounded-md text-foreground bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
} 