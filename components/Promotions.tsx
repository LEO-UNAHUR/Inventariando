
import React, { useState } from 'react';
import { Promotion, PromotionType, Product } from '../types';
import { Tag, Plus, Trash2, X, Save, Percent, ShoppingBag, Layers, Sun, Moon } from 'lucide-react';

interface PromotionsProps {
  promotions: Promotion[];
  products: Product[];
  onAddPromotion: (promo: Promotion) => void;
  onDeletePromotion: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const Promotions: React.FC<PromotionsProps> = ({ promotions, products, onAddPromotion, onDeletePromotion, isDark, onToggleTheme }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [type, setType] = useState<PromotionType>(PromotionType.PERCENTAGE);
  const [targetProductId, setTargetProductId] = useState('');
  const [value, setValue] = useState('');
  const [m, setM] = useState('2'); // Buy 2
  const [n, setN] = useState('1'); // Pay 1
  const [minQuantity, setMinQuantity] = useState('3');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetProductId) return alert("Selecciona un producto");

    const newPromo: Promotion = {
        id: crypto.randomUUID(),
        name,
        type,
        targetProductId,
        value: parseFloat(value) || 0,
        m: type === PromotionType.M_X_N ? parseInt(m) : undefined,
        n: type === PromotionType.M_X_N ? parseInt(n) : undefined,
        minQuantity: type === PromotionType.BULK ? parseInt(minQuantity) : undefined,
        active: true
    };

    onAddPromotion(newPromo);
    setIsFormOpen(false);
    // Reset
    setName('');
    setTargetProductId('');
    setValue('');
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Header */}
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Tag className="text-pink-500" /> Ofertas
        </h1>
        <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {promotions.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                  <Tag size={48} className="mx-auto mb-3 opacity-20" />
                  <p>No hay promociones activas.</p>
              </div>
          ) : (
              promotions.map(promo => {
                  const product = products.find(p => p.id === promo.targetProductId);
                  return (
                      <div key={promo.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                          <div>
                              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                  {promo.name}
                                  <span className="text-[10px] bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300 px-2 py-0.5 rounded-full uppercase">
                                      {promo.type}
                                  </span>
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {product?.name || 'Producto desconocido'}
                              </p>
                              <p className="text-xs text-slate-400 mt-1">
                                  {promo.type === PromotionType.PERCENTAGE && `${promo.value}% de descuento`}
                                  {promo.type === PromotionType.M_X_N && `Llevas ${promo.m} pagas ${promo.n}`}
                                  {promo.type === PromotionType.BULK && `Llevando +${promo.minQuantity} u., precio: $${promo.value}`}
                              </p>
                          </div>
                          <button onClick={() => onDeletePromotion(promo.id)} className="p-2 text-slate-400 hover:text-red-500">
                              <Trash2 size={18} />
                          </button>
                      </div>
                  );
              })
          )}
      </div>

      {/* FAB */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-24 right-6 bg-pink-600 hover:bg-pink-700 text-white p-4 rounded-2xl shadow-lg shadow-pink-600/30 transition-all hover:scale-105 active:scale-95 z-20"
      >
        <Plus size={28} />
      </button>

      {/* Modal Form */}
      {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
              <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                      <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100">Nueva Promoción</h2>
                      <button onClick={() => setIsFormOpen(false)}><X size={24} className="text-slate-400" /></button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="p-4 space-y-4">
                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre Oferta</label>
                          <input 
                            type="text" 
                            placeholder="Ej: Promo Verano" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 dark:text-white"
                            required
                          />
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Producto</label>
                          <select 
                            value={targetProductId}
                            onChange={(e) => setTargetProductId(e.target.value)}
                            className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 dark:text-white"
                            required
                          >
                              <option value="">Seleccionar...</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                          </select>
                      </div>

                      <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Promo</label>
                          <div className="grid grid-cols-3 gap-2">
                              {Object.values(PromotionType).map(t => (
                                  <button
                                    type="button"
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`p-2 rounded-lg text-xs font-bold border ${type === t ? 'bg-pink-100 border-pink-500 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300' : 'bg-slate-50 border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'}`}
                                  >
                                      {t}
                                  </button>
                              ))}
                          </div>
                      </div>

                      {/* Conditional Fields */}
                      {type === PromotionType.PERCENTAGE && (
                          <div className="flex items-center gap-2">
                              <div className="flex-1">
                                  <label className="text-xs text-slate-500 mb-1 block">Porcentaje Descuento</label>
                                  <div className="relative">
                                      <Percent size={16} className="absolute left-3 top-2.5 text-slate-400" />
                                      <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full pl-9 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 dark:text-white" placeholder="20" required />
                                  </div>
                              </div>
                          </div>
                      )}

                      {type === PromotionType.M_X_N && (
                          <div className="flex gap-4 items-center">
                              <div className="flex-1">
                                  <label className="text-xs text-slate-500 mb-1 block">Llevas (M)</label>
                                  <input type="number" value={m} onChange={e => setM(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 dark:text-white" />
                              </div>
                              <span className="text-slate-400 font-bold text-xl pt-4">x</span>
                              <div className="flex-1">
                                  <label className="text-xs text-slate-500 mb-1 block">Pagas (N)</label>
                                  <input type="number" value={n} onChange={e => setN(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 dark:text-white" />
                              </div>
                          </div>
                      )}

                      {type === PromotionType.BULK && (
                          <div className="flex gap-4">
                              <div className="flex-1">
                                  <label className="text-xs text-slate-500 mb-1 block">Cant. Mínima</label>
                                  <input type="number" value={minQuantity} onChange={e => setMinQuantity(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 dark:text-white" />
                              </div>
                              <div className="flex-1">
                                  <label className="text-xs text-slate-500 mb-1 block">Precio Unitario Nuevo</label>
                                  <input type="number" value={value} onChange={e => setValue(e.target.value)} className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg p-2 dark:text-white" placeholder="$$$" required />
                              </div>
                          </div>
                      )}

                      <button type="submit" className="w-full bg-pink-600 hover:bg-pink-700 text-white py-3 rounded-xl font-bold mt-4 flex items-center justify-center gap-2">
                          <Save size={20} /> Guardar Promoción
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default Promotions;
