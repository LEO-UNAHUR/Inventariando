
import React, { useMemo, useState, useEffect } from 'react';
import { Product, InventoryStats, AppNotification, NotificationSeverity } from '../types';
import { StockMovement } from '../types';
import { formatCurrency } from '../constants';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp, Package, AlertTriangle, DollarSign, Sun, Moon, Bell, X, Calendar, Activity, Database, Shield } from 'lucide-react';
import { getStoredMovements } from '../services/storageService';
import { generateNotifications } from '../services/notificationService';

interface DashboardProps {
  products: Product[];
  isDark: boolean;
  onToggleTheme: () => void;
  onOpenDataManagement?: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#64748b'];

const Dashboard: React.FC<DashboardProps> = ({ products, isDark, onToggleTheme, onOpenDataManagement }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // Load movements independently here to calculate velocity alerts
  useEffect(() => {
    setMovements(getStoredMovements());
  }, []);

  // Recalculate notifications whenever products or movements change
  useEffect(() => {
    setNotifications(generateNotifications(products, movements));
  }, [products, movements]);

  const stats: InventoryStats = useMemo(() => {
    return {
      totalValue: products.reduce((sum, p) => sum + (p.price * p.stock), 0),
      totalItems: products.reduce((sum, p) => sum + p.stock, 0),
      lowStockCount: products.filter(p => p.stock <= p.minStock).length,
    };
  }, [products]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    products.forEach(p => {
      map.set(p.category, (map.get(p.category) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [products]);

  const unreadCount = notifications.length;

  return (
    <div className="h-full overflow-y-auto no-scrollbar p-4 pb-24 space-y-6 animate-fade-in bg-slate-50 dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Header */}
      <header className="mb-6 flex justify-between items-start">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Resumen del Negocio</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Estado actual de tu inventario</p>
        </div>
        <div className="flex gap-2">
            {onOpenDataManagement && (
                <button 
                    onClick={onOpenDataManagement}
                    className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    title="Copia de Seguridad"
                >
                    <Database size={20} />
                </button>
            )}
            <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
                onClick={() => setShowNotifications(true)}
                className="relative p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-sm border border-slate-100 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 h-2.5 w-2.5 bg-red-500 rounded-full border border-white dark:border-slate-900 animate-pulse"></span>
                )}
            </button>
        </div>
      </header>

      {/* Notifications Drawer/Modal */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowNotifications(false)}></div>
            <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 h-full shadow-2xl animate-slide-left border-l border-slate-200 dark:border-slate-800 flex flex-col">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900">
                    <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <Bell size={18} className="text-blue-600" /> Notificaciones
                    </h2>
                    <button onClick={() => setShowNotifications(false)} className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X size={20} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 dark:bg-slate-950">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-center">
                            <Bell size={32} className="mb-2 opacity-50" />
                            <p className="text-sm">Todo está en orden.</p>
                            <p className="text-xs">No tienes alertas pendientes.</p>
                        </div>
                    ) : (
                        notifications.map(notif => {
                            let icon = <AlertTriangle size={18} />;
                            let colorClass = 'bg-slate-100 text-slate-600 border-slate-200';
                            
                            if (notif.severity === NotificationSeverity.CRITICAL) {
                                colorClass = 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-300 dark:border-red-900/30';
                            } else if (notif.severity === NotificationSeverity.WARNING) {
                                colorClass = 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-900/30';
                                icon = <Calendar size={18} />;
                            } else {
                                colorClass = 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-900/30';
                                icon = <Activity size={18} />;
                            }

                            return (
                                <div key={notif.id} className={`p-3 rounded-xl border ${colorClass} flex gap-3`}>
                                    <div className="mt-0.5">{icon}</div>
                                    <div>
                                        <h4 className="font-semibold text-sm">{notif.title}</h4>
                                        <p className="text-xs opacity-90 mt-0.5">{notif.message}</p>
                                        <p className="text-[10px] opacity-70 mt-2 text-right">
                                            {new Date(notif.date).toLocaleDateString('es-AR')}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
          <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg w-fit mb-2">
            <DollarSign className="text-blue-600 dark:text-blue-400" size={20} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Valor Total (Venta)</p>
          <p className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
            {formatCurrency(stats.totalValue)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between transition-colors">
          <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg w-fit mb-2">
            <AlertTriangle className="text-orange-600 dark:text-orange-400" size={20} />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Stock Bajo</p>
          <p className="text-lg font-bold text-orange-600 dark:text-orange-400 leading-tight">
            {stats.lowStockCount} <span className="text-xs font-normal text-slate-400 dark:text-slate-500">productos</span>
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-colors">
         <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Total Unidades</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{stats.totalItems}</p>
         </div>
         <div className="bg-emerald-100 dark:bg-emerald-900/30 p-3 rounded-full">
            <Package className="text-emerald-600 dark:text-emerald-400" size={24} />
         </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 transition-colors">
        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-slate-500 dark:text-slate-400"/>
          Distribución por Categoría
        </h3>
        
        {/* Chart Container - Using explicit inline styles to guarantee dimensions for Recharts */}
        <div style={{ width: '100%', height: 300, minHeight: 300 }}>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke={isDark ? '#0f172a' : '#fff'}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [`${value} items`, 'Cantidad']}
                  contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      backgroundColor: isDark ? '#1e293b' : '#fff',
                      color: isDark ? '#fff' : '#000'
                  }}
                  itemStyle={{ color: isDark ? '#cbd5e1' : '#334155' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
             <div className="flex items-center justify-center h-full text-slate-400 dark:text-slate-500 text-sm">
                No hay datos suficientes
             </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 mt-6 justify-center">
          {categoryData.map((entry, index) => (
            <div 
                key={entry.name} 
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700"
            >
              <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
              <span className="font-medium">{entry.name}</span>
              <span className="text-slate-400 dark:text-slate-500">({entry.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
