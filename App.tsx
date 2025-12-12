
import React, { useState, useEffect } from 'react';
import { Product, View, StockMovement, MovementType, Supplier, Sale, Expense } from './types';
import { getStoredProducts, saveStoredProducts, getStoredMovements, saveStoredMovements, getStoredSuppliers, saveStoredSuppliers, getStoredSales, saveStoredSales, getStoredExpenses, saveStoredExpenses } from './services/storageService';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import AIAssistant from './components/AIAssistant';
import StockHistory from './components/StockHistory';
import SupplierList from './components/SupplierList';
import SupplierForm from './components/SupplierForm';
import FinancialAnalysis from './components/FinancialAnalysis';
import SalesDashboard from './components/SalesDashboard';
import POS from './components/POS';
import ExpenseForm from './components/ExpenseForm';
import DataManagement from './components/DataManagement';
import { LayoutDashboard, PackageSearch, Sparkles, Truck, DollarSign, ShoppingBag } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);


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
    setProducts(getStoredProducts());
    setMovements(getStoredMovements());
    setSuppliers(getStoredSuppliers());
    setSales(getStoredSales());
    setExpenses(getStoredExpenses());
  }, []);

  // Persist data on change
  useEffect(() => {
    saveStoredProducts(products);
  }, [products]);

  useEffect(() => {
    saveStoredMovements(movements);
  }, [movements]);

  useEffect(() => {
    saveStoredSuppliers(suppliers);
  }, [suppliers]);

  useEffect(() => {
    saveStoredSales(sales);
  }, [sales]);

  useEffect(() => {
    saveStoredExpenses(expenses);
  }, [expenses]);

  // --- Product Handlers ---

  const handleSaveProduct = (product: Product) => {
    let newMovements = [...movements];
    
    if (editingProduct) {
      const oldProduct = products.find(p => p.id === product.id);
      if (oldProduct) {
        const stockDiff = product.stock - oldProduct.stock;
        if (stockDiff !== 0) {
          newMovements.push({
            id: crypto.randomUUID(),
            productId: product.id,
            productName: product.name,
            type: stockDiff > 0 ? MovementType.IN : MovementType.OUT,
            quantity: stockDiff,
            date: Date.now(),
            reason: 'Actualización manual'
          });
        }
      }
      setProducts(products.map(p => p.id === product.id ? product : p));
    } else {
      if (product.stock > 0) {
        newMovements.push({
            id: crypto.randomUUID(),
            productId: product.id,
            productName: product.name,
            type: MovementType.IN,
            quantity: product.stock,
            date: Date.now(),
            reason: 'Stock Inicial'
        });
      }
      setProducts([...products, product]);
    }

    setMovements(newMovements);
    setIsProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      const productToDelete = products.find(p => p.id === id);
      if (productToDelete && productToDelete.stock > 0) {
        const newMovement: StockMovement = {
            id: crypto.randomUUID(),
            productId: productToDelete.id,
            productName: productToDelete.name,
            type: MovementType.OUT,
            quantity: -productToDelete.stock,
            date: Date.now(),
            reason: 'Eliminación de producto'
        };
        setMovements([...movements, newMovement]);
      }
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const openAddProductForm = () => {
    setEditingProduct(null);
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setIsProductFormOpen(true);
  };

  // --- Import Handler ---
  const handleImportProducts = (newProducts: Product[]) => {
      // Merge logic: Update existing by ID, add new
      const currentMap = new Map(products.map(p => [p.id, p]));
      
      newProducts.forEach(p => {
          currentMap.set(p.id, p);
      });

      setProducts(Array.from(currentMap.values()));
  };

  // --- Supplier Handlers ---

  const handleSaveSupplier = (supplier: Supplier) => {
    if (editingSupplier) {
        setSuppliers(suppliers.map(s => s.id === supplier.id ? supplier : s));
    } else {
        setSuppliers([...suppliers, supplier]);
    }
    setIsSupplierFormOpen(false);
    setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
    if (window.confirm('¿Estás seguro de eliminar este proveedor?')) {
        setSuppliers(suppliers.filter(s => s.id !== id));
    }
  };

  const openAddSupplierForm = () => {
    setEditingSupplier(null);
    setIsSupplierFormOpen(true);
  };

  const openEditSupplierForm = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setIsSupplierFormOpen(true);
  };

  // --- Sales / POS Handlers ---

  const handleNewSale = () => {
    setIsPOSOpen(true);
  };

  const handleCompleteSale = (sale: Sale) => {
    // 1. Add Sale
    setSales([...sales, sale]);

    // 2. Create Stock Movements & Update Product Stock
    const newMovements: StockMovement[] = [];
    let updatedProducts = [...products];

    sale.items.forEach(item => {
        // Update product stock in memory
        updatedProducts = updatedProducts.map(p => 
            p.id === item.productId 
            ? { ...p, stock: p.stock - item.quantity, lastUpdated: Date.now() } 
            : p
        );

        // Add movement log
        newMovements.push({
            id: crypto.randomUUID(),
            productId: item.productId,
            productName: item.productName,
            type: MovementType.OUT,
            quantity: -item.quantity,
            date: Date.now(),
            reason: `Venta POS #${sale.id.slice(0,4)}`
        });
    });

    setMovements([...movements, ...newMovements]);
    setProducts(updatedProducts);
    setIsPOSOpen(false);
  };

  // --- Expenses Handlers ---

  const handleSaveExpense = (expense: Expense) => {
    setExpenses([...expenses, expense]);
    setIsExpenseFormOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (window.confirm('¿Borrar este gasto?')) {
        setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case View.DASHBOARD:
        return (
            <Dashboard 
                products={products} 
                isDark={isDark} 
                onToggleTheme={toggleTheme} 
                onOpenDataManagement={() => setIsDataManagementOpen(true)}
            />
        );
      case View.INVENTORY:
        return (
          <InventoryList 
            products={products} 
            onEdit={openEditProductForm} 
            onDelete={handleDeleteProduct} 
            onAdd={openAddProductForm} 
            isDark={isDark}
            onToggleTheme={toggleTheme}
          />
        );
      case View.SALES:
        return (
            <SalesDashboard 
                sales={sales}
                onNewSale={handleNewSale}
                isDark={isDark}
                onToggleTheme={toggleTheme}
            />
        );
      case View.HISTORY:
        return <StockHistory movements={movements} isDark={isDark} onToggleTheme={toggleTheme} />;
      case View.SUPPLIERS:
        return (
            <SupplierList 
                suppliers={suppliers}
                onAdd={openAddSupplierForm}
                onEdit={openEditSupplierForm}
                onDelete={handleDeleteSupplier}
                isDark={isDark}
                onToggleTheme={toggleTheme}
            />
        );
      case View.FINANCE:
        return (
            <FinancialAnalysis 
                products={products}
                sales={sales}
                expenses={expenses}
                onAddExpense={() => setIsExpenseFormOpen(true)}
                onDeleteExpense={handleDeleteExpense}
                isDark={isDark} 
                onToggleTheme={toggleTheme} 
            />
        );
      case View.ANALYSIS:
        return <AIAssistant products={products} isDark={isDark} onToggleTheme={toggleTheme} />;
      default:
        return <Dashboard products={products} isDark={isDark} onToggleTheme={toggleTheme} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Android Style) */}
      <nav className="h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center px-1 z-30 fixed bottom-0 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] transition-colors duration-300 overflow-x-auto no-scrollbar">
        <button 
          onClick={() => setCurrentView(View.DASHBOARD)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.DASHBOARD ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <LayoutDashboard size={20} strokeWidth={currentView === View.DASHBOARD ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Inicio</span>
        </button>
        
        <button 
          onClick={() => setCurrentView(View.INVENTORY)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.INVENTORY ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <PackageSearch size={20} strokeWidth={currentView === View.INVENTORY ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Items</span>
        </button>

        <button 
          onClick={() => setCurrentView(View.SALES)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.SALES ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <ShoppingBag size={20} strokeWidth={currentView === View.SALES ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Ventas</span>
        </button>

        <button 
          onClick={() => setCurrentView(View.SUPPLIERS)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.SUPPLIERS ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Truck size={20} strokeWidth={currentView === View.SUPPLIERS ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Prov.</span>
        </button>
        
        <button 
          onClick={() => setCurrentView(View.FINANCE)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.FINANCE ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <DollarSign size={20} strokeWidth={currentView === View.FINANCE ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Finanzas</span>
        </button>

        <button 
          onClick={() => setCurrentView(View.ANALYSIS)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.ANALYSIS ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Sparkles size={20} strokeWidth={currentView === View.ANALYSIS ? 2.5 : 2} />
          <span className="text-[9px] font-medium">IA</span>
        </button>
      </nav>

      {/* Forms & Overlays */}
      
      {isProductFormOpen && (
        <ProductForm 
          initialProduct={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => setIsProductFormOpen(false)}
          suppliers={suppliers}
        />
      )}

      {isSupplierFormOpen && (
        <SupplierForm
            initialSupplier={editingSupplier}
            onSave={handleSaveSupplier}
            onCancel={() => setIsSupplierFormOpen(false)}
        />
      )}

      {isPOSOpen && (
        <POS
            products={products}
            onCompleteSale={handleCompleteSale}
            onCancel={() => setIsPOSOpen(false)}
            isDark={isDark}
        />
      )}

      {isExpenseFormOpen && (
        <ExpenseForm
            onSave={handleSaveExpense}
            onCancel={() => setIsExpenseFormOpen(false)}
        />
      )}

      {isDataManagementOpen && (
          <DataManagement 
             products={products}
             onImport={handleImportProducts}
             onClose={() => setIsDataManagementOpen(false)}
          />
      )}
    </div>
  );
}
