"use client";

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { InventoryItem } from '@/lib/firestore';
import { Package, DollarSign, Calendar, AlertTriangle, CheckCircle, XCircle, MinusCircle } from 'lucide-react';

interface ProductDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: InventoryItem;
}

export function ProductDetailsModal({ isOpen, onClose, product }: ProductDetailsModalProps) {
  const getStatusColor = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'bg-destructive text-destructive-foreground';
    if (quantity < minQuantity) return 'bg-yellow-500 text-white';
    if (quantity === minQuantity) return 'bg-orange-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getStatusText = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return 'Sin Stock';
    if (quantity <= minQuantity) return 'Stock Bajo';
    return 'En Stock';
  };

  const getStatusIcon = (quantity: number, minQuantity: number) => {
    if (quantity === 0) return <XCircle className="w-4 h-4" />;
    if (quantity <= minQuantity) return <AlertTriangle className="w-4 h-4" />;
    return <CheckCircle className="w-4 h-4" />;
  };

  const getCategoryIcon = (category: string) => {
    const icons: { [key: string]: React.ReactNode } = {
      Medicamentos: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75l3 3m0 0l3-3m-3 3v7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
      ),
      Alimentos: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 21h5.25m-1.5-10.375v1.5m0 0V21m-8.25-6.75h1.5m-1.5 3h1.5m-1.5 3h1.5M3 21h9m-9 0V3m0 18h.375a4.873 4.873 0 0 0 4.875-4.875V12.75m6.75 6.75h.75m-.75 3H16.5m-.75-3V12.75m0 0H12.75m-3 0h.375a4.873 4.873 0 0 0 4.875-4.875V6.75m-3 0V3m0 3.75H9M15 21h3.75a4.873 4.873 0 0 0 4.875-4.875V12.75m0-9h-3m-6-1.5h.375a4.873 4.873 0 0 0 4.875-4.875V3" />
        </svg>
      ),
      Insumos: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 10.5h12M8.25 14.25h12M8.25 18H12M3 6.75H7.5a1.5 1.5 0 0 1 1.5 1.5v3.75m-9-3.75H4.5M3 10.5H7.5a1.5 1.5 0 0 1 1.5 1.5v3.75m-9-3.75H4.5M9 16.5v-6a3 3 0 0 0-3-3H3m0 0l3-3m-3 3l3 3" />
        </svg>
      ),
      Vacunas: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.029m2.25-7.177-.02-.029m2.25 7.177-.02-.029m0 3.004v3m-4.25 2.147L7.425 21L3 17.525m12.75-15l-.35.35A4.5 4.5 0 0 1 19.5 7.5V12m-8.25-6.75H12m-8.25 0H12m-3 2.25H12M12 18.75V21M4.5 11.25H12m-7.5 3.75H12m-9-6.42L3 16.5V4.5A2.25 2.25 0 0 1 5.25 2.25H9.568a2.25 2.25 0 0 1 1.59.659l2.182 2.182c.45.451.659 1.06.659 1.71V10.5M19.5 19.5h-.002m0 0v.002m0 .002h-.002v-.002ZM12 12.75h.002v.002H12v-.002Z" />
        </svg>
      ),
    };
    return icons[category] || icons.Medicamentos;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Detalles del Producto
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-120px)]">
          <div className="space-y-6 p-1">
            {/* Información Principal del Producto */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primary-foreground">
                    {getCategoryIcon(product.category)}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-card-foreground">{product.name}</h2>
                    <p className="text-muted-foreground">{product.category}</p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Stock Actual:</span>
                    </div>
                    <p className="font-medium text-lg text-card-foreground">{product.quantity} unidades</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MinusCircle className="w-4 h-4" />
                      <span>Stock Mínimo:</span>
                    </div>
                    <p className="font-medium text-lg text-card-foreground">{product.minQuantity} unidades</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>Precio:</span>
                    </div>
                    <p className="font-medium text-lg text-card-foreground">${product.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Estado:</span>
                    </div>
                    <Badge className={`${getStatusColor(product.quantity, product.minQuantity)} flex items-center gap-1`}>
                      {getStatusIcon(product.quantity, product.minQuantity)}
                      {getStatusText(product.quantity, product.minQuantity)}
                    </Badge>
                  </div>
                </div>
                
                {product.lastRestock && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Última Reposición:</span>
                    </div>
                    <p className="font-medium text-card-foreground">{product.lastRestock}</p>
                  </div>
                )}
                
                {product.description && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>Descripción:</span>
                    </div>
                    <p className="text-sm bg-muted p-3 rounded-md text-card-foreground">
                      {product.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Separator />

            {/* Información Adicional */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Información Adicional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Package className="w-4 h-4" />
                      <span>ID del Producto:</span>
                    </div>
                    <p className="font-mono text-sm bg-muted p-2 rounded text-card-foreground">
                      {product.id}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <DollarSign className="w-4 h-4" />
                      <span>Valor Total en Stock:</span>
                    </div>
                    <p className="font-medium text-lg text-card-foreground">
                      ${(product.quantity * product.price).toFixed(2)}
                    </p>
                  </div>
                </div>
                
                {product.quantity <= product.minQuantity && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                          Atención: Stock Bajo
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">
                          {product.quantity === 0 
                            ? 'Este producto está agotado. Se recomienda realizar una reposición urgente.'
                            : `Este producto tiene stock bajo (${product.quantity}/${product.minQuantity}). Se recomienda realizar una reposición.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 