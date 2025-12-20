import React, { useMemo } from 'react';
import { StockMovement, MovementType } from '@/types';
import { Download, ArrowUpRight, ArrowDownLeft, History, Sun, Moon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface StockHistoryProps {
  movements: StockMovement[];
  isDark: boolean;
  onToggleTheme: () => void;
}

const StockHistory: React.FC<StockHistoryProps> = ({ movements, isDark, onToggleTheme }) => {
  // Prepare data for chart (Last 7 days)
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toLocaleDateString('es-AR', { weekday: 'short' }); // e.g. "Lun"
    }).reverse();

    return last7Days.map((dayLabel) => {
      return {
        name: dayLabel,
        Entradas: movements
          .filter(
            (m) =>
              (m.type === MovementType.IN ||
                (m.type === MovementType.ADJUSTMENT && m.quantity > 0)) &&
              new Date(m.date).toLocaleDateString('es-AR', { weekday: 'short' }) === dayLabel
          )
          .reduce((acc, curr) => acc + Math.abs(curr.quantity), 0),
        Salidas: movements
          .filter(
            (m) =>
              (m.type === MovementType.OUT ||
                (m.type === MovementType.ADJUSTMENT && m.quantity < 0)) &&
              new Date(m.date).toLocaleDateString('es-AR', { weekday: 'short' }) === dayLabel
          )
          .reduce((acc, curr) => acc + Math.abs(curr.quantity), 0),
      };
    });
  }, [movements]);

  const handleExport = () => {
    const headers = ['Fecha', 'Hora', 'Producto', 'Tipo', 'Cantidad', 'Razón'];
    const rows = movements.map((m) => {
      const dateObj = new Date(m.date);
      return [
        dateObj.toLocaleDateString('es-AR'),
        dateObj.toLocaleTimeString('es-AR'),
        m.productName,
        m.type,
        m.quantity,
        m.reason || '-',
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `inventariando_movimientos_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <History className="text-blue-600 dark:text-blue-400" />
            Historial
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Registro de movimientos</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={handleExport}
            className="p-2 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800 flex items-center justify-center"
            title="Exportar CSV"
          >
            <Download size={20} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Chart Card */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4">
            Evolución Semanal
          </h3>
          <div style={{ width: '100%', height: 200, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke={isDark ? '#334155' : '#e2e8f0'}
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 12 }}
                />
                <YAxis hide />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    backgroundColor: isDark ? '#1e293b' : '#fff',
                    color: isDark ? '#fff' : '#000',
                  }}
                />
                <Bar dataKey="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="Salidas" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 px-1">
            Últimos Movimientos
          </h3>

          {movements.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <p>No hay movimientos registrados.</p>
            </div>
          ) : (
            movements
              .slice()
              .reverse()
              .map((movement) => {
                const isPositive = movement.quantity > 0 || movement.type === MovementType.IN;
                return (
                  <div
                    key={movement.id}
                    className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm">
                          {movement.productName}
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(movement.date).toLocaleDateString('es-AR')} •{' '}
                          {new Date(movement.date).toLocaleTimeString('es-AR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-bold ${
                          isPositive
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {movement.quantity}
                      </p>
                      <p className="text-xs text-slate-400 uppercase tracking-wider font-medium">
                        {movement.type}
                      </p>
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};

export default StockHistory;
