/**
 * Servicio para integración con Anthropic Claude API
 * El usuario proporciona su propia API key (guardada encriptada localmente)
 */

// Interface kept for reference; removed unused `ClaudeMessage` to satisfy linter

interface ClaudeResponse {
  content: Array<{
    type: string;
    text: string;
  }>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  stop_reason?: string;
}

/**
 * Obtener sugerencias de IA desde Anthropic Claude
 * @param apiKey API key del usuario (obtenida desde UserSettings)
 * @param prompt Prompt del usuario
 * @param context Contexto adicional (productos, etc)
 */
export const getAnthropicSuggestion = async (
  apiKey: string,
  prompt: string,
  context?: string
): Promise<string> => {
  try {
    if (!apiKey || !apiKey.startsWith('sk-ant-')) {
      throw new Error('API key de Anthropic inválida (debe comenzar con sk-ant-)');
    }

    const systemPrompt = context
      ? `Eres un asistente de negocio especializado en gestión de inventarios y ventas. ${context}`
      : 'Eres un asistente de negocio especializado en gestión de inventarios y ventas.';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 1024,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Error en Anthropic API');
    }

      const data: ClaudeResponse = await response.json();
    return data.content[0]?.text || 'Sin respuesta';
  } catch (error) {
    console.error('Error en Anthropic:', error);
    throw error;
  }
};

/**
 * Validar que la API key de Anthropic es válida
 */
export const validateAnthropicKey = async (apiKey: string): Promise<boolean> => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export default {
  getAnthropicSuggestion,
  validateAnthropicKey,
};
