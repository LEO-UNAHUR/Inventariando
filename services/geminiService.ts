import { GoogleGenAI, Type } from "@google/genai";
import { Product } from "../types";

const apiKey = process.env.API_KEY || '';

const ai = new GoogleGenAI({ apiKey });

export const suggestProductDetails = async (productName: string) => {
  if (!apiKey) throw new Error("API Key faltante");

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Genera detalles para un producto de inventario en Argentina llamado "${productName}". Devuelve JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            description: { type: Type.STRING, description: "Breve descripción comercial para venta (máx 100 caracteres)" },
            category: { type: Type.STRING, description: "Categoría sugerida (ej: Almacén, Bebidas, Limpieza)" },
            suggestedPrice: { type: Type.NUMBER, description: "Precio estimado en Pesos Argentinos (ARS) actualizado a la inflación reciente." }
          },
          required: ["description", "category"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};

export const analyzeInventoryBusiness = async (products: Product[]) => {
  if (!apiKey) throw new Error("API Key faltante");

  const inventorySummary = products.map(p => 
    `${p.name} (${p.category}): Stock ${p.stock}, Precio AR$${p.price}`
  ).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Actúa como un experto consultor de negocios para PyMEs en Argentina. Analiza este inventario:\n\n${inventorySummary}\n\nProvee 3 consejos breves y accionables para mejorar la rentabilidad, rotación o mix de productos. Formato markdown simple.`,
      config: {
        systemInstruction: "Eres un asesor de negocios argentino. Usa lenguaje local profesional pero cercano. Enfócate en la economía inflacionaria y estacionalidad."
      }
    });

    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "No se pudo generar el análisis en este momento.";
  }
};