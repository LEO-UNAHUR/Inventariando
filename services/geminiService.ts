import { GoogleGenAI, Type } from '@google/genai';
import { Product, Sale, BusinessIntelligence } from '../types';

interface GeminiCredentials {
  apiKey?: string;
  accessToken?: string;
}

const buildClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const suggestProductDetails = async (
  productName: string,
  credentials: GeminiCredentials
) => {
  const keyToUse = credentials.apiKey;
  if (!keyToUse) throw new Error('API Key de Gemini faltante');

  const ai = buildClient(keyToUse);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Genera detalles para un producto de inventario en Argentina llamado "${productName}". Devuelve JSON.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.STRING,
              description: 'Breve descripción comercial para venta (máx 100 caracteres)',
            },
            category: {
              type: Type.STRING,
              description: 'Categoría sugerida (ej: Almacén, Bebidas, Limpieza)',
            },
            suggestedPrice: {
              type: Type.NUMBER,
              description:
                'Precio estimado en Pesos Argentinos (ARS) actualizado a la inflación reciente.',
            },
          },
          required: ['description', 'category'],
        },
      },
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error('Gemini Error:', error);
    throw error;
  }
};

export const analyzeInventoryBusiness = async (_products: Product[]) => {
  // Deprecated simple text analysis, keeping for backward compatibility if needed,
  // but the new app uses generateBusinessInsights
  return 'Por favor usa la nueva función de Inteligencia de Negocios.';
};

export const generateBusinessInsights = async (
  _products: Product[],
  _sales: Sale[]
): Promise<BusinessIntelligence> => {
  throw new Error('Deprecated: use generateBusinessInsightsWithKey');
};

export const generateBusinessInsightsWithKey = async (
  products: Product[],
  sales: Sale[],
  credentials: GeminiCredentials
): Promise<BusinessIntelligence> => {
  const keyToUse = credentials.apiKey;
  if (!keyToUse) throw new Error('API Key de Gemini faltante');

  const ai = buildClient(keyToUse);

  // 1. Pre-process data to save tokens and give context
  const now = Date.now();
  const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

  const recentSales = sales.filter((s) => s.date >= thirtyDaysAgo);

  const salesSummary = products
    .map((p) => {
      const qtySold = recentSales.reduce((acc, sale) => {
        const item = sale.items.find((i) => i.productId === p.id);
        return acc + (item ? item.quantity : 0);
      }, 0);
      return {
        name: p.name,
        category: p.category,
        stock: p.stock,
        soldLast30Days: qtySold,
      };
    })
    .filter((p) => p.stock > 0 || p.soldLast30Days > 0)
    .slice(0, 30); // Limit to top 30 active items to fit context

  const contextData = JSON.stringify(salesSummary);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Actúa como un experto consultor de retail y Supply Chain en Argentina.
      Analiza estos datos de ventas de los últimos 30 días y stock actual: ${contextData}.
      
      Genera un reporte de inteligencia de negocios con:
      1. Insights de mercado (considerando la economía argentina, inflación y estacionalidad actual).
      2. Predicciones de demanda para los próximos 30 días basadas en la rotación actual y estacionalidad.
      3. Recomendaciones de compra (Restock) inteligentes.
      `,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marketInsights: {
              type: Type.STRING,
              description:
                'Resumen breve (2 frases) sobre tendencias estacionales actuales en Argentina y consejos generales.',
            },
            predictions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  currentSales: { type: Type.NUMBER, description: 'Ventas reales ultimos 30 dias' },
                  predictedSales: {
                    type: Type.NUMBER,
                    description: 'Ventas estimadas proximos 30 dias',
                  },
                  trend: { type: Type.STRING, enum: ['UP', 'DOWN', 'STABLE'] },
                  confidence: { type: Type.NUMBER, description: 'Nivel de confianza 0-100' },
                },
                required: ['productName', 'currentSales', 'predictedSales', 'trend', 'confidence'],
              },
            },
            restockSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  productName: { type: Type.STRING },
                  suggestedQuantity: { type: Type.NUMBER },
                  reason: {
                    type: Type.STRING,
                    description: 'Por qué comprar esto (ej: alta rotación, estacionalidad)',
                  },
                  urgency: { type: Type.STRING, enum: ['HIGH', 'MEDIUM', 'LOW'] },
                },
                required: ['productName', 'suggestedQuantity', 'reason', 'urgency'],
              },
            },
          },
          required: ['marketInsights', 'predictions', 'restockSuggestions'],
        },
      },
    });

    if (!response.text) throw new Error('No response from AI');
    return JSON.parse(response.text) as BusinessIntelligence;
  } catch (error) {
    console.error('Gemini BI Error:', error);
    throw error;
  }
};

export const validateGeminiApiKey = async (apiKey: string): Promise<boolean> => {
  return !!apiKey && apiKey.length >= 20;
};
