
import React, { useMemo, useState } from 'react';
import { Sale, Product } from '../types';
import { formatCurrency } from '../constants';
import { Sun, Moon, ShoppingBag, TrendingUp, Calendar, ArrowRight, DollarSign, Activity, BarChart2 } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Legend, YAxis } from 'recharts';

interface SalesDashboardProps {
  sales: Sale[];
  onNewSale: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

type Tab = 'OVERVIEW' | 'COMPARISON';

const SalesDashboard: React.FC<SalesDashboardProps> = ({ sales, onNewSale, isDark, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<Tab>('OVERVIEW');
  const [timeRange, setTimeRange] = useState<'WEEK' | 'MONTH'>('WEEK');

  // --- Overview Logic ---
  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    // Today's Sales
    const todaySales = sales.filter(s => s.date >= startOfDay);
    const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0);

    // Monthly Sales
    const monthSales = sales.filter(s => new Date(s.date).getMonth() === currentMonth);
    const monthRevenue = monthSales.reduce((sum, s) => sum + s.total, 0);

    // Projection (Linear)
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const projectedRevenue = dayOfMonth > 0 ? (monthRevenue / dayOfMonth) * daysInMonth : 0;

    // Best Sellers & Rotation Logic
    const productCount: Record<string, {name: string, qty: number, revenue: number}> = {};
    
    monthSales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productCount[item.productId]) {
          productCount[item.productId] = { name: item.productName, qty: 0, revenue: 0 };
        }
        productCount[item.productId].qty += item.quantity;
        productCount[item.productId].revenue += (item.quantity * item.price);
      });
    });
    
    const bestSellers = Object.values(productCount)
        .sort((a, b) => b.qty - a.qty)
        .slice(0, 5);

    // Chart Data
    const chartData = [];
    const daysToLookBack = timeRange === 'WEEK' ? 7 : 30;
    
    for (let i = daysToLookBack - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dayStr = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
        const start = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        const end = start + (24 * 60 * 60 * 1000);
        
        const dayTotal = sales
            .filter(s => s.date >= start && s.date < end)
            .reduce((sum, s) => sum + s.total, 0);
            
        chartData.push({ name: dayStr, total: dayTotal });
    }

    return { todayRevenue, todayCount: todaySales.length, monthRevenue, projectedRevenue, bestSellers, chartData };
  }, [sales, timeRange]);

  // --- Comparison Logic ---
  const comparisonData = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    // Determine previous month
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonth = prevDate.getMonth();
    const prevYear = prevDate.getFullYear();

    const getDailyData = (month: number, year: number) => {
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const data = new Array(daysInMonth).fill(0);
        
        sales.filter(s => {
            const d = new Date(s.date);
            return d.getMonth() === month && d.getFullYear() === year;
        }).forEach(s => {
            const day = new Date(s.date).getDate() - 1;
            if (day >= 0 && day < daysInMonth) data[day] += s.total;
        });
        return data;
    };

    const currentData = getDailyData(currentMonth, currentYear);
    const prevData = getDailyData(prevMonth, prevYear);
    
    // Create chart data combining both
    const chartData = currentData.map((val, idx) => ({
        day: idx + 1,
        Actual: val,
        Anterior: prevData[idx] || 0
    }));

    const totalCurrent = currentData.reduce((a, b) => a + b, 0);
    const totalPrev = prevData.reduce((a, b) => a + b, 0);
    const diff = totalCurrent - totalPrev;
    const percentChange = totalPrev > 0 ? (diff / totalPrev) * 100 : 0;

    return {
        chartData,
        totalCurrent,
        totalPrev,
        percentChange,
        currentMonthName: now.toLocaleDateString('es-AR', { month: 'long' }),
        prevMonthName: prevDate.toLocaleDateString('es-AR', { month: 'long' })
    };
  }, [sales]);

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-4">
            <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <ShoppingBag className="text-blue-600 dark:text-blue-400" />
                Ventas
            </h1>
            </div>
            <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>

        {/* Tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full">
            <button
                onClick={() => setActiveTab('OVERVIEW')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'OVERVIEW' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
                Resumen
            </button>
            <button
                onClick={() => setActiveTab('COMPARISON')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'COMPARISON' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400'}`}
            >
                Comparativa
            </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
                {/* Big CTA Button */}
                <button 
                    onClick={onNewSale}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-between group"
                    data-tour="new-sale-btn"
                >
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <ShoppingBag size={24} className="text-white" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-lg">Nueva Venta</p>
                            <p className="text-blue-100 text-sm">Abrir caja registradora</p>
                        </div>
                    </div>
                    <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>

                {/* Overview Cards */}
                <div className="grid grid-cols-2 gap-3">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                        <Calendar size={16} />
                        <span className="text-xs font-medium uppercase">Ventas Hoy</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                        {formatCurrency(stats.todayRevenue)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">{stats.todayCount} operaciones</p>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                        <TrendingUp size={16} />
                        <span className="text-xs font-medium uppercase">Proyección Mes</span>
                    </div>
                    <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(stats.projectedRevenue)}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Estimado al día 30</p>
                    <div className="absolute -right-4 -bottom-4 opacity-5">
                        <DollarSign size={80} />
                    </div>
                </div>
                </div>

                {/* Chart */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Ingresos</h3>
                        <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
                            <button 
                                onClick={() => setTimeRange('WEEK')}
                                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${timeRange === 'WEEK' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
                            >
                                7D
                            </button>
                            <button 
                                onClick={() => setTimeRange('MONTH')}
                                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${timeRange === 'MONTH' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-slate-500'}`}
                            >
                                30D
                            </button>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart 
                                data={stats.chartData} 
                                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                            >
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10}} 
                                    minTickGap={10}
                                    interval="preserveStartEnd"
                                    tickMargin={8}
                                />
                                <Tooltip 
                                    formatter={(value: number) => [formatCurrency(value), 'Ventas']}
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        color: isDark ? '#fff' : '#000',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Area type="monotone" dataKey="total" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSales)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <h3 className="font-semibold text-slate-800 dark:text-slate-200">Alta Rotación (Mes)</h3>
                        <span className="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md flex items-center gap-1">
                            <Activity size={12} /> Top 5
                        </span>
                    </div>
                    {stats.bestSellers.length === 0 ? (
                        <p className="text-slate-400 text-sm text-center py-4">No hay ventas este mes aún.</p>
                    ) : (
                        stats.bestSellers.map((item, idx) => (
                            <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                        {idx + 1}
                                    </span>
                                    <div>
                                        <p className="font-medium text-slate-800 dark:text-slate-100 text-sm truncate w-40">{item.name}</p>
                                        <p className="text-xs text-slate-500">{item.qty} uds. vendidas</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">{formatCurrency(item.revenue)}</p>
                                    <p className="text-[10px] text-emerald-500 font-medium">En alza</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        )}

        {activeTab === 'COMPARISON' && (
             <div className="space-y-6 animate-fade-in">
                 
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 text-center">
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase mb-2">Diferencia Mes vs Mes</p>
                    <div className="flex items-center justify-center gap-3">
                         <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                             {formatCurrency(comparisonData.totalCurrent)}
                         </h2>
                         <span className={`text-sm font-bold px-2 py-1 rounded-full flex items-center gap-1 ${comparisonData.percentChange >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`}>
                             {comparisonData.percentChange >= 0 ? <TrendingUp size={14} /> : <BarChart2 size={14} />}
                             {comparisonData.percentChange.toFixed(1)}%
                         </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        {comparisonData.currentMonthName} vs {comparisonData.prevMonthName}
                    </p>
                 </div>

                 {/* Comparison Chart */}
                 <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Evolución Diaria (Comparada)</h3>
                    <div style={{ width: '100%', height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={comparisonData.chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                                <XAxis 
                                    dataKey="day" 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10}}
                                />
                                <YAxis 
                                    tickLine={false} 
                                    axisLine={false} 
                                    tick={{fill: isDark ? '#94a3b8' : '#64748b', fontSize: 10}}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '8px', 
                                        border: 'none', 
                                        backgroundColor: isDark ? '#1e293b' : '#fff',
                                        color: isDark ? '#fff' : '#000',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                />
                                <Legend />
                                <Bar dataKey="Anterior" name={comparisonData.prevMonthName} fill="#94a3b8" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Actual" name={comparisonData.currentMonthName} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>

                 <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                     <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-2 text-sm">Análisis Rápido</h4>
                     <p className="text-sm text-blue-700 dark:text-blue-200">
                         {comparisonData.totalCurrent > comparisonData.totalPrev 
                            ? `¡Excelente! Tus ventas han superado al mes anterior en ${formatCurrency(comparisonData.totalCurrent - comparisonData.totalPrev)}. Continúa con las estrategias actuales.`
                            : `Las ventas están un ${Math.abs(comparisonData.percentChange).toFixed(1)}% por debajo del mes pasado. Considera lanzar una oferta para repuntar.`
                         }
                     </p>
                 </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default SalesDashboard;
