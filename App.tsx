
import React, { useState, useEffect } from 'react';
import { initAnalytics, trackEvent } from './services/analyticsService';
import { 
  Product, User, View, Role, Sale, Customer, Supplier, 
  Expense, Promotion, StockMovement, MovementType, Category
} from './types';
import { 
  getStoredProducts, saveStoredProducts, 
  getStoredUsers, saveStoredUsers,
  getStoredSales, saveStoredSales,
  getStoredSuppliers, saveStoredSuppliers,
  getStoredCustomers, saveStoredCustomers,
  getStoredExpenses, saveStoredExpenses,
  getStoredPromotions, saveStoredPromotions,
  getStoredMovements, saveStoredMovements
} from './services/storageService';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard';
import InventoryList from './components/InventoryList';
import ProductForm from './components/ProductForm';
import POS from './components/POS';
import SalesDashboard from './components/SalesDashboard';
import StockHistory from './components/StockHistory';
import FinancialAnalysis from './components/FinancialAnalysis';
import SupplierList from './components/SupplierList';
import SupplierForm from './components/SupplierForm';
import CustomerList from './components/CustomerList';
import CustomerForm from './components/CustomerForm';
import Promotions from './components/Promotions';
import OnboardingTour from './components/OnboardingTour';
import AIAssistant from './components/AIAssistant';
import SecurityPanel from './components/SecurityPanel';
import TeamManagement from './components/TeamManagement';
import UserProfile from './components/UserProfile';
import DataManagement from './components/DataManagement';
import Sidebar from './components/Sidebar';
import ExpenseForm from './components/ExpenseForm';
import FeedbackWidget from './components/FeedbackWidget';
import UserSettings from './components/UserSettings';
import { Menu, LayoutDashboard, PackageSearch, ShoppingBag, Users } from 'lucide-react';

