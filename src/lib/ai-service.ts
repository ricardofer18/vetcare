const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;

export interface AISuggestionRequest {
  field: 'sintomas' | 'diagnostico' | 'tratamiento' | 'observaciones';
  currentText: string;
  mascotaInfo: {
    nombre: string;
    especie: string;
    raza: string;
    edad: number;
    peso?: number;
    sexo?: string;
  };
  motivo?: string;
}

export interface AISuggestionResponse {
  suggestion: string;
  confidence: number;
  reasoning: string;
}

// Función para obtener sugerencias de IA para síntomas
export async function getSintomasSuggestion(
  currentText: string,
  mascotaInfo: AISuggestionRequest['mascotaInfo'],
  motivo?: string
): Promise<AISuggestionResponse> {
  const prompt = `Eres un veterinario experto. Basándote en la siguiente información, genera una lista específica de síntomas que deberían evaluarse:

MASCOTA:
- Nombre: ${mascotaInfo.nombre}
- Especie: ${mascotaInfo.especie}
- Raza: ${mascotaInfo.raza}
- Edad: ${mascotaInfo.edad} años
- Peso: ${mascotaInfo.peso || 'No especificado'} kg
- Sexo: ${mascotaInfo.sexo || 'No especificado'}

MOTIVO DE CONSULTA: ${motivo || 'No especificado'}

SÍNTOMAS ACTUALES: ${currentText || 'Ninguno registrado'}

Genera una lista específica de síntomas que deberían evaluarse para este caso. Considera:
- Síntomas relacionados con el motivo de consulta
- Síntomas comunes para esta especie y raza
- Síntomas por edad y peso
- Síntomas que requieren atención inmediata

Responde solo con la lista de síntomas, sin explicaciones adicionales.`;

  return await callDeepSeekAPI(prompt);
}

// Función para obtener sugerencias de IA para diagnóstico
export async function getDiagnosticoSuggestion(
  currentText: string,
  mascotaInfo: AISuggestionRequest['mascotaInfo'],
  sintomas: string,
  motivo?: string
): Promise<AISuggestionResponse> {
  const prompt = `Eres un veterinario experto. Basándote en la siguiente información, genera un diagnóstico específico:

MASCOTA:
- Nombre: ${mascotaInfo.nombre}
- Especie: ${mascotaInfo.especie}
- Raza: ${mascotaInfo.raza}
- Edad: ${mascotaInfo.edad} años
- Peso: ${mascotaInfo.peso || 'No especificado'} kg
- Sexo: ${mascotaInfo.sexo || 'No especificado'}

MOTIVO DE CONSULTA: ${motivo || 'No especificado'}
SÍNTOMAS: ${sintomas || 'No especificados'}
DIAGNÓSTICO ACTUAL: ${currentText || 'Ninguno registrado'}

Genera un diagnóstico específico basado en los síntomas y características del paciente. Considera:
- Diagnósticos más probables para esta especie y raza
- Condiciones relacionadas con la edad
- Urgencias que requieren atención inmediata

Responde solo con el diagnóstico, sin explicaciones adicionales.`;

  return await callDeepSeekAPI(prompt);
}

// Función para obtener sugerencias de IA para tratamiento
export async function getTratamientoSuggestion(
  currentText: string,
  mascotaInfo: AISuggestionRequest['mascotaInfo'],
  sintomas: string,
  diagnostico: string,
  motivo?: string
): Promise<AISuggestionResponse> {
  const prompt = `Eres un veterinario experto. Basándote en la siguiente información, genera un plan de tratamiento específico:

MASCOTA:
- Nombre: ${mascotaInfo.nombre}
- Especie: ${mascotaInfo.especie}
- Raza: ${mascotaInfo.raza}
- Edad: ${mascotaInfo.edad} años
- Peso: ${mascotaInfo.peso || 'No especificado'} kg
- Sexo: ${mascotaInfo.sexo || 'No especificado'}

MOTIVO DE CONSULTA: ${motivo || 'No especificado'}
SÍNTOMAS: ${sintomas || 'No especificados'}
DIAGNÓSTICO: ${diagnostico || 'No especificado'}
TRATAMIENTO ACTUAL: ${currentText || 'Ninguno registrado'}

Genera un plan de tratamiento específico que incluya:
- Medicación específica con dosificación
- Cuidados en casa
- Seguimiento y controles
- Recomendaciones dietéticas si aplica

Responde solo con el plan de tratamiento, sin explicaciones adicionales.`;

  return await callDeepSeekAPI(prompt);
}

