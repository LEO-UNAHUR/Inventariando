
import React, { useRef, useState } from 'react';
import { Product, Category } from '../types';
import { Download, Upload, Database, X, Check, AlertTriangle, Save } from 'lucide-react';

interface DataManagementProps {
  products: Product[];
  onImport: (newProducts: Product[]) => void;
  onClose: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ products, onImport, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStats, setImportStats] = useState<{total: number, valid: number} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExportCSV = () => {
    const headers = ['ID', 'Nombre', 'Categoria', 'Precio', 'Costo', 'Stock', 'MinStock', 'Descripcion'];
    const rows = products.map(p => [
        p.id,
        `"${p.name.replace(/"/g, '""')}"`, // Escape quotes
        p.category,
        p.price,
        p.cost,
        p.stock,
        p.minStock,
        `"${p.description.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `inventario_completo_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
      const jsonString = JSON.stringify(products, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `backup_inventario_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      
      reader.onload = (event) => {
          try {
              const text = event.target?.result as string;
              let parsedProducts: Product[] = [];

              if (file.name.endsWith('.json')) {
                  parsedProducts = JSON.parse(text);
              } else if (file.name.endsWith('.csv')) {
                  // Basic CSV Parser
                  const lines = text.split('\n').filter(l => l.trim());
                  // Skip header if it looks like header
                  const startIdx = lines[0].toLowerCase().includes('precio') ? 1 : 0;
                  
                  for (let i = startIdx; i < lines.length; i++) {
                      // Very simple CSV split, not handling quoted commas perfectly for simplicity
                      // In real app, use a CSV library
                      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                      if (cols.length < 4) continue;

                      // Map common columns based on position (assume template matches export)
                      // Format: ID, Name, Category, Price, Cost, Stock, MinStock, Desc
                      const category = Object.values(Category).find(c => c === cols[2]) || Category.OTROS;

                      parsedProducts.push({
                          id: cols[0] || crypto.randomUUID(),
                          name: cols[1] || 'Producto Importado',
                          category: category as Category,
                          price: parseFloat(cols[3]) || 0,
                          cost: parseFloat(cols[4]) || 0,
                          stock: parseInt(cols[5]) || 0,
                          minStock: parseInt(cols[6]) || 5,
                          description: cols[7] || '',
                          lastUpdated: Date.now()
                      });
                  }
              }

              if (parsedProducts.length > 0) {
                  onImport(parsedProducts);
                  setImportStats({ total: parsedProducts.length, valid: parsedProducts.length });
                  setError(null);
              } else {
                  setError("No se encontraron productos válidos en el archivo.");
              }
          } catch (err) {
              console.error(err);
              setError("Error al leer el archivo. Verifica el formato.");
          }
      };

      reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Database className="text-blue-600" /> Gestión de Datos
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X size={20} className="text-slate-500" />
                </button>
            </div>

            <div className="p-6 space-y-6">
                
                {/* Export Section */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Exportar (Copia de Seguridad)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleExportCSV}
                            className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Download size={24} className="text-emerald-500 mb-2" />
                            <span className="text-sm font-medium">Excel / CSV</span>
                        </button>
                        <button 
                            onClick={handleExportJSON}
                            className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Save size={24} className="text-blue-500 mb-2" />
                            <span className="text-sm font-medium">Respaldo JSON</span>
                        </button>
                    </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Importar Datos</h3>
                    
                    {!importStats ? (
                        <>
                             <p className="text-xs text-slate-500 mb-2">
                                Soporta archivos .csv y .json. Se agregarán a los productos existentes.
                            </p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-700 p-6 rounded-xl text-slate-500 hover:text-blue-500 hover:border-blue-400 transition-colors"
                            >
                                <Upload size={20} />
                                <span>Seleccionar Archivo</span>
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                className="hidden" 
                                accept=".csv,.json"
                            />
                            {error && (
                                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                                    <AlertTriangle size={16} /> {error}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl text-center">
                            <div className="inline-block p-3 bg-emerald-100 dark:bg-emerald-800 rounded-full text-emerald-600 dark:text-emerald-200 mb-2">
                                <Check size={24} />
                            </div>
                            <p className="font-bold text-emerald-700 dark:text-emerald-300">Importación Exitosa</p>
                            <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                Se han procesado {importStats.total} productos.
                            </p>
                            <button 
                                onClick={onClose}
                                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium"
                            >
                                Finalizar
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    </div>
  );
};

export default DataManagement;