const App: React.FC = () => {
  // -- Auth State --
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // -- View State --
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
    const [isDesktop, setIsDesktop] = useState<boolean>(() => {
        if (typeof window === 'undefined') return false;
        return window.matchMedia('(min-width: 1024px)').matches;
    });

  // -- Data State --
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  // -- Modal / Form States --
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newProductBarcode, setNewProductBarcode] = useState<string>('');

  const [showSupplierForm, setShowSupplierForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [showCustomerForm, setShowCustomerForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDataManagement, setShowDataManagement] = useState(false);
  const [showUserSettings, setShowUserSettings] = useState(false);
  const [showTour, setShowTour] = useState(false);

  // -- Initialization --
  useEffect(() => {
        // Init analytics with env if present (Phase 1 - Beta.1)
        const endpoint = (import.meta as any)?.env?.VITE_ANALYTICS_ENDPOINT;
        const apiKey = (import.meta as any)?.env?.VITE_ANALYTICS_API_KEY;
        initAnalytics({ enabled: !!endpoint && !!apiKey, endpoint, apiKey });
        trackEvent('app_opened');

    setProducts(getStoredProducts());
    setUsers(getStoredUsers());
    setSales(getStoredSales());
    setSuppliers(getStoredSuppliers());
    setCustomers(getStoredCustomers());
    setExpenses(getStoredExpenses());
    setPromotions(getStoredPromotions());
    setMovements(getStoredMovements());
    
    // Check system preference for theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setIsDark(true);
    }

        const mq = window.matchMedia('(min-width: 1024px)');
        const handler = (e: MediaQueryListEvent) => {
            setIsDesktop(e.matches);
        };
        setIsDesktop(mq.matches);
        mq.addEventListener('change', handler);
        return () => mq.removeEventListener('change', handler);
  }, []);

    useEffect(() => {
        if (isDesktop) {
            setIsSidebarOpen(true);
        }
    }, [isDesktop]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

    // Track feature access on navigation (Phase 1 - Beta.1)
    useEffect(() => {
        if (currentUser) {
            trackEvent('feature_accessed', { view: currentView });
        }
    }, [currentView, currentUser]);

  // -- Data Handlers --

  const handleUpdateProducts = (updatedProducts: Product[]) => {
      setProducts(updatedProducts);
      saveStoredProducts(updatedProducts);
  };

  const handleSaveProduct = (product: Product) => {
    const exists = products.find(p => p.id === product.id);
    let newProducts = [];
    if (exists) {
      newProducts = products.map(p => p.id === product.id ? product : p);
      // Log movement if stock changed manually? Usually handled by specific adjustments, but basic edit:
      if (exists.stock !== product.stock) {
          const diff = product.stock - exists.stock;
          logMovement(product.id, product.name, MovementType.ADJUSTMENT, diff, 'Ajuste manual en edición');
      }
            try {
                const stockDiff = product.stock - exists.stock;
                trackEvent('inventory_updated', {
                    productId: product.id,
                    name: product.name,
                    stockDiff,
                    priceChanged: exists.price !== product.price,
                    costChanged: exists.cost !== product.cost,
                });
            } catch {}
    } else {
      newProducts = [...products, product];
      logMovement(product.id, product.name, MovementType.IN, product.stock, 'Inventario Inicial');
    }
    handleUpdateProducts(newProducts);
    setShowProductForm(false);
    setEditingProduct(null);
    setNewProductBarcode('');
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('¿Eliminar producto?')) {
        const newProducts = products.filter(p => p.id !== id);
        handleUpdateProducts(newProducts);
    }
  };

  const logMovement = (productId: string, productName: string, type: MovementType, quantity: number, reason: string) => {
      const movement: StockMovement = {
          id: crypto.randomUUID(),
          productId,
          productName,
          type,
          quantity,
          date: Date.now(),
          reason,
          userId: currentUser?.id,
          userName: currentUser?.name
      };
      const newMovements = [...movements, movement];
      setMovements(newMovements);
      saveStoredMovements(newMovements);
  };

  const handleCompleteSale = (sale: Sale, updatedCustomer?: Customer) => {
      // 1. Save Sale
      const newSales = [...sales, sale];
      setSales(newSales);
      saveStoredSales(newSales);

            // Analytics: sale completed
            try {
                    trackEvent('sale_completed', {
                        total: sale.total,
                        items: sale.items?.reduce((acc, i) => acc + i.quantity, 0) || 0,
                        paymentMethod: sale.paymentMethod,
                        hasCustomer: !!sale.customerId,
                        fiscalType: sale.fiscalType,
                    });
            } catch {}

      // 2. Update Stock & Log Movements
      let currentProducts = [...products];
      sale.items.forEach(item => {
          const productIndex = currentProducts.findIndex(p => p.id === item.productId);
          if (productIndex > -1) {
              const p = currentProducts[productIndex];
              currentProducts[productIndex] = { ...p, stock: p.stock - item.quantity };
              logMovement(p.id, p.name, MovementType.OUT, -item.quantity, `Venta #${sale.id.slice(0,4)}`);
          }
      });
      handleUpdateProducts(currentProducts);

      // 3. Update Customer if needed
      if (updatedCustomer) {
          handleSaveCustomer(updatedCustomer);
      }

      setCurrentView(View.SALES); // Return to sales dashboard? Or stay in POS?
      // Usually POS closes itself or resets. The POS component handles internal reset or close via onCompleteSale callback logic if needed.
      // Here we assume POS view is active.
  };

  const handleSaveSupplier = (supplier: Supplier) => {
      const exists = suppliers.find(s => s.id === supplier.id);
      let newSuppliers = [];
      if (exists) {
          newSuppliers = suppliers.map(s => s.id === supplier.id ? supplier : s);
      } else {
          newSuppliers = [...suppliers, supplier];
      }
      setSuppliers(newSuppliers);
      saveStoredSuppliers(newSuppliers);
      setShowSupplierForm(false);
      setEditingSupplier(null);
  };

  const handleDeleteSupplier = (id: string) => {
      if (window.confirm('¿Eliminar proveedor?')) {
          const newSuppliers = suppliers.filter(s => s.id !== id);
          setSuppliers(newSuppliers);
          saveStoredSuppliers(newSuppliers);
      }
  };

  const handleSaveCustomer = (customer: Customer) => {
      const exists = customers.find(c => c.id === customer.id);
      let newCustomers = [];
      if (exists) {
          newCustomers = customers.map(c => c.id === customer.id ? customer : c);
      } else {
          newCustomers = [...customers, customer];
      }
      setCustomers(newCustomers);
      saveStoredCustomers(newCustomers);
      setShowCustomerForm(false);
      setEditingCustomer(null);
  };

  const handleDeleteCustomer = (id: string) => {
      if (window.confirm('¿Eliminar cliente?')) {
          const newCustomers = customers.filter(c => c.id !== id);
          setCustomers(newCustomers);
          saveStoredCustomers(newCustomers);
      }
  };

  const handleSaveExpense = (expense: Expense) => {
      const newExpenses = [...expenses, expense];
      setExpenses(newExpenses);
      saveStoredExpenses(newExpenses);
      setShowExpenseForm(false);
  };

  const handleDeleteExpense = (id: string) => {
      if (window.confirm('¿Eliminar gasto?')) {
          const newExpenses = expenses.filter(e => e.id !== id);
          setExpenses(newExpenses);
          saveStoredExpenses(newExpenses);
      }
  };

  const handleAddPromotion = (promo: Promotion) => {
      const newPromos = [...promotions, promo];
      setPromotions(newPromos);
      saveStoredPromotions(newPromos);
  };

  const handleDeletePromotion = (id: string) => {
      if (window.confirm('¿Eliminar promoción?')) {
          const newPromos = promotions.filter(p => p.id !== id);
          setPromotions(newPromos);
          saveStoredPromotions(newPromos);
      }
  };

  const handleImportData = (newProducts: Product[]) => {
      handleUpdateProducts(newProducts);
      // Also reset movements history as it might be inconsistent with new data
      // For now, let's keep it simple.
  };

  const handleClearData = () => {
      handleUpdateProducts([]);
      setSales([]); saveStoredSales([]);
      setMovements([]); saveStoredMovements([]);
      // Maybe clear others too if requested
  };

  // -- User Management --
  const handleAddUser = (user: User) => {
      const newUsers = [...users, user];
      setUsers(newUsers);
      saveStoredUsers(newUsers);
  };

  const handleUpdateUser = (user: User) => {
      const newUsers = users.map(u => u.id === user.id ? user : u);
      setUsers(newUsers);
      saveStoredUsers(newUsers);
      if (currentUser?.id === user.id) {
          setCurrentUser(user);
      }
  };

  const handleDeleteUser = (id: string) => {
      if (window.confirm('¿Eliminar usuario?')) {
          const newUsers = users.filter(u => u.id !== id);
          setUsers(newUsers);
          saveStoredUsers(newUsers);
      }
  };

  // -- Views Rendering --

  if (!currentUser) {
      return <LoginScreen users={users} onLogin={setCurrentUser} isDark={isDark} />;
  }

  const renderContent = () => {
      switch (currentView) {
          case View.DASHBOARD:
              return (
                <Dashboard 
                    products={products} 
                    isDark={isDark} 
                    onToggleTheme={() => setIsDark(!isDark)}
                    onOpenDataManagement={() => setShowDataManagement(true)}
                    onNavigate={setCurrentView}
                    onShowTour={() => setShowTour(true)}
                    onHideTour={() => setShowTour(false)}
                />
              );
          case View.INVENTORY:
              return (
                  <InventoryList 
                      products={products} 
                      onEdit={(p) => { setEditingProduct(p); setShowProductForm(true); }}
                      onDelete={handleDeleteProduct}
                      onAdd={(barcode) => { setEditingProduct(null); setNewProductBarcode(barcode || ''); setShowProductForm(true); }}
                      isDark={isDark}
                      onToggleTheme={() => setIsDark(!isDark)}
                  />
              );
          case View.SALES:
              return (
                  <SalesDashboard 
                    sales={sales} 
                    onNewSale={() => setCurrentView(View.POS)} // Temporary switch to POS view
                    isDark={isDark} 
                    onToggleTheme={() => setIsDark(!isDark)}
                  />
              );
          case View.POS:
              // POS is handled as a view here, but it looks like a modal in its own component sometimes. 
              // Based on Sidebar navigation, it's a main view.
              return (
                  <POS 
                      products={products} 
                      customers={customers}
                      promotions={promotions}
                      onCompleteSale={handleCompleteSale}
                      onCancel={() => setCurrentView(View.SALES)} // Go back to dashboard
                      isDark={isDark}
                  />
              );
          case View.CUSTOMERS:
              return (
                  <CustomerList 
                      customers={customers} 
                      sales={sales}
                      onAdd={() => { setEditingCustomer(null); setShowCustomerForm(true); }}
                      onEdit={(c) => { setEditingCustomer(c); setShowCustomerForm(true); }}
                      onDelete={handleDeleteCustomer}
                      isDark={isDark}
                      onToggleTheme={() => setIsDark(!isDark)}
                  />
              );
          case View.SUPPLIERS:
              return (
                  <SupplierList 
                      suppliers={suppliers} 
                      onAdd={() => { setEditingSupplier(null); setShowSupplierForm(true); }}
                      onEdit={(s) => { setEditingSupplier(s); setShowSupplierForm(true); }}
                      onDelete={handleDeleteSupplier}
                      isDark={isDark}
                      onToggleTheme={() => setIsDark(!isDark)}
                  />
              );
          case View.FINANCE:
              return (
                  <FinancialAnalysis 
                      products={products} 
                      sales={sales} 
                      expenses={expenses}
                      onAddExpense={() => setShowExpenseForm(true)}
                      onDeleteExpense={handleDeleteExpense}
                      isDark={isDark}
                      onToggleTheme={() => setIsDark(!isDark)}
                      onUpdatePrices={handleUpdateProducts}
                  />
              );
          case View.ANALYSIS:
              return <AIAssistant products={products} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />;
          case View.HISTORY: // Not in sidebar but good to have
              return <StockHistory movements={movements} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />;
          case View.PROMOTIONS:
              return (
                  <Promotions 
                      promotions={promotions} 
                      products={products} 
                      onAddPromotion={handleAddPromotion} 
                      onDeletePromotion={handleDeletePromotion}
                      isDark={isDark}
                      onToggleTheme={() => setIsDark(!isDark)}
                  />
              );
          case View.SECURITY:
              return <SecurityPanel user={currentUser} isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />;
          case View.TEAM:
              return (
                  <TeamManagement 
                      users={users} 
                      onAddUser={handleAddUser}
                      onUpdateUser={handleUpdateUser}
                      onDeleteUser={handleDeleteUser}
                      currentUser={currentUser}
                      isDark={isDark}
                      onToggleTheme={() => setIsDark(!isDark)}
                  />
              );
          case View.PROFILE:
              return <UserProfile user={currentUser} onUpdateUser={handleUpdateUser} isDark={isDark} />;
          default:
              return (
                <Dashboard 
                    products={products} 
                    isDark={isDark} 
                    onToggleTheme={() => setIsDark(!isDark)}
                    onOpenDataManagement={() => setShowDataManagement(true)}
                    onNavigate={setCurrentView}
                />
              );
      }
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar 
          isOpen={isSidebarOpen} 
          onClose={() => setIsSidebarOpen(false)} 
          onNavigate={setCurrentView} 
          currentView={currentView}
          currentUser={currentUser}
          onLogout={() => setCurrentUser(null)}
          onOpenDataManagement={() => setShowDataManagement(true)}
          onOpenUserSettings={() => setShowUserSettings(true)}
          isDark={isDark}
          isDesktop={isDesktop}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full w-full relative">
          
          {/* Mobile Top Bar (Only visible if not in POS/Fullscreen modes ideally, but keeping simple) */}
          {currentView !== View.POS && (
             <div className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                 <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-300">
                     <Menu size={24} />
                 </button>
                 <span className="font-bold text-lg text-slate-800 dark:text-slate-100">Inventariando</span>
                 <div className="w-8"></div> {/* Spacer */}
             </div>
          )}

          {/* View Content */}
          <main className="flex-1 overflow-hidden relative">
              {renderContent()}
          </main>

          {/* Bottom Navigation (Mobile) */}
                    {currentView !== View.POS && (
                        <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around items-center h-16 pb-safe z-30">
                <button 
                  onClick={() => setCurrentView(View.DASHBOARD)}
                  className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.DASHBOARD ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <div className={`p-1.5 rounded-xl ${currentView === View.DASHBOARD ? 'bg-blue-100 dark:bg-blue-900/40' : ''}`}>
                    <LayoutDashboard size={22} strokeWidth={currentView === View.DASHBOARD ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium">Inicio</span>
                </button>

                <button 
                  onClick={() => setCurrentView(View.INVENTORY)}
                  className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.INVENTORY ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <div className={`p-1.5 rounded-xl ${currentView === View.INVENTORY ? 'bg-blue-100 dark:bg-blue-900/40' : ''}`}>
                    <PackageSearch size={22} strokeWidth={currentView === View.INVENTORY ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium">Stock</span>
                </button>

                <button 
                  onClick={() => setCurrentView(View.SALES)}
                  className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.SALES ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <div className={`p-1.5 rounded-xl ${currentView === View.SALES ? 'bg-blue-100 dark:bg-blue-900/40' : ''}`}>
                     <ShoppingBag size={22} strokeWidth={currentView === View.SALES ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium">Ventas</span>
                </button>

                <button 
                  onClick={() => setCurrentView(View.CUSTOMERS)}
                  className={`flex-1 flex flex-col items-center justify-center h-full space-y-1 ${currentView === View.CUSTOMERS ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`}
                >
                  <div className={`p-1.5 rounded-xl ${currentView === View.CUSTOMERS ? 'bg-blue-100 dark:bg-blue-900/40' : ''}`}>
                     <Users size={22} strokeWidth={currentView === View.CUSTOMERS ? 2.5 : 2} />
                  </div>
                  <span className="text-[10px] font-medium">Clientes</span>
                </button>
            </div>
          )}

      </div>

      {/* Modals */}
      {showProductForm && (
          <ProductForm 
              initialProduct={editingProduct} 
              onSave={handleSaveProduct} 
              onCancel={() => setShowProductForm(false)} 
              suppliers={suppliers}
              initialBarcode={newProductBarcode}
          />
      )}

      {showSupplierForm && (
          <SupplierForm
              initialSupplier={editingSupplier}
              onSave={handleSaveSupplier}
              onCancel={() => setShowSupplierForm(false)}
          />
      )}

      {showCustomerForm && (
          <CustomerForm
              initialCustomer={editingCustomer}
              onSave={handleSaveCustomer}
              onCancel={() => setShowCustomerForm(false)}
          />
      )}

      {showExpenseForm && (
          <ExpenseForm
              onSave={handleSaveExpense}
              onCancel={() => setShowExpenseForm(false)}
          />
      )}

      {showDataManagement && (
          <DataManagement 
              products={products} 
              currentUser={currentUser}
              onImport={handleImportData} 
              onClearData={handleClearData} 
              onClose={() => setShowDataManagement(false)} 
          />
      )}

      {showTour && (
          <OnboardingTour 
              open={showTour} 
              onClose={() => setShowTour(false)} 
              onNavigate={setCurrentView} 
          />
      )}

      {showUserSettings && currentUser && (
          <UserSettings 
              user={currentUser}
              isDark={isDark}
              onClose={() => setShowUserSettings(false)}
          />
      )}

            {/* Feedback Widget (floating) */}
            <FeedbackWidget currentView={currentView} />

    </div>
  );
};

export default App;
