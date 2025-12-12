import React, { useState } from 'react';
import { Product } from '../types';
import { analyzeInventoryBusiness } from '../services/geminiService';
import { BrainCircuit, Loader2, RefreshCw, Lightbulb, Sun, Moon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  products: Product[];
  isDark: boolean;
  onToggleTheme: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products, isDark, onToggleTheme }) => {
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeInventoryBusiness(products);
      setAnalysis(result);
    } catch (e) {
      setAnalysis("Error al consultar la IA. Por favor intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto p-4 pb-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="mb-6 flex justify-between items-start">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BrainCircuit className="text-purple-600 dark:text-purple-400" />
              Asistente IA
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Consejos inteligentes para tu negocio</p>
        </div>
        <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="space-y-6">
        {/* Intro Card */}
        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
          <h2 className="text-lg font-bold mb-2">Análisis de Stock</h2>
          <p className="text-purple-100 text-sm mb-4">
            Gemini puede analizar tu inventario actual para detectar oportunidades, productos con baja rotación o sugerir mejoras de precios basadas en el contexto argentino.
          </p>
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full bg-white text-purple-700 font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
            {analysis ? 'Actualizar Análisis' : 'Generar Análisis'}
          </button>
        </div>

        {/* Results */}
        {analysis && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 animate-fade-in transition-colors">
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
              <Lightbulb className="text-amber-500" />
              <h3 className="font-bold text-slate-800 dark:text-slate-100">Sugerencias:</h3>
            </div>
            <div className="prose prose-slate dark:prose-invert prose-sm max-w-none prose-p:text-slate-600 dark:prose-p:text-slate-300 prose-headings:text-slate-800 dark:prose-headings:text-slate-100">
              <ReactMarkdown>{analysis}</ReactMarkdown>
            </div>
          </div>
        )}

        {/* Empty State / Tip */}
        {!analysis && !loading && (
          <div className="text-center p-8 text-slate-400 dark:text-slate-600">
            <p className="text-sm">Presiona el botón para recibir 3 consejos clave para tu negocio hoy.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssistant;