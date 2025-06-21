"use client";

import React, { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, 
  Check, 
  X, 
  Loader2, 
  Brain,
  AlertCircle,
  FileText
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { 
  getSintomasSuggestion, 
  getDiagnosticoSuggestion, 
  getTratamientoSuggestion,
  getObservacionesSuggestion,
  isAIAvailable,
  AISuggestionResponse 
} from '@/lib/ai-service';

interface AITextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  field: 'sintomas' | 'diagnostico' | 'tratamiento' | 'observaciones';
  mascotaInfo: {
    nombre: string;
    especie: string;
    raza: string;
    edad: number;
    peso?: number;
    sexo?: string;
  };
  motivo?: string;
  sintomas?: string;
  diagnostico?: string;
  className?: string;
  minHeight?: string;
}

export function AITextarea({
  value,
  onChange,
  placeholder,
  label,
  field,
  mascotaInfo,
  motivo,
  sintomas,
  diagnostico,
  className = "",
  minHeight = "min-h-[100px]"
}: AITextareaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestionResponse | null>(null);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const { toast } = useToast();

  const handleAcceptSuggestion = () => {
    if (suggestion) {
      onChange(suggestion.suggestion);
      setShowSuggestion(false);
      setSuggestion(null);
      
      toast({
        title: "Campo actualizado",
        description: "El campo ha sido rellenado con la sugerencia de IA",
      });
    }
  };

  const handleRejectSuggestion = () => {
    setShowSuggestion(false);
    setSuggestion(null);
  };

  const handleGetSuggestion = async () => {
    if (!isAIAvailable()) {
      // Modo demostración cuando la IA no está disponible
      setIsLoading(true);
      setTimeout(() => {
        const demoSuggestions = {
          sintomas: {
            suggestion: "• Cambios en el apetito y consumo de agua\n• Alteraciones en el comportamiento y nivel de actividad\n• Signos de dolor o malestar (postura, vocalización)\n• Cambios en el pelaje, piel o mucosas\n• Problemas respiratorios o tos\n• Alteraciones gastrointestinales\n• Cambios en el peso corporal",
            confidence: 0.85,
            reasoning: "Síntomas comunes que deberían evaluarse en esta especie y edad"
          },
          diagnostico: {
            suggestion: "Gastritis aguda con posible componente infeccioso. Considerar también enteritis por cambios en la dieta o ingesta de sustancias inapropiadas.",
            confidence: 0.80,
            reasoning: "Basado en los síntomas descritos y características de la raza"
          },
          tratamiento: {
            suggestion: "• Metronidazol 15mg/kg cada 12h por 5 días\n• Omeprazol 1mg/kg cada 24h por 3 días\n• Dieta blanda por 48h, luego transición gradual\n• Control de hidratación\n• Seguimiento en 48h",
            confidence: 0.90,
            reasoning: "Tratamiento estándar considerando la edad y peso del paciente"
          },
          observaciones: {
            suggestion: "Paciente requiere monitoreo especial por edad. Considerar predisposiciones de la raza. Mantener registro de cambios en comportamiento. Programar controles preventivos regulares.",
            confidence: 0.75,
            reasoning: "Consideraciones específicas para esta raza y edad"
          }
        };

        const demoResponse = demoSuggestions[field as keyof typeof demoSuggestions];
        setSuggestion(demoResponse);
        setShowSuggestion(true);
        setIsLoading(false);

        toast({
          title: "Modo Demostración",
          description: "Esta es una sugerencia de ejemplo. Configura DeepSeek AI para obtener sugerencias reales.",
          duration: 6000
        });
      }, 1500);
      return;
    }

    setIsLoading(true);
    setSuggestion(null);
    setShowSuggestion(false);

    try {
      let aiResponse: AISuggestionResponse;

      switch (field) {
        case 'sintomas':
          aiResponse = await getSintomasSuggestion(value, mascotaInfo, motivo);
          break;
        case 'diagnostico':
          aiResponse = await getDiagnosticoSuggestion(value, mascotaInfo, sintomas || '', motivo);
          break;
        case 'tratamiento':
          aiResponse = await getTratamientoSuggestion(value, mascotaInfo, sintomas || '', diagnostico || '', motivo);
          break;
        case 'observaciones':
          aiResponse = await getObservacionesSuggestion(value, mascotaInfo);
          break;
        default:
          throw new Error('Campo no soportado');
      }

      setSuggestion(aiResponse);
      setShowSuggestion(true);

      toast({
        title: "Sugerencia generada",
        description: "La IA ha generado una sugerencia para rellenar el campo",
      });

    } catch (error) {
      console.error('Error al obtener sugerencia:', error);
      
      let errorMessage = "No se pudo obtener la sugerencia de IA";
      let errorTitle = "Error";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        // Personalizar títulos según el tipo de error
        if (errorMessage.includes('sin saldo')) {
          errorTitle = "Saldo insuficiente";
        } else if (errorMessage.includes('API key')) {
          errorTitle = "Configuración requerida";
        } else if (errorMessage.includes('Límite')) {
          errorTitle = "Límite excedido";
        }
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
        duration: 8000
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldIcon = () => {
    switch (field) {
      case 'sintomas':
        return <AlertCircle className="w-4 h-4" />;
      case 'diagnostico':
        return <Brain className="w-4 h-4" />;
      case 'tratamiento':
        return <Check className="w-4 h-4" />;
      case 'observaciones':
        return <FileText className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getFieldColor = () => {
    switch (field) {
      case 'sintomas':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'diagnostico':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'tratamiento':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'observaciones':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`${className} ${minHeight}`}
      />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleGetSuggestion}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? 'Generando...' : isAIAvailable() ? 'Mejorar con IA' : 'Modo Demo'}
        </Button>
      </div>

      {showSuggestion && suggestion && (
        <Card className={`border-2 border-dashed ${!isAIAvailable() ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-700' : 'border-blue-300 bg-blue-50 dark:bg-blue-950 dark:border-blue-700'}`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                {getFieldIcon()}
                {!isAIAvailable() ? 'Sugerencia de Ejemplo' : 'Sugerencia de IA'}
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${getFieldColor()}`}
                >
                  {!isAIAvailable() ? 'DEMO' : `${Math.round(suggestion.confidence * 100)}% confianza`}
                </Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              <p className="font-medium mb-2">Sugerencia:</p>
              <p className="whitespace-pre-wrap">{suggestion.suggestion}</p>
            </div>
            
            {suggestion.reasoning && (
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">Razonamiento:</p>
                <p>{suggestion.reasoning}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleAcceptSuggestion}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4 mr-2" />
                Aceptar
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={handleRejectSuggestion}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Rechazar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 