
import React, { useMemo, useState } from 'react';
import { Product, Category, Sale, Expense, ExpenseCategory } from '@/types';
import { formatCurrency } from '@/constants';
import { Sun, Moon, TrendingUp, DollarSign, Percent, AlertCircle, ArrowRight, Calculator, PieChart as PieIcon, Wallet, ArrowDown, Plus, Trash2, Save, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie } from 'recharts';

interface FinancialAnalysisProps {
  products: Product[];
  sales: Sale[];
  expenses: Expense[];
  onAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onUpdatePrices: (products: Product[]) => void; // Function to save bulk updates
}

type Tab = 'STRATEGY' | 'BALANCE';

const FinancialAnalysis: React.FC<FinancialAnalysisProps> = ({ products, sales, expenses, onAddExpense, onDeleteExpense, isDark, onToggleTheme, onUpdatePrices }) => {
  const [activeTab, setActiveTab] = useState<Tab>('BALANCE');
  const [inflationRate, setInflationRate] = useState<number>(5); 
  const [selectedCategoryForUpdate, setSelectedCategoryForUpdate] = useState<string>('ALL');

  // --- Calculations for Strategy Tab (Inventory Potential) ---
  const inventoryData = useMemo(() => {
    let totalCost = 0;
    let totalRevenue = 0;
    let productsWithMargin = 0;
    let totalMarkupPercentage = 0;

    const enrichedProducts = products.map(p => {
      const profit = p.price - p.cost;
      const markup = p.cost > 0 ? (profit / p.cost) * 100 : 100;
      
      totalCost += p.cost * p.stock;
      totalRevenue += p.price * p.stock;
      
      if (p.cost > 0) {
        productsWithMargin++;
        totalMarkupPercentage += markup;
      }

      return { ...p, profit, markup };
    });

    const avgMarkup = productsWithMargin > 0 ? totalMarkupPercentage / productsWithMargin : 0;
    const totalPotentialProfit = totalRevenue - totalCost;
    const sortedByMarkup = [...enrichedProducts].sort((a, b) => b.markup - a.markup);
    
    const categoryStats = Object.values(Category).map(cat => {
      const catProducts = enrichedProducts.filter(p => p.category === cat);
      const catProfit = catProducts.reduce((sum, p) => sum + (p.profit * p.stock), 0);
      return { name: cat, profit: catProfit };
    }).filter(c => c.profit > 0);

    return { totalPotentialProfit, avgMarkup, sortedByMarkup, categoryStats };
  }, [products]);

  // --- Calculations for Balance Tab (Actual Cash Flow) ---
  const balanceData = useMemo(() => {
    // Current month filter
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const filteredSales = sales.filter(s => {
        const d = new Date(s.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    const filteredExpenses = expenses.filter(e => {
        const d = new Date(e.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });

    // Income
    const grossRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    // COGS (Costo Mercadería Vendida) - Calculated at the moment of sale
    const cogs = filteredSales.reduce((sum, s) => {
        return sum + s.items.reduce((isum, item) => isum + (item.cost * item.quantity), 0);
    }, 0);
    
    // Expenses
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

    // Results
    const grossProfit = grossRevenue - cogs;
    const netProfit = grossProfit - totalExpenses;
    const margin = grossRevenue > 0 ? (netProfit / grossRevenue) * 100 : 0;

    // Expense Composition for Chart
    const expenseComposition = Object.values(ExpenseCategory).map(cat => {
        const val = filteredExpenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0);
        return { name: cat, value: val };
    }).filter(x => x.value > 0);

    return { 
        grossRevenue, 
        cogs, 
        grossProfit, 
        totalExpenses, 
        netProfit, 
        margin, 
        filteredExpenses, 
        expenseComposition,
        monthName: now.toLocaleDateString('es-AR', { month: 'long' })
    };
  }, [sales, expenses]);

  const handleApplyInflation = () => {
      const confirmation = window.confirm(`¿Estás seguro de aumentar un ${inflationRate}% el precio de ${selectedCategoryForUpdate === 'ALL' ? 'TODOS los productos' : selectedCategoryForUpdate}?`);
      
      if (confirmation) {
          const updatedProducts = products.map(p => {
              if (selectedCategoryForUpdate === 'ALL' || p.category === selectedCategoryForUpdate) {
                  const newPrice = Math.ceil(p.price * (1 + inflationRate / 100) / 10) * 10; // Round to nearest 10
                  return { ...p, price: newPrice, lastUpdated: Date.now() };
              }
              return p;
          });
          onUpdatePrices(updatedProducts);
          alert('Precios actualizados correctamente.');
      }
  };

  const getMarginColor = (markup: number) => {
    if (markup >= 50) return 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20';
    if (markup >= 30) return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
    if (markup >= 15) return 'text-amber-500 bg-amber-100 dark:bg-amber-900/20';
    return 'text-red-500 bg-red-100 dark:bg-red-900/20';
  };

  const EXPENSE_COLORS = ['#ef4444', '#f97316', '#eab308', '#8b5cf6', '#ec4899', '#64748b'];

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Header */}
      <header className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 pt-4 px-4 pb-2 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start transition-colors">
        <div className="w-full">
          <div className="flex justify-between items-center mb-4">
             <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
                <DollarSign className="text-emerald-600 dark:text-emerald-400" />
                Finanzas
             </h1>
            <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full bg-white dark:bg-slate-800 text-secondary border border-slate-200 dark:border-slate-700"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-full">
            <button
                onClick={() => setActiveTab('BALANCE')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'BALANCE' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-secondary'}`}
            >
                Balance & Gastos
            </button>
            <button
                onClick={() => setActiveTab('STRATEGY')}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'STRATEGY' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-slate-100' : 'text-secondary'}`}
            >
                Precios & Stock
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">

        {activeTab === 'BALANCE' && (
            <div className="space-y-6 animate-fade-in">
                
                {/* Net Profit Card (Hero) */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 dark:from-slate-800 dark:to-slate-950 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Wallet size={80} />
                    </div>
                    <p className="text-secondary text-sm font-medium uppercase mb-1">Resultado Neto ({balanceData.monthName})</p>
                    <div className="flex items-baseline gap-2">
                        <h2 className={`text-3xl font-bold ${balanceData.netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(balanceData.netProfit)}
                        </h2>
                        {balanceData.grossRevenue > 0 && (
                             <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${balanceData.netProfit >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                                {balanceData.margin.toFixed(1)}% Margen
                             </span>
                        )}
                    </div>
                    
                    <div className="mt-6 grid grid-cols-3 gap-2 text-center border-t border-white/10 pt-4">
                        <div>
                            <p className="text-xs text-secondary mb-1">Ventas</p>
                            <p className="font-semibold text-emerald-300 text-sm md:text-base">{formatCurrency(balanceData.grossRevenue)}</p>
                        </div>
                        <div className="border-l border-white/10">
                            <p className="text-xs text-secondary mb-1">Costo Merc.</p>
                            <p className="font-semibold text-secondary text-sm md:text-base">-{formatCurrency(balanceData.cogs)}</p>
                        </div>
                        <div className="border-l border-white/10">
                            <p className="text-xs text-secondary mb-1">Gastos Op.</p>
                            <p className="font-semibold text-red-300 text-sm md:text-base">-{formatCurrency(balanceData.totalExpenses)}</p>
                        </div>
                    </div>
                </div>

                {/* Expense Chart */}
                {balanceData.expenseComposition.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-row items-center">
                        <div className="flex-1 h-32">
                             <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={balanceData.expenseComposition}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={30}
                                        outerRadius={50}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {balanceData.expenseComposition.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={EXPENSE_COLORS[index % EXPENSE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                </PieChart>
                             </ResponsiveContainer>
                        </div>
                        <div className="flex-1 space-y-1">
                             <h3 className="text-sm font-bold text-primary mb-2">Gastos Operativos</h3>
                             {balanceData.expenseComposition.slice(0, 3).map((entry, idx) => (
                                 <div key={idx} className="flex items-center justify-between text-xs">
                                     <div className="flex items-center gap-1.5">
                                         <span className="w-2 h-2 rounded-full" style={{backgroundColor: EXPENSE_COLORS[idx % EXPENSE_COLORS.length]}}></span>
                                         <span className="text-secondary truncate w-20">{entry.name}</span>
                                     </div>
                                     <span className="font-medium text-primary">{formatCurrency(entry.value)}</span>
                                 </div>
                             ))}
                        </div>
                    </div>
                )}

                {/* Expenses List */}
                <div>
                    <div className="flex justify-between items-center mb-3 px-1">
                        <h3 className="font-bold text-primary flex items-center gap-2">
                             <ArrowDown size={18} className="text-red-500" />
                             Últimos Gastos
                        </h3>
                        <button 
                            onClick={onAddExpense}
                            className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 hover:underline"
                        >
                            <Plus size={16} /> Agregar
                        </button>
                    </div>

                    <div className="space-y-2">
                        {balanceData.filteredExpenses.length === 0 ? (
                            <p className="text-secondary text-sm text-center py-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">No hay gastos registrados este mes.</p>
                        ) : (
                            balanceData.filteredExpenses.slice().reverse().map(expense => (
                                <div key={expense.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center group">
                                    <div>
                                        <p className="font-medium text-primary text-sm">{expense.description}</p>
                                        <p className="text-secondary text-xs">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-red-500">-{formatCurrency(expense.amount)}</span>
                                        <button 
                                            onClick={() => onDeleteExpense(expense.id)}
                                            className="text-secondary hover:text-red-500 transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        )}

        {activeTab === 'STRATEGY' && (
             <div className="space-y-6 animate-fade-in">
                 {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-secondary mb-1">
                            <DollarSign size={16} />
                            <span className="text-xs font-medium uppercase">Valor Stock</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(inventoryData.totalPotentialProfit)}
                        </p>
                        <p className="text-secondary text-xs mt-1">Ganancia latente</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2 text-secondary mb-1">
                            <Percent size={16} />
                            <span className="text-xs font-medium uppercase">Remarcación</span>
                        </div>
                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                            {inventoryData.avgMarkup.toFixed(1)}%
                        </p>
                        <p className="text-secondary text-xs mt-1">Promedio</p>
                    </div>
                </div>

                {/* Inflation Adjustment Tool */}
                <div className="bg-slate-800 dark:bg-slate-900 rounded-2xl p-5 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Calculator className="text-amber-400" />
                            <h3 className="font-bold text-lg">Ajuste por Inflación</h3>
                        </div>
                        <span className="text-[10px] bg-green-500/20 text-green-300 px-2 py-1 rounded">Dólar Blue: $1150 (Sim)</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs text-secondary mb-1 block">Categoría a Impactar</label>
                            <select 
                                value={selectedCategoryForUpdate}
                                onChange={(e) => setSelectedCategoryForUpdate(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg p-2 text-sm"
                            >
                                <option value="ALL">Todo el Inventario</option>
                                {Object.values(Category).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs text-secondary mb-1">
                                <span>Porcentaje de Aumento</span>
                                <span className="font-bold text-amber-400">{inflationRate}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="1" 
                                max="100" 
                                value={inflationRate} 
                                onChange={(e) => setInflationRate(parseInt(e.target.value))}
                                className="w-full accent-amber-500 h-2 bg-slate-600 rounded-lg appearance-none cursor-pointer"
                            />
                        </div>

                        {products.length > 0 && (
                            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
                                <p className="text-secondary text-xs mb-1">Ejemplo: {products[0].name}</p>
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-secondary">{formatCurrency(products[0].price)}</span>
                                    <ArrowRight size={14} className="text-secondary" />
                                    <span className="font-bold text-amber-400 text-base">
                                        {formatCurrency(Math.ceil(products[0].price * (1 + inflationRate / 100) / 10) * 10)}
                                    </span>
                                </div>
                            </div>
                        )}

                        <button 
                            onClick={handleApplyInflation}
                            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                        >
                            <Save size={16} /> Aplicar Nuevos Precios
                        </button>
                    </div>
                </div>

                {/* Category Profit Chart */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h3 className="text-base font-semibold text-primary mb-4 flex items-center gap-2">
                        <PieIcon size={18} className="text-secondary" />
                        Ganancia Potencial por Rubro
                    </h3>
                    <div style={{ width: '100%', height: 200 }}>
                        <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={inventoryData.categoryStats} layout="vertical" margin={{ left: 10, right: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={isDark ? '#334155' : '#e2e8f0'} />
                            <XAxis type="number" hide />
                            <YAxis 
                                dataKey="name" 
                                type="category" 
                                width={80} 
                                tick={{fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11}} 
                            />
                            <Tooltip 
                                formatter={(value: number) => [formatCurrency(value), 'Ganancia Est.']}
                                contentStyle={{ 
                                    borderRadius: '12px', 
                                    border: 'none', 
                                    backgroundColor: isDark ? '#1e293b' : '#fff',
                                    color: isDark ? '#fff' : '#000'
                                }}
                            />
                            <Bar dataKey="profit" radius={[0, 4, 4, 0]} barSize={20} fill="#3b82f6" />
                        </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                 {/* Rankings */}
                <div>
                    <h3 className="text-base font-semibold text-primary mb-3 px-1">Top Rentabilidad (%)</h3>
                    <div className="space-y-2">
                        {inventoryData.sortedByMarkup.slice(0, 3).map((p, idx) => (
                            <div key={p.id} className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <span className="text-secondary font-mono text-sm w-4">{idx + 1}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-primary text-sm truncate w-32 sm:w-40">{p.name}</p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg font-bold text-xs ${getMarginColor(p.markup)}`}>
                                    {p.markup.toFixed(0)}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
             </div>
        )}

      </div>
    </div>
  );
};

export default FinancialAnalysis;
