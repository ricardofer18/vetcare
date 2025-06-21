"use client";

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { InventoryItem } from '../lib/firestore';
import { Button } from './ui/button';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<InventoryItem, 'id'> | InventoryItem) => void;
  productToEdit?: InventoryItem | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, productToEdit }) => {
  const initialState = {
    name: '',
    description: '',
    category: 'Medicamentos',
    quantity: 0,
    minQuantity: 0,
    price: 0,
    unit: 'Unidad',
    supplier: '',
    lastRestock: new Date().toISOString().split('T')[0],
  };

  const [product, setProduct] = useState<Omit<InventoryItem, 'id'>>(initialState);

  useEffect(() => {
    if (productToEdit) {
      setProduct(productToEdit);
    } else {
      setProduct(initialState);
    }
  }, [productToEdit, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const isNumber = ['quantity', 'minQuantity', 'price'].includes(name);
    setProduct(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={productToEdit ? 'Editar Producto' : 'Agregar Producto'}>
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">Nombre</label>
            <input type="text" name="name" id="name" value={product.name} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">Categoría</label>
            <select name="category" id="category" value={product.category} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500">
              <option>Medicamentos</option>
              <option>Alimentos</option>
              <option>Insumos</option>
              <option>Vacunas</option>
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">Descripción</label>
          <textarea name="description" id="description" value={product.description} onChange={handleChange} rows={3} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-300">Stock Actual</label>
            <input type="number" name="quantity" id="quantity" value={product.quantity} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="minQuantity" className="block text-sm font-medium text-gray-300">Stock Mínimo</label>
            <input type="number" name="minQuantity" id="minQuantity" value={product.minQuantity} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"/>
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">Precio</label>
            <input type="number" name="price" id="price" value={product.price} onChange={handleChange} step="0.01" required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"/>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label htmlFor="supplier" className="block text-sm font-medium text-gray-300">Proveedor</label>
                <input type="text" name="supplier" id="supplier" value={product.supplier} onChange={handleChange} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"/>
            </div>
            <div>
                <label htmlFor="lastRestock" className="block text-sm font-medium text-gray-300">Última Reposición</label>
                <input type="date" name="lastRestock" id="lastRestock" value={product.lastRestock} onChange={handleChange} required className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md shadow-sm text-white focus:ring-blue-500 focus:border-blue-500"/>
            </div>
        </div>
        <div className="flex justify-end gap-4 pt-4 pb-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
          <Button type="submit">Guardar Producto</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal; 