
import React, { useState, useEffect } from 'react';
import { Product, Sale, BusinessIntelligence, User, IAProvider } from '../types';
import { generateBusinessInsights } from '../services/geminiService';
import { getOpenAISuggestion } from '../services/openaiService';
import { getAnthropicSuggestion } from '../services/anthropicService';
import { getStoredSales } from '../services/storageService';
import { getUserSettings, decryptCredential } from '../services/userSettingsService';
import { BrainCircuit, Loader2, RefreshCw, Lightbulb, Sun, Moon, TrendingUp, TrendingDown, Minus, ShoppingCart, AlertTriangle, ArrowRight, Settings } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface AIAssistantProps {
  products: Product[];
  isDark: boolean;
  onToggleTheme: () => void;
  currentUser?: User;
  onOpenSettings?: () => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ products, isDark, onToggleTheme, currentUser, onOpenSettings }) => {
  const [data, setData] = useState<BusinessIntelligence | null>(null);
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<IAProvider>(IAProvider.GEMINI);
  const [providerReady, setProviderReady] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar preferencia de proveedor IA del usuario
  useEffect(() => {
    if (currentUser) {
      const settings = getUserSettings(currentUser.id);
      setProvider(settings.iaProvider);

      // Verificar que el proveedor esté configurado correctamente
      if (settings.iaProvider !== IAProvider.GEMINI && !settings.iaApiKey) {
        setProviderReady(false);
        setError('IA no configurada. Abre Configuración para agregar tu API key.');
      } else {
        setProviderReady(true);
        setError(null);
      }
    }
  }, [currentUser]);

  const handleAnalyze = async () => {
    if (!providerReady) {
      setError('IA no configurada. Abre Configuración para agregar tu API key.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Fetch fresh sales data directly from storage to ensure accuracy
      const sales = getStoredSales();

      let result: BusinessIntelligence;

      if (provider === IAProvider.GEMINI) {
        // Usar Gemini
        result = await generateBusinessInsights(products, sales);
      } else if (provider === IAProvider.OPENAI && currentUser) {
        // Usar OpenAI
        const settings = getUserSettings(currentUser.id);
        const apiKey = settings.iaApiKey ? decryptCredential(settings.iaApiKey) : '';

        if (!apiKey) {
          throw new Error('API key de OpenAI no configurada');
        }

        const prompt = `Analiza el siguiente inventario y ventas, proporciona insights en formato JSON:
        Productos: ${JSON.stringify(products)}
        Ventas últimos 30 días: ${JSON.stringify(sales.slice(-10))}
        
        Responde con un JSON con estructura: { recommendations: [], trends: { topProducts: [], lowStock: [] }, summary: "" }`;

        const response = await getOpenAISuggestion(apiKey, prompt);
        result = JSON.parse(response);
      } else if (provider === IAProvider.ANTHROPIC && currentUser) {
        // Usar Anthropic
        const settings = getUserSettings(currentUser.id);
        const apiKey = settings.iaApiKey ? decryptCredential(settings.iaApiKey) : '';

        if (!apiKey) {
          throw new Error('API key de Anthropic no configurada');
        }

        const prompt = `Analiza el siguiente inventario y ventas, proporciona insights en formato JSON:
        Productos: ${JSON.stringify(products)}
        Ventas últimos 30 días: ${JSON.stringify(sales.slice(-10))}
        
        Responde con un JSON con estructura: { recommendations: [], trends: { topProducts: [], lowStock: [] }, summary: "" }`;

        const response = await getAnthropicSuggestion(apiKey, prompt);
        result = JSON.parse(response);
      } else {
        throw new Error('Proveedor de IA no válido');
      }

      setData(result);
    } catch (e) {
      console.error(e);
      const errorMsg = e instanceof Error ? e.message : 'Error desconocido';
      setError(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = (trend: 'UP' | 'DOWN' | 'STABLE') => {
      switch(trend) {
          case 'UP': return <TrendingUp className="text-emerald-500" size={16} />;
          case 'DOWN': return <TrendingDown className="text-red-500" size={16} />;
          default: return <Minus className="text-slate-400" size={16} />;
      }
  };

  const getUrgencyColor = (urgency: 'HIGH' | 'MEDIUM' | 'LOW') => {
      switch(urgency) {
          case 'HIGH': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
          case 'MEDIUM': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800';
          default: return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      }
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300" data-tour="ai-section">
      <header className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <BrainCircuit className="text-purple-600 dark:text-purple-400" />
              Inteligencia
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Predicciones y recomendaciones</p>
        </div>
        <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Provider Configuration Card */}
        <div className={`rounded-2xl p-4 border-2 ${
          providerReady
            ? isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            : isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-300'
        }`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                Proveedor IA: <span className="text-purple-600 dark:text-purple-400">{provider}</span>
              </p>
              {!providerReady && (
                <p className={`text-xs ${isDark ? 'text-red-300' : 'text-red-700'}`}>
                  ⚠ Necesitas configurar tu API key en Configuración
                </p>
              )}
            </div>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    : 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                }`}
              >
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Intro / Action Card */}
        <div className="bg-gradient-to-br from-purple-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-lg font-bold">Analítica Avanzada</h2>
                <p className="text-purple-200 text-sm mt-1">
                    Detecta tendencias estacionales y optimiza tus compras con IA.
                </p>
              </div>
              <BrainCircuit size={32} className="text-purple-300 opacity-50" />
          </div>
          
          <button
            onClick={handleAnalyze}
            disabled={loading || !providerReady}
            className={`w-full font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 ${
              !providerReady
                ? 'bg-slate-400 text-slate-600 cursor-not-allowed opacity-60'
                : 'bg-white text-purple-700 hover:bg-purple-50'
            }`}
          >
            {loading ? <Loader2 className="animate-spin" /> : <RefreshCw size={20} />}
            {data ? 'Actualizar Datos' : 'Generar Reporte'}
          </button>
        </div>

        {error && (
          <div className={`rounded-2xl p-4 border-l-4 ${
            isDark
              ? 'bg-red-900/20 border-red-700 border-red-600'
              : 'bg-red-50 border-red-300 border-red-500'
          }`}>
            <p className={isDark ? 'text-red-300' : 'text-red-700'}>
              {error}
            </p>
          </div>
        )}

        {data && (
            <div className="space-y-6 animate-fade-in">
                
                {/* 1. Market Insights */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 border-l-4 border-l-amber-400">
                    <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="text-amber-500" size={20} />
                        <h3 className="font-bold text-slate-800 dark:text-slate-100">Contexto de Mercado</h3>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                        {data.marketInsights}
                    </p>
                </div>

                {/* 2. Demand Prediction Chart */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                        <TrendingUp size={20} className="text-blue-500" />
                        Predicción de Demanda (30d)
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.predictions.slice(0, 5)} layout="vertical" margin={{left: 0, right: 20}}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis type="number" hide />
                                <YAxis 
                                    dataKey="productName" 
                                    type="category" 
                                    width={100} 
                                    tick={{fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11}} 
                                />
                                <Tooltip 
                                    cursor={{fill: 'transparent'}}
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        color: isDark ? '#fff' : '#000',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Legend wrapperStyle={{fontSize: '12px', marginTop: '10px'}} />
                                <Bar dataKey="currentSales" name="Actual" fill="#94a3b8" radius={[0, 4, 4, 0]} barSize={12} />
                                <Bar dataKey="predictedSales" name="Proyección" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={12} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-4 space-y-2">
                        {data.predictions.slice(0, 3).map((pred, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2">
                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate w-32">{pred.productName}</span>
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                        {getTrendIcon(pred.trend)}
                                        <span className="text-slate-500">{pred.trend}</span>
                                    </div>
                                    <div className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-400">
                                        {pred.confidence}% Conf.
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Smart Restock Recommendations */}
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2 px-1">
                        <ShoppingCart size={20} className="text-emerald-500" />
                        Compras Sugeridas
                    </h3>
                    <div className="space-y-3">
                        {data.restockSuggestions.map((rec, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border flex flex-col gap-2 ${getUrgencyColor(rec.urgency)}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-sm flex items-center gap-2">
                                            {rec.productName}
                                            {rec.urgency === 'HIGH' && <AlertTriangle size={14} />}
                                        </h4>
                                        <p className="text-xs opacity-90 mt-1">{rec.reason}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-2xl font-bold">+{rec.suggestedQuantity}</span>
                                        <span className="text-[10px] uppercase opacity-75 font-semibold">Unidades</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {data.restockSuggestions.length === 0 && (
                            <p className="text-center text-slate-400 text-sm py-4">No hay sugerencias de compra urgentes por el momento.</p>
                        )}
                    </div>
                </div>

            </div>
        )}

        {!data && !loading && (
             <div className="flex flex-col items-center justify-center py-10 text-slate-400 opacity-60">
                 <BrainCircuit size={48} className="mb-4" />
                 <p className="text-sm">Tus datos están seguros.</p>
             </div>
        )}

      </div>
    </div>
  );
};

export default AIAssistant;
