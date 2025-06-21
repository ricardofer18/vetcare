"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Consulta } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Clock } from "lucide-react"

interface DetalleConsultaModalProps {
  consulta: Consulta | null
  isOpen: boolean
  onClose: () => void
}

export function DetalleConsultaModal({ consulta, isOpen, onClose }: DetalleConsultaModalProps) {
  if (!consulta) return null

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gray-800 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white">
            Detalle de Consulta - {consulta.mascota?.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="space-y-6 pr-4">
            {/* Información del paciente y dueño */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Información del Paciente</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Nombre:</span>
                    <p className="text-white">{consulta.mascota?.nombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Especie:</span>
                    <p className="text-white">{consulta.mascota?.especie}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Raza:</span>
                    <p className="text-white">{consulta.mascota?.raza}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Edad:</span>
                    <p className="text-white">{consulta.mascota?.edad} años</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-3">Información del Dueño</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Nombre:</span>
                    <p className="text-white">{consulta.mascota?.dueno?.nombre}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">RUT:</span>
                    <p className="text-white">{consulta.mascota?.dueno?.rut}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Teléfono:</span>
                    <p className="text-white">{consulta.mascota?.dueno?.telefono}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Email:</span>
                    <p className="text-white">{consulta.mascota?.dueno?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de la consulta */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Detalles de la Consulta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-400 text-sm">Fecha:</span>
                  <p className="text-white">{formatDate(consulta.fecha)}</p>
                </div>
                {consulta.veterinario && (
                  <div>
                    <span className="text-gray-400 text-sm">Veterinario:</span>
                    <p className="text-white">{consulta.veterinario.nombre}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-gray-400 font-medium">Motivo de la Consulta:</span>
                  <p className="text-white mt-1 bg-gray-600 p-3 rounded">{consulta.motivo}</p>
                </div>
                
                <div>
                  <span className="text-gray-400 font-medium">Síntomas:</span>
                  <p className="text-white mt-1 bg-gray-600 p-3 rounded">{consulta.sintomas}</p>
                </div>
                
                <div>
                  <span className="text-gray-400 font-medium">Diagnóstico:</span>
                  <p className="text-white mt-1 bg-gray-600 p-3 rounded">{consulta.diagnostico}</p>
                </div>
                
                <div>
                  <span className="text-gray-400 font-medium">Tratamiento:</span>
                  <p className="text-white mt-1 bg-gray-600 p-3 rounded">{consulta.tratamiento}</p>
                </div>
                
                {consulta.proximaCita && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">
                      Próxima cita: {formatDate(consulta.proximaCita)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="flex justify-end pt-4">
          <Button onClick={onClose} variant="outline" className="border-gray-600 text-gray-300">
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 