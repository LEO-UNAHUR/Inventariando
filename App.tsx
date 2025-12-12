import React, { useState, useEffect } from 'react';
import { Product, View } from './types';
import { getStoredProducts, saveStoredProducts } from './services/storageService';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import AIAssistant from './components/AIAssistant';
import { LayoutDashboard, PackageSearch, Sparkles } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Theme State Management
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme');
      if (stored) return stored === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply theme class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  // Load data on mount
  useEffect(() => {
    const data = getStoredProducts();
    setProducts(data);
  }, []);

  // Persist data on change
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  const handleSaveProduct = (product: Product) => {
    if (editingProduct) {
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      setProducts([...products, product]);
    }
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return (
          <Dashboard 
            products={products} 
            isDark={isDark} 
            onToggleTheme={toggleTheme} 
          />
        );
      case View.INVENTORY:
        return (
          <InventoryList 
            products={products} 
            onEdit={openEditForm} 
            onDelete={handleDeleteProduct} 
            onAdd={openAddForm} 
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        );
      case View.ANALYSIS:
        return (
          <AIAssistant 
            products={products} 
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        );
      default:
        return (
          <Dashboard 
            products={products} 
            isDark={isDark} 
            onToggleTheme={toggleTheme} 
          />
        );
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Android Style) */}
      <nav className="h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center px-2 z-30 fixed bottom-0 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <button 
          onClick={() => setCurrentView(View.DASHBOARD)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === View.DASHBOARD ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <LayoutDashboard size={24} strokeWidth={currentView === View.DASHBOARD ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Inicio</span>
        </button>
        
        <button 
          onClick={() => setCurrentView(View.INVENTORY)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === View.INVENTORY ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <PackageSearch size={24} strokeWidth={currentView === View.INVENTORY ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Inventario</span>
        </button>

        <button 
          onClick={() => setCurrentView(View.ANALYSIS)}
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${currentView === View.ANALYSIS ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Sparkles size={24} strokeWidth={currentView === View.ANALYSIS ? 2.5 : 2} />
          <span className="text-[10px] font-medium">Asistente</span>
        </button>
      </nav>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm 
          initialProduct={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => setIsFormOpen(false)} 
        />
      )}
    </div>
  );
}