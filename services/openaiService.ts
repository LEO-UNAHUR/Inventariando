/**
 * Servicio para integración con OpenAI API
 * El usuario proporciona su propia API key (guardada encriptada localmente)
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface OpenAIResponse {
  choices: Array<{
    message: ChatMessage;
    finish_reason: string;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Obtener sugerencias de IA desde OpenAI ChatGPT
 * @param apiKey API key del usuario (obtenida desde UserSettings)
 * @param prompt Prompt del usuario
 * @param context Contexto adicional (productos, etc)
 */
export const getOpenAISuggestion = async (
  apiKey: string,
  prompt: string,
  context?: string
): Promise<string> => {
  try {
    if (!apiKey || !apiKey.startsWith('sk-')) {
      throw new Error('API key de OpenAI inválida');
    }

    const systemPrompt = context
      ? `Eres un asistente de negocio especializado en gestión de inventarios y ventas. ${context}`
      : 'Eres un asistente de negocio especializado en gestión de inventarios y ventas.';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en OpenAI API');
    }

    const data: OpenAIResponse = await response.json();
    return data.choices[0]?.message?.content || 'Sin respuesta';
  } catch (error) {
    console.error('Error en OpenAI:', error);
    throw error;
  }
};

/**
 * Validar que la API key de OpenAI es válida
 */
export const validateOpenAIKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default {
  getOpenAISuggestion,
  validateOpenAIKey,
};
