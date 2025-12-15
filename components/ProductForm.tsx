
import React, { useState, useEffect } from 'react';
import { trackEvent } from '../services/analyticsService';
import { Product, Category, Supplier, ProductSupplierInfo } from '../types';
import { suggestProductDetails } from '../services/geminiService';
import { formatCurrency } from '../constants';
import { Sparkles, Save, X, Loader2, Calendar, Truck, Plus, Trash2, ScanLine } from 'lucide-react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface ProductFormProps {
  initialProduct?: Product | null;
  onSave: (product: Product) => void;
  onCancel: () => void;
  suppliers?: Supplier[]; 
  initialBarcode?: string; // Allow pre-filling barcode from scan
}

const ProductForm: React.FC<ProductFormProps> = ({ initialProduct, onSave, onCancel, suppliers = [], initialBarcode = '' }) => {
  const [name, setName] = useState(initialProduct?.name || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [category, setCategory] = useState<Category>(initialProduct?.category || Category.ALMACEN);
  const [price, setPrice] = useState(initialProduct?.price?.toString() || '');
  const [cost, setCost] = useState(initialProduct?.cost?.toString() || '');
  const [stock, setStock] = useState(initialProduct?.stock?.toString() || '');
  const [minStock, setMinStock] = useState(initialProduct?.minStock?.toString() || '5');
  const [barcode, setBarcode] = useState(initialProduct?.barcode || initialBarcode);
  const [productSuppliers, setProductSuppliers] = useState<ProductSupplierInfo[]>(initialProduct?.suppliers || []);
  
  const [expirationDate, setExpirationDate] = useState(
    initialProduct?.expirationDate 
      ? new Date(initialProduct.expirationDate).toISOString().split('T')[0] 
      : ''
  );
  
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [supplierCost, setSupplierCost] = useState('');
  
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  useEffect(() => {
    let scanner: any = null;
    if (isScannerOpen) {
        scanner = new Html5QrcodeScanner(
            "reader-form", 
            { fps: 10, qrbox: { width: 250, height: 250 } },
            false
        );
        scanner.render((decodedText: string) => {
            setBarcode(decodedText);
            setIsScannerOpen(false);
            scanner.clear();
        }, (error: any) => {
            // Ignore scan errors
        });
    }
    return () => {
        if (scanner) { try { scanner.clear(); } catch (e) {} }
    };
  }, [isScannerOpen]);

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
      expirationDate: expirationDate ? new Date(expirationDate).getTime() : undefined,
      lastUpdated: Date.now(),
      suppliers: productSuppliers,
      barcode
    };
    onSave(newProduct);
    try {
      trackEvent('product_added', { productName: newProduct.name, category: newProduct.category });
    } catch {}
  };

  const handleAddSupplier = () => {
    if (selectedSupplierId && supplierCost) {
      const exists = productSuppliers.find(ps => ps.supplierId === selectedSupplierId);
      const newInfo: ProductSupplierInfo = {
        supplierId: selectedSupplierId,
        cost: parseFloat(supplierCost),
        lastPurchaseDate: Date.now()
      };

      if (exists) {
        setProductSuppliers(productSuppliers.map(ps => ps.supplierId === selectedSupplierId ? newInfo : ps));
      } else {
        setProductSuppliers([...productSuppliers, newInfo]);
      }
      setSelectedSupplierId('');
      setSupplierCost('');
    }
  };

  const handleRemoveSupplier = (sId: string) => {
    setProductSuppliers(productSuppliers.filter(ps => ps.supplierId !== sId));
  };

  const handleAIAssist = async () => {
    if (!name || name.length < 3) return;
    setIsLoadingAI(true);
    try {
      const suggestion = await suggestProductDetails(name);
      if (suggestion.description) setDescription(suggestion.description);
      if (suggestion.suggestedPrice) setPrice(suggestion.suggestedPrice.toString());
      
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
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-[95vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up transition-colors duration-300">
        
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
          
          {/* Barcode Scanner Modal */}
          {isScannerOpen && (
              <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-xl mb-4 relative">
                   <button 
                        onClick={() => setIsScannerOpen(false)} 
                        className="absolute top-2 right-2 p-1 bg-white dark:bg-slate-700 rounded-full z-10"
                    >
                        <X size={16} />
                    </button>
                   <div id="reader-form" className="rounded-lg overflow-hidden"></div>
                   <p className="text-center text-xs mt-2 text-slate-500">Apunta al código de barras</p>
              </div>
          )}

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Código de Barras</label>
             <div className="flex gap-2">
                 <input 
                    type="text"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    className="flex-1 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Escanear o escribir..."
                 />
                 <button 
                    type="button"
                    onClick={() => setIsScannerOpen(true)}
                    className="bg-slate-800 dark:bg-slate-700 text-white px-3 rounded-lg flex items-center justify-center hover:opacity-90 transition-opacity"
                 >
                    <ScanLine size={20} />
                 </button>
             </div>
          </div>

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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Costo Base (ARS)</label>
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

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Calendar size={14} /> Fecha de Vencimiento <span className="text-slate-400 font-normal">(Opcional)</span>
             </label>
             <input
               type="date"
               value={expirationDate}
               onChange={(e) => setExpirationDate(e.target.value)}
               className="w-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
             />
          </div>

          {/* Supplier Price Comparison Section */}
          <div className="border-t border-slate-100 dark:border-slate-800 pt-4 mt-2">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 mb-2 flex items-center gap-2">
              <Truck size={16} /> Costos por Proveedor
            </h3>
            
            {/* Add Supplier inputs */}
            <div className="flex gap-2 mb-3">
              <select 
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="flex-1 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2 py-2"
              >
                <option value="">Seleccionar Proveedor</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <input 
                type="number"
                value={supplierCost}
                onChange={(e) => setSupplierCost(e.target.value)}
                placeholder="Costo"
                className="w-20 text-sm border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-lg px-2 py-2"
              />
              <button 
                type="button"
                onClick={handleAddSupplier}
                disabled={!selectedSupplierId || !supplierCost}
                className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300 p-2 rounded-lg disabled:opacity-50"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* List of linked suppliers */}
            {productSuppliers.length > 0 ? (
              <div className="space-y-2">
                {productSuppliers.map((ps, index) => {
                  const sName = suppliers.find(s => s.id === ps.supplierId)?.name || 'Desconocido';
                  const isCheapest = productSuppliers.every(other => other.cost >= ps.cost);
                  return (
                    <div key={index} className={`flex justify-between items-center p-2 rounded-lg text-sm border ${isCheapest ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' : 'bg-slate-50 border-slate-100 dark:bg-slate-800 dark:border-slate-700'}`}>
                      <div>
                        <span className="font-medium text-slate-800 dark:text-slate-200">{sName}</span>
                        {isCheapest && <span className="ml-2 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">Mejor Precio</span>}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(ps.cost)}</span>
                        <button 
                          type="button"
                          onClick={() => handleRemoveSupplier(ps.supplierId)}
                          className="text-slate-400 hover:text-red-500"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
               <p className="text-xs text-slate-400 italic">No hay proveedores asignados.</p>
            )}
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
