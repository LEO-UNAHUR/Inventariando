import React, { useState, useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Activity, Calendar, TrendingUp, Users, FileText, Database, Sun, Moon, X } from 'lucide-react';

interface EventRecord {
  id: string;
  type: string;
  timestamp: number;
  data?: Record<string, any>;
}

interface AnalyticsInternalDashboardProps {
  isDark: boolean;
  onToggleTheme: () => void;
  onClose: () => void;
}

const AnalyticsInternalDashboard: React.FC<AnalyticsInternalDashboardProps> = ({
  isDark,
  onToggleTheme,
  onClose,
}) => {
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('7d');

  // Obtener eventos del localStorage (simulado)
  const events = useMemo(() => {
    const stored = localStorage.getItem('analytics_events');
    return stored ? JSON.parse(stored) : [];
  }, []);

  // Procesar datos según rango de tiempo
  const processedData = useMemo(() => {
    const now = Date.now();
    let timeMs = 7 * 24 * 60 * 60 * 1000; // 7d por defecto

    if (timeRange === '24h') timeMs = 24 * 60 * 60 * 1000;
    else if (timeRange === '30d') timeMs = 30 * 24 * 60 * 60 * 1000;

    const filtered = events.filter((e: EventRecord) => e.timestamp >= now - timeMs);

    // Contar por tipo de evento
    const byType: Record<string, number> = {};
    filtered.forEach((e: EventRecord) => {
      byType[e.type] = (byType[e.type] || 0) + 1;
    });

    // Agrupar por día
    const byDay: Record<string, number> = {};
    filtered.forEach((e: EventRecord) => {
      const day = new Date(e.timestamp).toLocaleDateString('es-AR');
      byDay[day] = (byDay[day] || 0) + 1;
    });

    const pieData = Object.entries(byType).map(([type, count]) => ({
      name: type,
      value: count,
    }));

    const lineData = Object.entries(byDay)
      .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
      .map(([day, count]) => ({ day, eventos: count }));

    return {
      total: filtered.length,
      byType,
      pieData,
      lineData,
    };
  }, [events, timeRange]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b', '#06b6d4'];

  const eventTypeLabels: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
    app_opened: { label: 'App Abierta', icon: '📱', color: 'blue' },
    feature_accessed: { label: 'Feature Accedido', icon: '🚀', color: 'purple' },
    product_added: { label: 'Producto Agregado', icon: '📦', color: 'green' },
    sale_completed: { label: 'Venta Completada', icon: '💰', color: 'emerald' },
    feedback_submitted: { label: 'Feedback Enviado', icon: '⭐', color: 'amber' },
    data_exported: { label: 'Datos Exportados', icon: '📤', color: 'cyan' },
    data_imported: { label: 'Datos Importados', icon: '📥', color: 'indigo' },
    data_cleared: { label: 'Datos Eliminados', icon: '🗑️', color: 'red' },
    backup_created: { label: 'Backup Creado', icon: '💾', color: 'slate' },
    inventory_updated: { label: 'Inventario Actualizado', icon: '📊', color: 'orange' },
    export_category: { label: 'Categoría Exportada', icon: '📂', color: 'teal' },
    ai_suggestion_used: { label: 'IA Usada', icon: '🤖', color: 'violet' },
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      isDark ? 'bg-black/50' : 'bg-black/30'
    }`}>
      <div className={`w-full max-w-6xl max-h-[90vh] overflow-auto rounded-2xl ${
        isDark ? 'bg-slate-900' : 'bg-white'
      } shadow-2xl`}>
        {/* Header */}
        <div className={`sticky top-0 flex items-center justify-between p-6 border-b ${
          isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
        }`}>
          <div className="flex items-center gap-3">
            <Activity className={isDark ? 'text-blue-400' : 'text-blue-600'} size={28} />
            <h1 className={`text-2xl font-bold ${
              isDark ? 'text-slate-100' : 'text-slate-900'
            }`}>
              Métricas Internas
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleTheme}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${
                isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
              }`}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  timeRange === range
                    ? isDark
                      ? 'bg-blue-600 text-white'
                      : 'bg-blue-600 text-white'
                    : isDark
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {range === '24h' ? '24h' : range === '7d' ? 'Últimos 7 días' : 'Últimos 30 días'}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-blue-600 dark:text-blue-400" size={20} />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Total Eventos
                </p>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {processedData.total}
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-emerald-600 dark:text-emerald-400" size={20} />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Evento Top
                </p>
              </div>
              <p className={`text-2xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {processedData.byType && Object.entries(processedData.byType).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
              </p>
            </div>

            <div className={`p-4 rounded-xl border ${
              isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Activity className="text-purple-600 dark:text-purple-400" size={20} />
                <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Tipos de Evento
                </p>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {Object.keys(processedData.byType).length}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pie Chart */}
            {processedData.pieData.length > 0 && (
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Distribución de Eventos
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={processedData.pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {processedData.pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Line Chart */}
            {processedData.lineData.length > 0 && (
              <div className={`p-4 rounded-xl border ${
                isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className={`font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                  Eventos por Día
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={processedData.lineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#334155' : '#e2e8f0'} />
                    <XAxis dataKey="day" tick={{fill: isDark ? '#94a3b8' : '#64748b'}} />
                    <YAxis tick={{fill: isDark ? '#94a3b8' : '#64748b'}} />
                    <Tooltip />
                    <Line type="monotone" dataKey="eventos" stroke="#3b82f6" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Event Details Table */}
          <div className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
          }`}>
            <h3 className={`font-bold mb-4 ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              Detalles por Tipo
            </h3>
            <div className="space-y-2">
              {Object.entries(processedData.byType)
                .sort(([,a], [,b]) => b - a)
                .map(([type, count]) => {
                  const info = eventTypeLabels[type] || { label: type, icon: '📊', color: 'gray' };
                  return (
                    <div key={type} className={`flex items-center justify-between p-3 rounded-lg ${
                      isDark ? 'bg-slate-700' : 'bg-white border border-slate-200'
                    }`}>
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{info.icon}</span>
                        <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                          {info.label}
                        </span>
                      </div>
                      <span className={`font-bold text-lg ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                        {count}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInternalDashboard;
