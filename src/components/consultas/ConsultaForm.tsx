'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Patient, ConsultaFormData, InventoryItem } from '@/types';
import { AITextarea } from '@/components/ui/ai-textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { getInventoryItems } from '@/lib/firestore';
import { ProductDetailsModal } from '@/components/ProductDetailsModal';
import { Eye } from 'lucide-react';

const formSchema = z.object({
  motivo: z.string().min(1, 'El motivo es requerido'),
  sintomas: z.string().min(1, 'Los síntomas son requeridos'),
  diagnostico: z.string().min(1, 'El diagnóstico es requerido'),
  tratamiento: z.string().min(1, 'El tratamiento es requerido'),
  proximaCita: z.string().optional(),
});

interface ConsultaFormProps {
  mascota: Patient | null;
  onConsultaCreated: (data: ConsultaFormData) => void;
}

export function ConsultaForm({ mascota, onConsultaCreated }: ConsultaFormProps) {
  const [showProximaCita, setShowProximaCita] = useState(false);

  // Inventario
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ id: string; quantity: number }[]>([]);
  const [consultaCost, setConsultaCost] = useState<number>(0);
  const [modalProduct, setModalProduct] = useState<InventoryItem | null>(null);
  const [cantidadWarning, setCantidadWarning] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    getInventoryItems().then(setInventory);
  }, []);

  // Calcular totales
  const selectedProducts = selectedItems
    .map(sel => {
      const prod = inventory.find(p => p.id === sel.id);
      return prod ? { ...prod, quantityUsed: sel.quantity } : null;
    })
    .filter(Boolean) as (InventoryItem & { quantityUsed: number })[];

  const totalArticulos = selectedProducts.reduce((acc, item) => acc + (item.price * item.quantityUsed), 0);
  const totalConsulta = consultaCost + totalArticulos;

  // Manejo de selección y cantidad
  const handleToggleProduct = (id: string) => {
    if (selectedItems.some(item => item.id === id)) {
      setSelectedItems(selectedItems.filter(item => item.id !== id));
    } else {
      setSelectedItems([...selectedItems, { id, quantity: 1 }]);
    }
  };
  const handleRemoveProduct = (id: string) => {
    setSelectedItems(selectedItems.filter(item => item.id !== id));
  };
  const handleChangeQuantity = (id: string, quantity: number) => {
    const product = inventory.find(p => p.id === id);
    if (!product) return;
    let newQuantity = Math.max(1, quantity);
    let warning = false;
    if (newQuantity > product.quantity) {
      newQuantity = product.quantity;
      warning = true;
    }
    setCantidadWarning(prev => ({ ...prev, [id]: warning }));
    setSelectedItems(selectedItems.map(item => item.id === id ? { ...item, quantity: newQuantity } : item));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      motivo: '',
      sintomas: '',
      diagnostico: '',
      tratamiento: '',
      proximaCita: '',
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onConsultaCreated({
      ...values,
      articulosUsados: selectedProducts.map(item => ({ id: item.id, name: item.name, quantity: item.quantityUsed, price: item.price, stock: item.quantity })),
      costoConsulta: consultaCost,
      totalConsulta,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4">
          {/* Datos de paciente y dueño */}
          {mascota ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel>Paciente</FormLabel>
                <Input value={mascota.nombre} disabled className="bg-muted" />
              </div>
              <div>
                <FormLabel>Dueño</FormLabel>
                <Input value={mascota.dueno?.nombre || ''} disabled className="bg-muted" />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <FormLabel>Paciente</FormLabel>
                <Input placeholder="Nombre del paciente" required />
              </div>
              <div>
                <FormLabel>Dueño</FormLabel>
                <Input placeholder="Nombre del dueño" required />
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="motivo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Motivo de la consulta</FormLabel>
                <FormControl>
                  <Input placeholder="Ingrese el motivo de la consulta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sintomas"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AITextarea
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describa los síntomas presentados"
                    label="Síntomas"
                    field="sintomas"
                    mascotaInfo={mascota ? {
                      nombre: mascota.nombre,
                      especie: mascota.especie,
                      raza: mascota.raza,
                      edad: mascota.edad,
                      peso: mascota.peso,
                      sexo: mascota.sexo,
                    } as any : undefined}
                    motivo={form.watch('motivo')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="diagnostico"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AITextarea
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Ingrese el diagnóstico"
                    label="Diagnóstico"
                    field="diagnostico"
                    mascotaInfo={mascota ? {
                      nombre: mascota.nombre,
                      especie: mascota.especie,
                      raza: mascota.raza,
                      edad: mascota.edad,
                      peso: mascota.peso,
                      sexo: mascota.sexo,
                    } as any : undefined}
                    motivo={form.watch('motivo')}
                    sintomas={form.watch('sintomas')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tratamiento"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <AITextarea
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Describa el tratamiento indicado"
                    label="Tratamiento"
                    field="tratamiento"
                    mascotaInfo={mascota ? {
                      nombre: mascota.nombre,
                      especie: mascota.especie,
                      raza: mascota.raza,
                      edad: mascota.edad,
                      peso: mascota.peso,
                      sexo: mascota.sexo,
                    } as any : undefined}
                    motivo={form.watch('motivo')}
                    sintomas={form.watch('sintomas')}
                    diagnostico={form.watch('diagnostico')}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center space-x-2">
            <Checkbox
              id="proximaCita"
              checked={showProximaCita}
              onCheckedChange={(checked) => setShowProximaCita(checked as boolean)}
            />
            <label
              htmlFor="proximaCita"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Programar próxima cita
            </label>
          </div>

          {showProximaCita && (
            <FormField
              control={form.control}
              name="proximaCita"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha de próxima cita</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Selección de artículos del inventario como cards */}
          <div>
            <FormLabel>Artículos del Inventario usados</FormLabel>
            <div className="max-h-64 overflow-auto border rounded-md p-2 bg-muted mb-2 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {inventory.map(product => {
                  const selected = selectedItems.some(item => item.id === product.id);
                  const selectedItem = selectedItems.find(item => item.id === product.id);
                  return (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-3 shadow-sm bg-white dark:bg-card cursor-pointer transition-all relative flex flex-col ${selected ? 'ring-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'}`}
                      onClick={() => handleToggleProduct(product.id)}
                    >
                      {product.image && (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-24 object-contain mb-2 rounded"
                        />
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold text-base truncate">{product.name}</div>
                        <button
                          type="button"
                          className="text-primary hover:underline ml-2"
                          onClick={e => { e.stopPropagation(); setModalProduct(product); }}
                          title="Ver detalles"
                        >
                          <Eye className="w-4 h-4 inline" />
                        </button>
                      </div>
                      <div className="text-xs text-muted-foreground mb-1">Categoría: {product.category}</div>
                      <div className="text-xs text-muted-foreground mb-1">Stock: {product.quantity}</div>
                      <div className="text-xs text-muted-foreground mb-1">Precio: ${product.price}</div>
                      {selected && (
                        <div className="mt-2 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <label className="text-xs" htmlFor={`cantidad-${product.id}`}>Cantidad:</label>
                            <input
                              id={`cantidad-${product.id}`}
                              type="number"
                              min={1}
                              max={product.quantity}
                              value={selectedItem?.quantity || 1}
                              onChange={e => { e.stopPropagation(); handleChangeQuantity(product.id, Number(e.target.value)); }}
                              className="w-16 border rounded px-1 py-0.5 text-center"
                              onClick={e => e.stopPropagation()}
                              aria-label="Cantidad"
                              title="Cantidad"
                            />
                          </div>
                          {cantidadWarning[product.id] && (
                            <span className="text-xs text-red-500">No puedes añadir más que el stock disponible.</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {selectedProducts.length > 0 && (
              <div className="border rounded-md p-2 bg-muted">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Artículo</th>
                      <th className="text-center">Cantidad</th>
                      <th className="text-center">Precio</th>
                      <th className="text-center">Subtotal</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedProducts.map(item => (
                      <tr key={item.id}>
                        <td>{item.name}</td>
                        <td className="text-center">{item.quantityUsed}</td>
                        <td className="text-center">${item.price}</td>
                        <td className="text-center">${item.price * item.quantityUsed}</td>
                        <td className="text-center">
                          <button type="button" onClick={() => handleRemoveProduct(item.id)} className="text-red-500 hover:underline">Quitar</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="text-right font-semibold mt-2">Total artículos: ${totalArticulos}</div>
              </div>
            )}
            {modalProduct && (
              <ProductDetailsModal
                isOpen={!!modalProduct}
                onClose={() => setModalProduct(null)}
                product={modalProduct}
              />
            )}
          </div>

          {/* Costo de la consulta */}
          <div>
            <FormLabel>Costo de la consulta</FormLabel>
            <Input
              type="number"
              min={0}
              value={consultaCost}
              onChange={e => setConsultaCost(Number(e.target.value))}
              placeholder="Costo de la consulta"
            />
          </div>

          {/* Total */}
          <div className="text-right text-lg font-bold">
            Total a cobrar: ${totalConsulta}
          </div>
        </div>

        <Button type="submit" className="w-full">
          Guardar Consulta
        </Button>
      </form>
    </Form>
  );
}

/* Estilos para la barra de scroll personalizada */
<style jsx global>{`
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    background: #222831;
    border-radius: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #666b7a;
    border-radius: 8px;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #666b7a #222831;
  }
`}</style> 