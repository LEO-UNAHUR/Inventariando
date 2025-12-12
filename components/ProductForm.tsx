import React, { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { suggestProductDetails } from '../services/geminiService';
import { Sparkles, Save, X, Loader2 } from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onSave, onCancel }) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [category, setCategory] = useState<Category>(initialProduct?.category || Category.ALMACEN);
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [cost, setCost] = useState(initialProduct?.cost?.toString() || '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '');
  const [minStock, setMinStock] = useState(initialProduct?.minStock?.toString() || '5');
  
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newProduct: Product = {
      id: initialProduct?.id || crypto.randomUUID(),
      name,
      description,
      category,
      price: parseFloat(price) || 0,
      cost: parseFloat(cost) || 0,
      stock: parseInt(stock) || 0,
      minStock: parseInt(minStock) || 0,
      lastUpdated: Date.now(),
    };
    onSave(newProduct);
  };

  const handleAIAssist = async () => {
    if (!name || name.length < 3) return;
    setIsLoadingAI(true);
    try {
      const suggestion = await suggestProductDetails(name);
      if (suggestion.description) setDescription(suggestion.description);
      if (suggestion.suggestedPrice) setPrice(suggestion.suggestedPrice.toString());
      
      // Try to match category enum
      const suggestedCat = Object.values(Category).find(c => 
        c.toLowerCase() === suggestion.category?.toLowerCase()
      );
      if (suggestedCat) setCategory(suggestedCat);
      
    } catch (e) {
      alert("Error al conectar con IA. Verifica tu conexión.");
    } finally {
      setIsLoadingAI(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-[90vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up transition-colors duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialProduct ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          <div className="relative">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre del Producto</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Ej: Yerba Mate..."
                required
              />
              <button 
                type="button"
                onClick={handleAIAssist}
                disabled={isLoadingAI || !name}
                className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 rounded-lg flex items-center justify-center hover:bg-indigo-200 dark:hover:bg-indigo-900/60 disabled:opacity-50 transition-colors"
                title="Completar con IA"
              >
                {isLoadingAI ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Usa la varita mágica para sugerir precio y descripción.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as Category)}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {Object.values(Category).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows={2}
              placeholder="Detalles del producto..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo (ARS)</label>
              <input
                type="number"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Precio Venta (ARS)</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-slate-900 dark:text-slate-100"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Actual</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Stock Mínimo</label>
              <input
                type="number"
                value={minStock}
                onChange={(e) => setMinStock(e.target.value)}
                className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="5"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex gap-3 bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Save size={20} />
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
};

export default ProductForm;