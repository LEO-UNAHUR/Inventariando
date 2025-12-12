
import React, { useState, useMemo } from 'react';
import { Product, SaleItem, Sale, Customer, Promotion, PromotionType } from '../types';
import { formatCurrency } from '../constants';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, Check, CreditCard, Banknote, QrCode, Calculator, Users, Wallet, ChevronRight, Tag, FileText, Smartphone } from 'lucide-react';

interface POSProps {
  products: Product[];
  customers: Customer[];
  promotions?: Promotion[];
  onCompleteSale: (sale: Sale, updatedCustomer?: Customer) => void;
  onCancel: () => void;
  isDark: boolean;
}

const POS: React.FC<POSProps> = ({ products, customers, promotions = [], onCompleteSale, onCancel, isDark }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO' | 'CUENTA_CORRIENTE'>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState('');
  
  // AFIP State
  const [fiscalType, setFiscalType] = useState<'A' | 'B' | 'C' | 'X'>('B');
  const [cuit, setCuit] = useState('');

  // Customer Selection State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');

  // --- Logic: Promotions Engine ---
  // Calculates the cart total applying active promotions
  const calculateCartTotals = useMemo(() => {
      let subtotal = 0;
      let finalTotal = 0;
      let processedCart = cart.map(item => ({ ...item, originalPrice: item.price, appliedPromotion: '' }));

      // Reset items
      processedCart.forEach(item => {
          item.price = products.find(p => p.id === item.productId)?.price || item.price;
      });

      // Apply Promotions
      promotions.filter(p => p.active).forEach(promo => {
          processedCart = processedCart.map(item => {
              if (item.productId === promo.targetProductId) {
                  // Percentage Discount
                  if (promo.type === PromotionType.PERCENTAGE) {
                      item.price = item.originalPrice! * (1 - promo.value / 100);
                      item.appliedPromotion = `${promo.name} (-${promo.value}%)`;
                  }
                  // Bulk Price
                  else if (promo.type === PromotionType.BULK && promo.minQuantity && item.quantity >= promo.minQuantity) {
                      item.price = promo.value;
                      item.appliedPromotion = promo.name;
                  }
                  // MxN (e.g. 2x1)
                  else if (promo.type === PromotionType.M_X_N && promo.m && promo.n) {
                      const sets = Math.floor(item.quantity / promo.m);
                      const remainder = item.quantity % promo.m;
                      const paidQty = (sets * promo.n) + remainder;
                      // Calculate effective unit price
                      const totalCostForItems = paidQty * item.originalPrice!;
                      item.price = totalCostForItems / item.quantity;
                      item.appliedPromotion = promo.name;
                  }
              }
              return item;
          });
      });

      processedCart.forEach(item => {
          subtotal += (item.originalPrice || item.price) * item.quantity;
          finalTotal += item.price * item.quantity;
      });

      return { subtotal, finalTotal, processedItems: processedCart };
  }, [cart, promotions, products]);

  const { subtotal, finalTotal, processedItems } = calculateCartTotals;
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.id.includes(searchTerm)) && 
    p.stock > 0 
  );

  const filteredCustomers = customers.filter(c => 
      c.name.toLowerCase().includes(customerSearch.toLowerCase()) || 
      c.phone.includes(customerSearch)
  );

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item => 
          item.productId === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        ));
      } else {
        alert("Stock insuficiente");
      }
    } else {
      setCart([...cart, {
        productId: product.id,
        productName: product.name,
        quantity: 1,
        price: product.price, // Base price, promos applied later
        cost: product.cost,
        originalPrice: product.price
      }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const item = cart.find(i => i.productId === productId);
    const product = products.find(p => p.id === productId);
    if (!item || !product) return;

    const newQuantity = item.quantity + delta;
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else if (newQuantity <= product.stock) {
      setCart(cart.map(i => i.productId === productId ? { ...i, quantity: newQuantity } : i));
    } else {
      alert("No hay más stock disponible");
    }
  };

  const handleCheckout = () => {
    let updatedCustomer = selectedCustomer ? { ...selectedCustomer } : undefined;

    if (updatedCustomer) {
        const pointsEarned = Math.floor(finalTotal / 1000);
        updatedCustomer.loyaltyPoints = (updatedCustomer.loyaltyPoints || 0) + pointsEarned;
        if (paymentMethod === 'CUENTA_CORRIENTE') {
            updatedCustomer.balance = (updatedCustomer.balance || 0) - finalTotal;
        }
    }

    const sale: Sale = {
      id: crypto.randomUUID(),
      date: Date.now(),
      items: processedItems, // Save items with applied promos
      total: finalTotal,
      profit: processedItems.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0),
      paymentMethod: paymentMethod,
      customerId: selectedCustomer?.id,
      fiscalType: fiscalType
    };
    onCompleteSale(sale, updatedCustomer);
  };

  const handleSelectCustomer = (c: Customer) => {
      setSelectedCustomer(c);
      setShowCustomerSelect(false);
      // Auto-set Invoice Type based on CUIT logic (Simplified)
      if (c.cuit) {
          setFiscalType('A');
          setCuit(c.cuit);
      }
  };

  // Customer Select Modal (Simplified for brevity)
  if (showCustomerSelect) {
      return (
          <div className="fixed inset-0 bg-white dark:bg-slate-950 z-[60] flex flex-col animate-slide-up">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button onClick={() => setShowCustomerSelect(false)}><X size={24} className="text-slate-500" /></button>
                  <input type="text" placeholder="Buscar cliente..." value={customerSearch} onChange={(e) => setCustomerSearch(e.target.value)} className="flex-1 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg outline-none dark:text-white" autoFocus />
              </div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                   <button onClick={() => { setSelectedCustomer(null); setShowCustomerSelect(false); }} className="w-full p-3 text-left font-medium text-slate-500 border-b border-slate-100 dark:border-slate-800">Consumidor Final</button>
                   {filteredCustomers.map(c => (
                       <button key={c.id} onClick={() => handleSelectCustomer(c)} className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                           <div><p className="font-bold text-slate-800 dark:text-slate-100">{c.name}</p><p className="text-xs text-slate-500">{c.phone}</p></div>
                       </button>
                   ))}
              </div>
          </div>
      );
  }

  if (showCheckout) {
    const cashValue = parseFloat(cashReceived) || 0;
    const change = cashValue - finalTotal;

    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-900 z-50 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Finalizar Venta</h2>
          <button onClick={() => setShowCheckout(false)} className="p-2 text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-start space-y-6 overflow-y-auto">
          <div className="text-center w-full">
            <p className="text-slate-500 dark:text-slate-400 mb-1">Total a Pagar</p>
            <p className="text-5xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(finalTotal)}</p>
            {subtotal > finalTotal && (
                <p className="text-pink-500 text-sm font-medium mt-1">Ahorraste {formatCurrency(subtotal - finalTotal)}</p>
            )}
          </div>

          <div className="w-full max-w-sm space-y-4">
             {/* Payment Methods */}
             <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2 block">Método de Pago</label>
                <div className="grid grid-cols-2 gap-3">
                {[
                    { id: 'EFECTIVO', icon: <Banknote size={20} />, label: 'Efectivo' },
                    { id: 'TRANSFERENCIA', icon: <QrCode size={20} />, label: 'MP / QR' },
                    { id: 'DEBITO', icon: <CreditCard size={20} />, label: 'Débito' },
                    { id: 'CREDITO', icon: <CreditCard size={20} />, label: 'Crédito' },
                ].map((m) => (
                    <button key={m.id} onClick={() => setPaymentMethod(m.id as any)} className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${paymentMethod === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}>
                    {m.icon} {m.label}
                    </button>
                ))}
                {selectedCustomer && (
                    <button onClick={() => setPaymentMethod('CUENTA_CORRIENTE')} className={`col-span-2 p-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${paymentMethod === 'CUENTA_CORRIENTE' ? 'bg-purple-600 text-white border-purple-600' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-purple-600 dark:text-purple-400'}`}>
                        <Wallet size={20} /> Cuenta Corriente (Fiado)
                    </button>
                )}
                </div>
             </div>

             {/* AFIP Section */}
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                 <div className="flex items-center gap-2 mb-3">
                     <FileText size={18} className="text-blue-500" />
                     <span className="font-bold text-sm text-slate-700 dark:text-slate-200">Datos Fiscales (AFIP)</span>
                 </div>
                 <div className="flex gap-2">
                     {['B', 'A', 'X'].map(type => (
                         <button 
                            key={type}
                            onClick={() => setFiscalType(type as any)}
                            className={`flex-1 py-1.5 rounded text-xs font-bold border ${fiscalType === type ? 'bg-blue-100 border-blue-300 text-blue-700' : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600'}`}
                         >
                             Factura {type}
                         </button>
                     ))}
                 </div>
                 {fiscalType === 'A' && (
                     <input 
                        type="number" 
                        placeholder="Ingrese CUIT" 
                        value={cuit}
                        onChange={(e) => setCuit(e.target.value)}
                        className="w-full mt-2 p-2 text-sm border rounded bg-white dark:bg-slate-900 dark:border-slate-600 dark:text-white"
                     />
                 )}
             </div>

             {/* Payment Specific Content */}
             {paymentMethod === 'EFECTIVO' && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex gap-4 items-center">
                    <input type="number" placeholder="Recibido" value={cashReceived} onChange={(e) => setCashReceived(e.target.value)} className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-lg" />
                    <div className="text-right">
                        <p className="text-xs text-slate-500">Vuelto</p>
                        <p className={`text-xl font-bold ${change < 0 ? 'text-red-500' : 'text-emerald-500'}`}>{formatCurrency(change > 0 ? change : 0)}</p>
                    </div>
                </div>
             )}

             {paymentMethod === 'TRANSFERENCIA' && (
                 <div className="flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                     <Smartphone size={32} className="text-blue-500 mb-2" />
                     <p className="font-bold text-slate-800 dark:text-white mb-2">Escaneá con Mercado Pago</p>
                     {/* Simulated QR */}
                     <div className="w-32 h-32 bg-slate-200 dark:bg-white p-2 rounded-lg flex items-center justify-center">
                         <QrCode size={100} className="text-black" />
                     </div>
                     <p className="text-xs text-slate-500 mt-2">Alias: NEGOCIO.STOCKARG.MP</p>
                 </div>
             )}
          </div>

          <button onClick={handleCheckout} disabled={paymentMethod === 'EFECTIVO' && cashValue < finalTotal} className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            <Check size={24} /> Confirmar Venta
          </button>
        </div>
      </div>
    );
  }

  // Main POS View (Simplified structure for readability)
  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-40 flex flex-col md:flex-row animate-slide-up">
      {/* Product List */}
      <div className="flex-1 flex flex-col h-[60%] md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
         <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-2 items-center">
            <button onClick={onCancel} className="p-2 mr-2 bg-slate-100 dark:bg-slate-800 rounded-full"><X size={20} className="text-slate-600 dark:text-slate-300" /></button>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100" autoFocus />
            </div>
         </div>
         <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
            {filteredProducts.map(product => {
                // Check if active promotion exists for UI hint
                const hasPromo = promotions.some(pr => pr.active && pr.targetProductId === product.id);
                return (
                    <button key={product.id} onClick={() => addToCart(product)} className={`flex flex-col items-start p-3 bg-white dark:bg-slate-900 border ${hasPromo ? 'border-pink-300 ring-1 ring-pink-100' : 'border-slate-200 dark:border-slate-800'} rounded-xl hover:border-blue-500 transition-colors text-left active:scale-95 relative`}>
                        {hasPromo && <div className="absolute top-2 right-2 text-pink-500"><Tag size={14} fill="currentColor" /></div>}
                        <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 h-10">{product.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{product.stock} disp.</p>
                        <p className="font-bold text-blue-600 dark:text-blue-400 mt-auto">{formatCurrency(product.price)}</p>
                    </button>
                );
            })}
         </div>
      </div>

      {/* Cart */}
      <div className="h-[40%] md:h-full md:w-96 flex flex-col bg-white dark:bg-slate-900">
         <button onClick={() => setShowCustomerSelect(true)} className="p-3 bg-blue-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center">
             <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300"><Users size={18} /><span className="font-semibold text-sm">{selectedCustomer ? selectedCustomer.name : 'Seleccionar Cliente'}</span></div>
             <ChevronRight size={18} className="text-blue-400" />
         </button>
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
             <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2"><ShoppingCart size={20} /> Carrito ({totalItems})</h2>
             <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Vaciar</button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-slate-400"><ShoppingCart size={40} className="mb-2 opacity-20" /><p className="text-sm">Carrito vacío</p></div> : 
                processedItems.map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                         <div className="flex-1">
                             <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.productName}</p>
                             {item.appliedPromotion ? (
                                 <p className="text-xs text-pink-500 font-medium flex items-center gap-1"><Tag size={10} /> {item.appliedPromotion}</p>
                             ) : (
                                 <p className="text-xs text-slate-500">{formatCurrency(item.price)} x {item.quantity}</p>
                             )}
                         </div>
                         <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                             <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><Minus size={14} /></button>
                             <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded"><Plus size={14} /></button>
                         </div>
                         <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </div>
                ))
            }
         </div>
         <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
             <div className="flex justify-between items-end mb-4">
                 <p className="text-slate-500 text-sm">Total</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(finalTotal)}</p>
             </div>
             <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white py-3 rounded-xl font-bold shadow-lg active:scale-95 transition-all flex justify-between px-6 items-center">
                <span>Cobrar</span><span className="bg-blue-500 px-2 py-0.5 rounded text-sm">{formatCurrency(finalTotal)}</span>
             </button>
         </div>
      </div>
    </div>
  );
};

export default POS;
