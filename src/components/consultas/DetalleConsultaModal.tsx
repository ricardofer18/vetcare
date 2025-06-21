"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Consulta } from "@/types"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Clock, Pencil } from "lucide-react"
import { DisabledButton } from "@/components/RoleGuard"

interface DetalleConsultaModalProps {
  consulta: Consulta | null
  isOpen: boolean
  onClose: () => void
  onEdit?: () => void
}

export function DetalleConsultaModal({ consulta, isOpen, onClose, onEdit }: DetalleConsultaModalProps) {
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
      <DialogContent className="max-w-4xl max-h-[90vh] bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            Detalle de Consulta - {consulta.mascota?.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[calc(90vh-140px)]">
          <div className="space-y-6 pr-4">
            {/* Información del paciente y dueño */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Información del Paciente</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <p className="text-foreground">{consulta.mascota?.nombre}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Especie:</span>
                    <p className="text-foreground">{consulta.mascota?.especie}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Raza:</span>
                    <p className="text-foreground">{consulta.mascota?.raza}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Edad:</span>
                    <p className="text-foreground">{consulta.mascota?.edad} años</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded-lg p-4">
                <h3 className="text-lg font-semibold text-foreground mb-3">Información del Dueño</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nombre:</span>
                    <p className="text-foreground">{consulta.mascota?.dueno?.nombre}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">RUT:</span>
                    <p className="text-foreground">{consulta.mascota?.dueno?.rut}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Teléfono:</span>
                    <p className="text-foreground">{consulta.mascota?.dueno?.telefono}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Email:</span>
                    <p className="text-foreground">{consulta.mascota?.dueno?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles de la consulta */}
            <div className="bg-muted rounded-lg p-4">
              <h3 className="text-lg font-semibold text-foreground mb-3">Detalles de la Consulta</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-muted-foreground text-sm">Fecha:</span>
                  <p className="text-foreground">{formatDate(consulta.fecha)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-sm">Estado:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${
                      consulta.estado === 'Realizada' ? 'bg-green-500' : 'bg-orange-500'
                    }`}></div>
                    <span className={`font-medium ${
                      consulta.estado === 'Realizada' ? 'text-green-600' : 'text-orange-600'
                    }`}>
                      {consulta.estado}
                    </span>
                  </div>
                </div>
                {consulta.veterinario && (
                  <div>
                    <span className="text-muted-foreground text-sm">Veterinario:</span>
                    <p className="text-foreground">{consulta.veterinario.nombre}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <span className="text-muted-foreground font-medium">Motivo de la Consulta:</span>
                  <p className="text-foreground mt-1 bg-background p-3 rounded border border-border">{consulta.motivo}</p>
                </div>
                
                <div>
                  <span className="text-muted-foreground font-medium">Síntomas:</span>
                  <p className="text-foreground mt-1 bg-background p-3 rounded border border-border">{consulta.sintomas}</p>
                </div>
                
                <div>
                  <span className="text-muted-foreground font-medium">Diagnóstico:</span>
                  <p className="text-foreground mt-1 bg-background p-3 rounded border border-border">{consulta.diagnostico}</p>
                </div>
                
                <div>
                  <span className="text-muted-foreground font-medium">Tratamiento:</span>
                  <p className="text-foreground mt-1 bg-background p-3 rounded border border-border">{consulta.tratamiento}</p>
                </div>
                
                {consulta.proximaCita && (
                  <div className="flex items-center space-x-2 text-primary">
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
        
        <div className="flex justify-end gap-3 pt-4">
          <Button onClick={onClose} variant="outline">
            Cerrar
          </Button>
          {onEdit && (
            <DisabledButton
              resource="consultas"
              action="update"
              tooltip="Editar detalles de la consulta"
              onClick={onEdit}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DisabledButton>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 