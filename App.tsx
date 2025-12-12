
import React, { useState, useEffect } from 'react';
import { Product, View, StockMovement, MovementType, Supplier, Sale, Expense, User, Role, Customer, Promotion } from './types';
import { getStoredProducts, saveStoredProducts, getStoredMovements, saveStoredMovements, getStoredSuppliers, saveStoredSuppliers, getStoredSales, saveStoredSales, getStoredExpenses, saveStoredExpenses, getStoredCustomers, saveStoredCustomers, getStoredPromotions, saveStoredPromotions } from './services/storageService';
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
import NetworkStatus from './components/NetworkStatus';
import LoginScreen from './components/LoginScreen';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import Promotions from './components/Promotions';
import SecurityPanel from './components/SecurityPanel';
import { LayoutDashboard, PackageSearch, Sparkles, Truck, DollarSign, ShoppingBag, Download, Users, LogOut, Tag, Shield } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  
  // Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [scannedBarcodeForNew, setScannedBarcodeForNew] = useState('');
  
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isCustomerFormOpen, setIsCustomerFormOpen] = useState(false);
  
  const [isPOSOpen, setIsPOSOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isDataManagementOpen, setIsDataManagementOpen] = useState(false);

  // Network & PWA State
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

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

  // Network Listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Simulate sync
      setIsSyncing(true);
      setTimeout(() => setIsSyncing(false), 2000);
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA Install Prompt Listener
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the install prompt');
        }
        setDeferredPrompt(null);
      });
    }
  };

  // Load data on mount
  useEffect(() => {
    setProducts(getStoredProducts());
    setMovements(getStoredMovements());
    setSuppliers(getStoredSuppliers());
    setSales(getStoredSales());
    setExpenses(getStoredExpenses());
    setCustomers(getStoredCustomers());
    setPromotions(getStoredPromotions());
  }, []);

  // Persist data on change
  useEffect(() => {
    saveStoredProducts(products);
    if (isOnline) {
       const timer = setTimeout(() => {
           setIsSyncing(true);
           setTimeout(() => setIsSyncing(false), 800);
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [products, isOnline]);

  useEffect(() => { saveStoredMovements(movements); }, [movements]);
  useEffect(() => { saveStoredSuppliers(suppliers); }, [suppliers]);
  useEffect(() => { saveStoredSales(sales); }, [sales]);
  useEffect(() => { saveStoredExpenses(expenses); }, [expenses]);
  useEffect(() => { saveStoredCustomers(customers); }, [customers]);
  useEffect(() => { saveStoredPromotions(promotions); }, [promotions]);

  // --- Login Handler ---
  if (!currentUser) {
    return <LoginScreen onLogin={setCurrentUser} isDark={isDark} />;
  }

  // --- Role Check Utilities ---
  const canEditInventory = currentUser.role !== Role.SELLER;
  const canViewFinance = currentUser.role !== Role.SELLER;
  const canViewSuppliers = currentUser.role !== Role.SELLER;
  const canViewAnalysis = currentUser.role !== Role.SELLER;
  const canViewSecurity = currentUser.role === Role.ADMIN;

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
            reason: 'Actualización manual',
            userId: currentUser.id,
            userName: currentUser.name
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
            reason: 'Stock Inicial',
            userId: currentUser.id,
            userName: currentUser.name
        });
      }
      setProducts([...products, product]);
    }

    setMovements(newMovements);
    setIsProductFormOpen(false);
    setEditingProduct(null);
    setScannedBarcodeForNew('');
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
            reason: 'Eliminación de producto',
            userId: currentUser.id,
            userName: currentUser.name
        };
        setMovements([...movements, newMovement]);
      }
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const openAddProductForm = (scannedBarcode?: string) => {
    setEditingProduct(null);
    setScannedBarcodeForNew(scannedBarcode || '');
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (product: Product) => {
    setEditingProduct(product);
    setScannedBarcodeForNew('');
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

  // --- Mass Update Handler ---
  const handleMassPriceUpdate = (updatedProducts: Product[]) => {
      // Create movements for audit logic could be added here if needed
      setProducts(updatedProducts);
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

  // --- Customer Handlers ---
  const handleSaveCustomer = (customer: Customer) => {
      if (editingCustomer) {
          setCustomers(customers.map(c => c.id === customer.id ? customer : c));
      } else {
          setCustomers([...customers, customer]);
      }
      setIsCustomerFormOpen(false);
      setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
      if (window.confirm('¿Eliminar cliente?')) {
          setCustomers(customers.filter(c => c.id !== id));
      }
  };

  const openAddCustomerForm = () => {
      setEditingCustomer(null);
      setIsCustomerFormOpen(true);
  };

  const openEditCustomerForm = (customer: Customer) => {
      setEditingCustomer(customer);
      setIsCustomerFormOpen(true);
  };

  // --- Promotion Handlers ---
  const handleAddPromotion = (promo: Promotion) => {
      setPromotions([...promotions, promo]);
  };

  const handleDeletePromotion = (id: string) => {
      setPromotions(promotions.filter(p => p.id !== id));
  };

  // --- Sales / POS Handlers ---

  const handleNewSale = () => {
    setIsPOSOpen(true);
  };

  const handleCompleteSale = (sale: Sale, updatedCustomer?: Customer) => {
    // 0. Update Customer (if points or balance changed)
    if (updatedCustomer) {
        setCustomers(customers.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    }

    // 1. Add Sale (Audit)
    const saleWithAudit = { 
        ...sale, 
        userId: currentUser.id, 
        userName: currentUser.name 
    };
    setSales([...sales, saleWithAudit]);

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
            reason: `Venta POS #${sale.id.slice(0,4)}`,
            userId: currentUser.id,
            userName: currentUser.name
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
                onOpenDataManagement={canEditInventory ? () => setIsDataManagementOpen(true) : undefined}
            />
        );
      case View.INVENTORY:
        return (
          <InventoryList 
            products={products} 
            onEdit={canEditInventory ? openEditProductForm : () => {}} 
            onDelete={canEditInventory ? handleDeleteProduct : () => {}} 
            onAdd={canEditInventory ? openAddProductForm : () => {}} 
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
                onUpdatePrices={handleMassPriceUpdate}
            />
        );
      case View.ANALYSIS:
        return <AIAssistant products={products} isDark={isDark} onToggleTheme={toggleTheme} />;
      case View.CUSTOMERS:
        return (
            <CustomerList
                customers={customers}
                sales={sales}
                onAdd={openAddCustomerForm}
                onEdit={openEditCustomerForm}
                onDelete={handleDeleteCustomer}
                isDark={isDark}
                onToggleTheme={toggleTheme}
            />
        );
      case View.PROMOTIONS:
        return (
            <Promotions 
                promotions={promotions}
                products={products}
                onAddPromotion={handleAddPromotion}
                onDeletePromotion={handleDeletePromotion}
                isDark={isDark}
                onToggleTheme={toggleTheme}
            />
        );
      case View.SECURITY:
        return (
            <SecurityPanel 
                user={currentUser}
                isDark={isDark}
                onToggleTheme={toggleTheme}
            />
        );
      default:
        return <Dashboard products={products} isDark={isDark} onToggleTheme={toggleTheme} />;
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-slate-50 dark:bg-slate-950 font-sans transition-colors duration-300">
      
      {/* Top Bar for System Status */}
      <div className="flex justify-between items-center px-4 py-1 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[10px] text-slate-500">
         <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider">StockArg v1.2</span>
            <span className="mx-1">•</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{currentUser.name} ({currentUser.role})</span>
            <button onClick={() => setCurrentUser(null)} title="Cerrar Sesión" className="ml-2 hover:text-red-500">
                <LogOut size={10} />
            </button>

            {deferredPrompt && (
                <button 
                    onClick={handleInstallClick}
                    className="flex items-center gap-1 bg-blue-600 text-white px-2 py-0.5 rounded-full hover:bg-blue-700 transition-colors ml-2"
                >
                    <Download size={10} /> App
                </button>
            )}
         </div>
         <NetworkStatus isOnline={isOnline} isSyncing={isSyncing} />
      </div>

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
          onClick={() => setCurrentView(View.PROMOTIONS)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.PROMOTIONS ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Tag size={20} strokeWidth={currentView === View.PROMOTIONS ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Ofertas</span>
        </button>

        <button 
          onClick={() => setCurrentView(View.CUSTOMERS)}
          className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.CUSTOMERS ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
          <Users size={20} strokeWidth={currentView === View.CUSTOMERS ? 2.5 : 2} />
          <span className="text-[9px] font-medium">Clientes</span>
        </button>

        {canViewFinance && (
            <button 
            onClick={() => setCurrentView(View.FINANCE)}
            className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.FINANCE ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
            <DollarSign size={20} strokeWidth={currentView === View.FINANCE ? 2.5 : 2} />
            <span className="text-[9px] font-medium">Finanzas</span>
            </button>
        )}

        {canViewSecurity && (
            <button 
            onClick={() => setCurrentView(View.SECURITY)}
            className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.SECURITY ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
            <Shield size={20} strokeWidth={currentView === View.SECURITY ? 2.5 : 2} />
            <span className="text-[9px] font-medium">Seguridad</span>
            </button>
        )}

        {canViewAnalysis && (
            <button 
            onClick={() => setCurrentView(View.ANALYSIS)}
            className={`flex-1 min-w-[60px] flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.ANALYSIS ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400 dark:text-slate-500'}`}
            >
            <Sparkles size={20} strokeWidth={currentView === View.ANALYSIS ? 2.5 : 2} />
            <span className="text-[9px] font-medium">IA</span>
            </button>
        )}
      </nav>

      {/* Forms & Overlays */}
      
      {isProductFormOpen && (
        <ProductForm 
          initialProduct={editingProduct} 
          onSave={handleSaveProduct} 
          onCancel={() => setIsProductFormOpen(false)}
          suppliers={suppliers}
          initialBarcode={scannedBarcodeForNew}
        />
      )}

      {isSupplierFormOpen && (
        <SupplierForm
            initialSupplier={editingSupplier}
            onSave={handleSaveSupplier}
            onCancel={() => setIsSupplierFormOpen(false)}
        />
      )}

      {isCustomerFormOpen && (
          <CustomerForm
            initialCustomer={editingCustomer}
            onSave={handleSaveCustomer}
            onCancel={() => setIsCustomerFormOpen(false)}
          />
      )}

      {isPOSOpen && (
        <POS
            products={products}
            customers={customers}
            promotions={promotions}
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
