
import React, { useState, useEffect } from 'react';
import { Product, Category, SortOption, ViewMode } from '../types';
import { formatCurrency } from '../constants';
import { Search, Edit2, Trash2, Plus, AlertCircle, Filter, Sun, Moon, TrendingUp, LayoutGrid, List, ArrowDownUp, ScanLine, X } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface InventoryListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAdd: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const InventoryList: React.FC<InventoryListProps> = ({ products, onEdit, onDelete, onAdd, isDark, onToggleTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('LIST');
  const [sortOption, setSortOption] = useState<SortOption>('NAME_ASC');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // --- Filter & Sort Logic ---
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.barcode && p.barcode.includes(searchTerm));
    
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    
    const minP = minPrice ? parseFloat(minPrice) : 0;
    const maxP = maxPrice ? parseFloat(maxPrice) : Infinity;
    const matchesPrice = p.price >= minP && p.price <= maxP;

    return matchesSearch && matchesCategory && matchesPrice;
  }).sort((a, b) => {
      switch (sortOption) {
          case 'NAME_ASC': return a.name.localeCompare(b.name);
          case 'NAME_DESC': return b.name.localeCompare(a.name);
          case 'PRICE_ASC': return a.price - b.price;
          case 'PRICE_DESC': return b.price - a.price;
          case 'STOCK_ASC': return a.stock - b.stock;
          case 'STOCK_DESC': return b.stock - a.stock;
          default: return 0;
      }
  });

  // --- Scanner Logic ---
  useEffect(() => {
    let scanner: any = null;
    if (isScannerOpen) {
        scanner = new Html5QrcodeScanner(
            "reader", 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );
        scanner.render((decodedText: string) => {
            setSearchTerm(decodedText);
            setIsScannerOpen(false);
            scanner.clear();
        }, (error: any) => {
            // Ignore scan errors, they happen when no code is in frame
        });
    }

    return () => {
        if (scanner) {
            try { scanner.clear(); } catch (e) { console.error(e); }
        }
    };
  }, [isScannerOpen]);

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Sticky Header */}
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 space-y-3 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Inventario</h1>
            <div className="flex gap-2">
                <button 
                    onClick={onToggleTheme}
                    className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className={`p-2 rounded-full border transition-colors ${showFilters ? 'bg-blue-100 text-blue-600 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800' : 'bg-white text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'}`}
                >
                    <Filter size={20} />
                </button>
                <button
                    onClick={() => setViewMode(viewMode === 'LIST' ? 'GRID' : 'LIST')}
                    className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                    {viewMode === 'LIST' ? <LayoutGrid size={20} /> : <List size={20} />}
                </button>
            </div>
        </div>
        
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar producto, código..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors"
                />
            </div>
            <button 
                onClick={() => setIsScannerOpen(true)}
                className="bg-slate-800 dark:bg-slate-700 text-white p-3 rounded-xl"
            >
                <ScanLine size={20} />
            </button>
        </div>

        {/* Scanner Modal Overlay */}
        {isScannerOpen && (
            <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 relative">
                    <button 
                        onClick={() => setIsScannerOpen(false)} 
                        className="absolute top-2 right-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-full z-10"
                    >
                        <X size={20} />
                    </button>
                    <h3 className="text-center font-bold mb-4 dark:text-white">Escanear Código</h3>
                    <div id="reader" className="overflow-hidden rounded-lg"></div>
                </div>
            </div>
        )}

        {showFilters && (
            <div className="space-y-3 animate-slide-up bg-slate-100 dark:bg-slate-900/50 p-3 rounded-xl">
                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
                    <button 
                        onClick={() => setSelectedCategory('all')}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === 'all' ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                    >
                        Todos
                    </button>
                    {Object.values(Category).map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
                
                {/* Advanced Filters */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                         <span className="text-xs text-slate-500">Precio</span>
                         <input 
                            type="number" 
                            placeholder="Min" 
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none dark:text-white"
                         />
                         <span className="text-slate-300">-</span>
                         <input 
                            type="number" 
                            placeholder="Max" 
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                            className="w-full bg-transparent text-sm outline-none dark:text-white"
                         />
                    </div>
                    <div className="relative">
                         <ArrowDownUp size={16} className="absolute left-3 top-3 text-slate-400" />
                         <select 
                            value={sortOption}
                            onChange={(e) => setSortOption(e.target.value as SortOption)}
                            className="w-full pl-9 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm outline-none appearance-none dark:text-white"
                         >
                             <option value="NAME_ASC">Nombre (A-Z)</option>
                             <option value="NAME_DESC">Nombre (Z-A)</option>
                             <option value="PRICE_ASC">Precio (Menor)</option>
                             <option value="PRICE_DESC">Precio (Mayor)</option>
                             <option value="STOCK_ASC">Stock (Menor)</option>
                             <option value="STOCK_DESC">Stock (Mayor)</option>
                         </select>
                    </div>
                </div>
            </div>
        )}
      </div>

      {/* List / Grid Content */}
      <div className={`flex-1 overflow-y-auto p-4 ${viewMode === 'GRID' ? 'grid grid-cols-2 gap-3 content-start' : 'space-y-3'}`}>
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-400">
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          filteredProducts.map(product => {
            const profit = product.price - product.cost;
            
            if (viewMode === 'GRID') {
                return (
                    <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between active:scale-[0.98] transition-all">
                        <div>
                             <div className="flex justify-between items-start mb-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${product.stock <= product.minStock ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {product.stock} un.
                                </span>
                                {product.stock <= product.minStock && <AlertCircle size={14} className="text-orange-500" />}
                             </div>
                             <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 h-10 mb-1">{product.name}</h3>
                             <p className="text-xs text-slate-400 mb-2 truncate">{product.category}</p>
                        </div>
                        <div className="flex justify-between items-end">
                             <p className="font-bold text-blue-600 dark:text-blue-400">{formatCurrency(product.price)}</p>
                             <div className="flex gap-1">
                                <button onClick={() => onEdit(product)} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded text-blue-500">
                                    <Edit2 size={14} />
                                </button>
                                <button onClick={() => onDelete(product.id)} className="p-1.5 bg-slate-50 dark:bg-slate-800 rounded text-red-400">
                                    <Trash2 size={14} />
                                </button>
                             </div>
                        </div>
                    </div>
                );
            }

            return (
              <div key={product.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between active:scale-[0.99] transition-all">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 truncate">{product.name}</h3>
                    {product.stock <= product.minStock && (
                      <AlertCircle size={16} className="text-orange-500 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-400 font-mono mb-1">ID: {product.id}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{product.category}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                     <span className="font-bold text-blue-600 dark:text-blue-400 mr-1">{formatCurrency(product.price)}</span>
                     
                     <span className={`px-2 py-0.5 rounded text-xs font-medium ${product.stock <= product.minStock ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                       Stock: {product.stock}
                     </span>

                     <span className="px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 flex items-center gap-1">
                        <TrendingUp size={12} />
                        +{formatCurrency(profit)}
                     </span>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 border-l border-slate-100 dark:border-slate-800 pl-3">
                  <button 
                    onClick={() => onEdit(product)} 
                    className="p-2 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(product.id)} 
                    className="p-2 text-red-400 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onAdd}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 z-20"
      >
        <Plus size={28} />
      </button>

    </div>
  );
};

export default InventoryList;
