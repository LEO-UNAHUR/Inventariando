
import React, { useState, useMemo } from 'react';
import { Product, SaleItem, Sale } from '../types';
import { formatCurrency } from '../constants';
import { Search, ShoppingCart, Plus, Minus, Trash2, X, Check, CreditCard, Banknote, QrCode, Calculator } from 'lucide-react';

interface POSProps {
  products: Product[];
  onCompleteSale: (sale: Sale) => void;
  onCancel: () => void;
  isDark: boolean;
}

const POS: React.FC<POSProps> = ({ products, onCompleteSale, onCancel, isDark }) => {
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'EFECTIVO' | 'TRANSFERENCIA' | 'DEBITO' | 'CREDITO'>('EFECTIVO');
  const [cashReceived, setCashReceived] = useState('');

  // Derived state
  const total = useMemo(() => cart.reduce((sum, item) => sum + (item.price * item.quantity), 0), [cart]);
  const totalItems = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  
  const filteredProducts = products.filter(p => 
    (p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     p.id.includes(searchTerm)) && 
    p.stock > 0 // Only show products with stock
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
        price: product.price,
        cost: product.cost
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
    const sale: Sale = {
      id: crypto.randomUUID(),
      date: Date.now(),
      items: cart,
      total: total,
      profit: cart.reduce((sum, item) => sum + ((item.price - item.cost) * item.quantity), 0),
      paymentMethod: paymentMethod
    };
    onCompleteSale(sale);
  };

  if (showCheckout) {
    const cashValue = parseFloat(cashReceived) || 0;
    const change = cashValue - total;

    return (
      <div className="fixed inset-0 bg-white dark:bg-slate-950 z-50 flex flex-col animate-fade-in">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Finalizar Venta</h2>
          <button onClick={() => setShowCheckout(false)} className="p-2 text-slate-500">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
          <div className="text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-1">Total a Pagar</p>
            <p className="text-5xl font-bold text-slate-800 dark:text-slate-100">{formatCurrency(total)}</p>
          </div>

          <div className="w-full max-w-sm space-y-3">
             <label className="text-sm font-medium text-slate-600 dark:text-slate-300">Método de Pago</label>
             <div className="grid grid-cols-2 gap-3">
               {[
                 { id: 'EFECTIVO', icon: <Banknote size={20} />, label: 'Efectivo' },
                 { id: 'TRANSFERENCIA', icon: <QrCode size={20} />, label: 'QR / Transf.' },
                 { id: 'DEBITO', icon: <CreditCard size={20} />, label: 'Débito' },
                 { id: 'CREDITO', icon: <CreditCard size={20} />, label: 'Crédito' },
               ].map((m) => (
                 <button
                   key={m.id}
                   onClick={() => setPaymentMethod(m.id as any)}
                   className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-medium transition-all ${paymentMethod === m.id ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'}`}
                 >
                   {m.icon}
                   {m.label}
                 </button>
               ))}
             </div>
          </div>

          {paymentMethod === 'EFECTIVO' && (
            <div className="w-full max-w-sm bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
               <div className="flex items-center gap-2 mb-2">
                 <Calculator className="text-slate-400" size={18} />
                 <span className="text-sm font-medium">Calculadora de Vuelto</span>
               </div>
               <div className="flex gap-4 items-center">
                 <input 
                    type="number" 
                    placeholder="Recibido"
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-lg"
                 />
                 <div className="text-right">
                    <p className="text-xs text-slate-500">Vuelto</p>
                    <p className={`text-xl font-bold ${change < 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {formatCurrency(change > 0 ? change : 0)}
                    </p>
                 </div>
               </div>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={paymentMethod === 'EFECTIVO' && cashValue < total}
            className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:text-slate-500 text-white py-4 rounded-xl font-bold text-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Check size={24} /> Confirmar Venta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-50 dark:bg-slate-950 z-40 flex flex-col md:flex-row animate-slide-up">
      
      {/* Product List Section */}
      <div className="flex-1 flex flex-col h-[60%] md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800">
         <div className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex gap-2 items-center">
            <button onClick={onCancel} className="p-2 mr-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700">
                <X size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                    autoFocus
                />
            </div>
         </div>
         
         <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 content-start">
            {filteredProducts.map(product => (
                <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="flex flex-col items-start p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 transition-colors text-left active:scale-95"
                >
                    <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-sm line-clamp-2 h-10">{product.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">{product.stock} disp.</p>
                    <p className="font-bold text-blue-600 dark:text-blue-400 mt-auto">{formatCurrency(product.price)}</p>
                </button>
            ))}
         </div>
      </div>

      {/* Cart Section */}
      <div className="h-[40%] md:h-full md:w-96 flex flex-col bg-white dark:bg-slate-900">
         <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
             <h2 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                 <ShoppingCart size={20} /> Carrito ({totalItems})
             </h2>
             <button onClick={() => setCart([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Vaciar</button>
         </div>

         <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <ShoppingCart size={40} className="mb-2 opacity-20" />
                    <p className="text-sm">Carrito vacío</p>
                </div>
            ) : (
                cart.map(item => (
                    <div key={item.productId} className="flex items-center gap-3">
                         <div className="flex-1">
                             <p className="text-sm font-medium text-slate-800 dark:text-slate-100 truncate">{item.productName}</p>
                             <p className="text-xs text-slate-500">{formatCurrency(item.price)} x {item.quantity}</p>
                         </div>
                         <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                             <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm">
                                <Minus size={14} className="text-slate-600 dark:text-slate-300" />
                             </button>
                             <span className="text-sm font-semibold w-4 text-center">{item.quantity}</span>
                             <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:bg-white dark:hover:bg-slate-700 rounded shadow-sm">
                                <Plus size={14} className="text-slate-600 dark:text-slate-300" />
                             </button>
                         </div>
                         <button onClick={() => removeFromCart(item.productId)} className="text-slate-400 hover:text-red-500">
                             <Trash2 size={18} />
                         </button>
                    </div>
                ))
            )}
         </div>

         <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
             <div className="flex justify-between items-end mb-4">
                 <p className="text-slate-500 text-sm">Total</p>
                 <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">{formatCurrency(total)}</p>
             </div>
             <button 
                onClick={() => setShowCheckout(true)}
                disabled={cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex justify-between px-6 items-center"
             >
                <span>Cobrar</span>
                <span className="bg-blue-500 px-2 py-0.5 rounded text-sm">{formatCurrency(total)}</span>
             </button>
         </div>
      </div>
    </div>
  );
};

export default POS;
