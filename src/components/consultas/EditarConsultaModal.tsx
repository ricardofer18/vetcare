"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { AITextarea } from "@/components/ui/ai-textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Consulta } from "@/types"
import { useToast } from "@/components/ui/use-toast"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { 
  Clock, 
  User, 
  PawPrint, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Pencil,
  FileText
} from "lucide-react"
import { DisabledButton } from "@/components/RoleGuard"

const editConsultaSchema = z.object({
  motivo: z.string().min(1, "El motivo es requerido"),
  sintomas: z.string().min(1, "Los síntomas son requeridos"),
  diagnostico: z.string().min(1, "El diagnóstico es requerido"),
  tratamiento: z.string().min(1, "El tratamiento es requerido"),
  estado: z.enum(["Pendiente", "Realizada"]),
  proximaCita: z.string().optional(),
})

type EditConsultaFormData = z.infer<typeof editConsultaSchema>

interface EditarConsultaModalProps {
  consulta: Consulta | null
  isOpen: boolean
  onClose: () => void
  onConsultaUpdated: () => void
}

export function EditarConsultaModal({ 
  consulta, 
  isOpen, 
  onClose, 
  onConsultaUpdated 
}: EditarConsultaModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<EditConsultaFormData>({
    resolver: zodResolver(editConsultaSchema),
    defaultValues: {
      motivo: "",
      sintomas: "",
      diagnostico: "",
      tratamiento: "",
      estado: "Pendiente",
      proximaCita: "",
    }
  })

  // Actualizar valores cuando cambia la consulta usando useEffect
  useEffect(() => {
    if (consulta && isOpen) {
      setValue("motivo", consulta.motivo)
      setValue("sintomas", consulta.sintomas)
      setValue("diagnostico", consulta.diagnostico)
      setValue("tratamiento", consulta.tratamiento)
      setValue("estado", consulta.estado)
      setValue("proximaCita", consulta.proximaCita ? 
        consulta.proximaCita.toISOString().split('T')[0] : "")
    }
  }, [consulta, isOpen, setValue])

  const onSubmit = async (data: EditConsultaFormData) => {
    if (!consulta) return

    setLoading(true)
    try {
      // Construir el path de la consulta
      const duenoId = consulta.mascota?.duenoId || consulta.mascota?.dueno?.id
      const mascotaId = consulta.mascotaId
      const consultaId = consulta.id

      if (!duenoId || !mascotaId) {
        throw new Error("No se pudo identificar el dueño o la mascota")
      }

      const consultaRef = doc(db, 'duenos', duenoId, 'mascotas', mascotaId, 'consultas', consultaId)

      const updateData: any = {
        motivo: data.motivo,
        sintomas: data.sintomas,
        diagnostico: data.diagnostico,
        tratamiento: data.tratamiento,
        estado: data.estado,
      }

      // Agregar próxima cita si se especificó
      if (data.proximaCita) {
        updateData.proximaCita = Timestamp.fromDate(new Date(data.proximaCita))
      } else {
        updateData.proximaCita = null
      }

      await updateDoc(consultaRef, updateData)

      toast({
        title: "Consulta actualizada",
        description: "La consulta ha sido actualizada exitosamente.",
      })

      onConsultaUpdated()
      onClose()
      reset()
    } catch (error) {
      console.error('Error al actualizar consulta:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar la consulta. Inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!consulta) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] bg-card border-border overflow-hidden">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Pencil className="h-5 w-5 text-primary" />
            Editar Consulta - {consulta.mascota?.nombre}
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información del paciente */}
            <div className="lg:col-span-1">
              <Card className="bg-muted/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <PawPrint className="h-4 w-4" />
                    Información del Paciente
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{consulta.mascota?.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {consulta.mascota?.especie} • {consulta.mascota?.raza}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">{consulta.mascota?.edad} años</p>
                      {consulta.mascota?.peso && (
                        <p className="text-sm text-muted-foreground">{consulta.mascota.peso} kg</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">
                        {consulta.mascota?.dueno?.nombre} {consulta.mascota?.dueno?.apellido}
                      </p>
                      <p className="text-sm text-muted-foreground">{consulta.mascota?.dueno?.telefono}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-foreground">
                        {consulta.fecha.toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <Badge variant={consulta.estado === 'Realizada' ? 'default' : 'secondary'}>
                        {consulta.estado === 'Realizada' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <AlertCircle className="h-3 w-3 mr-1" />
                        )}
                        {consulta.estado}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Formulario */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estado" className="text-foreground font-medium">Estado</Label>
                    <Select 
                      value={watch("estado")} 
                      onValueChange={(value) => setValue("estado", value as "Pendiente" | "Realizada")}
                    >
                      <SelectTrigger className="bg-background border-border">
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Realizada">Realizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proximaCita" className="text-foreground font-medium">Próxima Cita (opcional)</Label>
                    <Input
                      type="date"
                      {...register("proximaCita")}
                      className="bg-background border-border"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="motivo" className="text-foreground font-medium">Motivo de la Consulta</Label>
                  <Textarea
                    {...register("motivo")}
                    placeholder="Describe el motivo de la consulta"
                    className="bg-background border-border min-h-[80px] resize-none"
                  />
                  {errors.motivo && (
                    <p className="text-sm text-destructive">{errors.motivo.message}</p>
                  )}
                </div>

                <AITextarea
                  value={watch("sintomas")}
                  onChange={(value) => setValue("sintomas", value)}
                  placeholder="Describe los síntomas observados"
                  label="Síntomas"
                  field="sintomas"
                  mascotaInfo={consulta?.mascota ? {
                    nombre: consulta.mascota.nombre,
                    especie: consulta.mascota.especie,
                    raza: consulta.mascota.raza || '',
                    edad: typeof consulta.mascota.edad === 'string' ? parseInt(consulta.mascota.edad) : consulta.mascota.edad,
                    peso: consulta.mascota.peso,
                    sexo: consulta.mascota.sexo,
                  } : {
                    nombre: '',
                    especie: '',
                    raza: '',
                    edad: 0,
                  }}
                  motivo={watch("motivo")}
                  className="bg-background border-border"
                  minHeight="min-h-[80px]"
                />

                <AITextarea
                  value={watch("diagnostico")}
                  onChange={(value) => setValue("diagnostico", value)}
                  placeholder="Describe el diagnóstico"
                  label="Diagnóstico"
                  field="diagnostico"
                  mascotaInfo={consulta?.mascota ? {
                    nombre: consulta.mascota.nombre,
                    especie: consulta.mascota.especie,
                    raza: consulta.mascota.raza || '',
                    edad: typeof consulta.mascota.edad === 'string' ? parseInt(consulta.mascota.edad) : consulta.mascota.edad,
                    peso: consulta.mascota.peso,
                    sexo: consulta.mascota.sexo,
                  } : {
                    nombre: '',
                    especie: '',
                    raza: '',
                    edad: 0,
                  }}
                  motivo={watch("motivo")}
                  sintomas={watch("sintomas")}
                  className="bg-background border-border"
                  minHeight="min-h-[80px]"
                />

                <AITextarea
                  value={watch("tratamiento")}
                  onChange={(value) => setValue("tratamiento", value)}
                  placeholder="Describe el tratamiento prescrito"
                  label="Tratamiento"
                  field="tratamiento"
                  mascotaInfo={consulta?.mascota ? {
                    nombre: consulta.mascota.nombre,
                    especie: consulta.mascota.especie,
                    raza: consulta.mascota.raza || '',
                    edad: typeof consulta.mascota.edad === 'string' ? parseInt(consulta.mascota.edad) : consulta.mascota.edad,
                    peso: consulta.mascota.peso,
                    sexo: consulta.mascota.sexo,
                  } : {
                    nombre: '',
                    especie: '',
                    raza: '',
                    edad: 0,
                  }}
                  motivo={watch("motivo")}
                  sintomas={watch("sintomas")}
                  diagnostico={watch("diagnostico")}
                  className="bg-background border-border"
                  minHeight="min-h-[80px]"
                />
              </form>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border flex-shrink-0">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <DisabledButton 
            resource="consultas"
            action="update"
            onClick={handleSubmit(onSubmit)}
            disabled={loading}
            className="bg-primary hover:bg-primary/90"
            tooltip="Actualizar consulta"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" variant="white" className="mr-2" />
                Actualizando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Actualizar Consulta
              </>
            )}
          </DisabledButton>
        </div>
      </DialogContent>
    </Dialog>
  )
} 