// Función para obtener sugerencias de IA para observaciones de pacientes
export async function getObservacionesSuggestion(
  currentText: string,
  mascotaInfo: AISuggestionRequest['mascotaInfo']
): Promise<AISuggestionResponse> {
  const prompt = `Eres un veterinario experto. Basándote en la siguiente información del paciente, genera observaciones específicas:

MASCOTA:
- Nombre: ${mascotaInfo.nombre}
- Especie: ${mascotaInfo.especie}
- Raza: ${mascotaInfo.raza}
- Edad: ${mascotaInfo.edad} años
- Peso: ${mascotaInfo.peso || 'No especificado'} kg
- Sexo: ${mascotaInfo.sexo || 'No especificado'}

OBSERVACIONES ACTUALES: ${currentText || 'Ninguna registrada'}

Genera observaciones específicas que incluyan:
- Características específicas de la raza y especie
- Consideraciones por edad y peso
- Recomendaciones de cuidado preventivo
- Notas importantes para futuras consultas

Responde solo con las observaciones, sin explicaciones adicionales.`;

  return await callDeepSeekAPI(prompt);
}

// Función para obtener sugerencias de IA para descripciones de productos
export async function getProductDescriptionSuggestion(
  currentText: string,
  productInfo: {
    name: string;
    category: string;
    price?: number;
    supplier?: string;
  }
): Promise<AISuggestionResponse> {
  const prompt = `Eres un veterinario experto en inventario y productos veterinarios. Basándote en la siguiente información del producto, genera una descripción profesional y detallada:

PRODUCTO:
- Nombre: ${productInfo.name}
- Categoría: ${productInfo.category}
- Precio: ${productInfo.price ? `$${productInfo.price}` : 'No especificado'}
- Proveedor: ${productInfo.supplier || 'No especificado'}

DESCRIPCIÓN ACTUAL: ${currentText || 'Ninguna registrada'}

Genera una descripción profesional que incluya:
- Composición o ingredientes principales (si aplica)
- Indicaciones y usos veterinarios
- Forma de administración o aplicación
- Precauciones y contraindicaciones
- Almacenamiento y conservación
- Información adicional relevante para el personal veterinario

La descripción debe ser técnica pero comprensible, específica para productos veterinarios de la categoría ${productInfo.category}.

Responde solo con la descripción, sin explicaciones adicionales.`;

  return await callDeepSeekAPI(prompt);
}

// Función principal para llamar a la API de DeepSeek
async function callDeepSeekAPI(prompt: string): Promise<AISuggestionResponse> {
  if (!DEEPSEEK_API_KEY) {
    throw new Error('API key de DeepSeek no configurada');
  }

  try {
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Eres un veterinario experto que proporciona sugerencias médicas precisas y útiles. Responde siempre de forma natural, profesional y clara, sin usar formato JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      let errorMessage = `Error en la API: ${response.status} ${response.statusText}`;
      
      // Manejar errores específicos
      switch (response.status) {
        case 401:
          errorMessage = 'API key inválida o no autorizada';
          break;
        case 402:
          errorMessage = 'Cuenta sin saldo. Necesitas agregar créditos a tu cuenta de DeepSeek';
          break;
        case 403:
          errorMessage = 'Acceso denegado. Verifica los permisos de tu API key';
          break;
        case 429:
          errorMessage = 'Límite de solicitudes excedido. Intenta más tarde';
          break;
        case 500:
          errorMessage = 'Error interno del servidor de DeepSeek';
          break;
        default:
          errorMessage = `Error ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No se recibió respuesta de la API');
    }

    // Procesar respuesta de texto natural
    const cleanContent = content.trim();
    
    // Generar una sugerencia coherente basada en el contenido
    return {
      suggestion: cleanContent,
      confidence: 0.85, // Confianza estándar para respuestas de IA
      reasoning: 'Sugerencia generada por IA basada en la información proporcionada y experiencia veterinaria.'
    };
    
  } catch (error) {
    console.error('Error al llamar a DeepSeek API:', error);
    
    // Re-lanzar el error con mensaje más específico
    if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('No se pudo obtener sugerencia de IA');
    }
  }
}

// Función de utilidad para validar si la API está disponible
export function isAIAvailable(): boolean {
  return !!DEEPSEEK_API_KEY;
} 