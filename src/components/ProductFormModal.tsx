"use client";

import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { InventoryItem } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const isNumber = ['quantity', 'minQuantity', 'price'].includes(name);
    setProduct(prev => ({ ...prev, [name]: isNumber ? Number(value) : value }));
  };

  const handleCategoryChange = (value: string) => {
    setProduct(prev => ({ ...prev, category: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(product);
  };

  const categories = ['Medicamentos', 'Alimentos', 'Insumos', 'Vacunas'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={productToEdit ? 'Editar Producto' : 'Agregar Producto'}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-sm font-medium">Nombre</Label>
            <Input
              type="text"
              name="name"
              id="name"
              value={product.name}
              onChange={handleChange}
              required
              placeholder="Nombre del producto"
              className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="category" className="text-sm font-medium">Categoría</Label>
            <Select value={product.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="hover:border-primary/50 focus:border-primary transition-colors duration-200">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category} className="cursor-pointer hover:bg-accent">
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="description" className="text-sm font-medium">Descripción</Label>
          <Textarea
            name="description"
            id="description"
            value={product.description}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción del producto"
            className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <Label htmlFor="quantity" className="text-sm font-medium">Stock Actual</Label>
            <Input
              type="number"
              name="quantity"
              id="quantity"
              value={product.quantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="minQuantity" className="text-sm font-medium">Stock Mínimo</Label>
            <Input
              type="number"
              name="minQuantity"
              id="minQuantity"
              value={product.minQuantity}
              onChange={handleChange}
              required
              min="0"
              placeholder="0"
              className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="price" className="text-sm font-medium">Precio</Label>
            <Input
              type="number"
              name="price"
              id="price"
              value={product.price}
              onChange={handleChange}
              step="0.01"
              required
              min="0"
              placeholder="0.00"
              className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="supplier" className="text-sm font-medium">Proveedor</Label>
            <Input
              type="text"
              name="supplier"
              id="supplier"
              value={product.supplier}
              onChange={handleChange}
              placeholder="Nombre del proveedor"
              className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="lastRestock" className="text-sm font-medium">Última Reposición</Label>
            <Input
              type="date"
              name="lastRestock"
              id="lastRestock"
              value={product.lastRestock}
              onChange={handleChange}
              required
              className="hover:border-primary/50 focus:border-primary transition-colors duration-200"
            />
          </div>
        </div>
        
        <div className="flex justify-end gap-4 pt-6 border-t border-border">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="hover:bg-accent hover:text-accent-foreground transition-colors duration-200 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="hover:scale-105 transition-transform duration-200 cursor-pointer"
          >
            {productToEdit ? 'Actualizar Producto' : 'Guardar Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductFormModal; 