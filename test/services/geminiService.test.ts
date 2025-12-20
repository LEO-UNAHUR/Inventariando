import { describe, it, expect, vi } from 'vitest';

describe('geminiService', () => {
  it('validateGeminiApiKey returns false for short keys', async () => {
    const { validateGeminiApiKey } = await import('../../services/geminiService');
    expect(validateGeminiApiKey('short')).toBe(false);
  });

  it('validateGeminiApiKey returns true for plausible key', async () => {
    const { validateGeminiApiKey } = await import('../../services/geminiService');
    expect(validateGeminiApiKey('a'.repeat(24))).toBe(true);
  });

  it('suggestProductDetails throws if no api key provided', async () => {
    const { suggestProductDetails } = await import('../../services/geminiService');
    await expect(suggestProductDetails('Yerba', {} as any)).rejects.toThrow();
  });

  it('suggestProductDetails returns parsed object when API responds (mocked)', async () => {
    // Mock the module used internally by geminiService before importing it
    vi.mock('@google/genai', () => {
      return {
        GoogleGenAI: function () {
          return {
            models: {
              generateContent: async () => ({
                text: JSON.stringify({ description: 'test', category: 'Almacen' }),
              }),
            },
          };
        },
        Type: { OBJECT: 'object', STRING: 'string', NUMBER: 'number', ARRAY: 'array' },
      };
    });

    const { suggestProductDetails } = await import('../../services/geminiService');
    const result = await suggestProductDetails('Yerba', { apiKey: 'a'.repeat(24) });
    expect(result).toHaveProperty('description');
    expect(result).toHaveProperty('category');
  });
});
