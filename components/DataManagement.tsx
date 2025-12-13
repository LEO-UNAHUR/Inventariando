
import React, { useRef, useState, useEffect } from 'react';
import { Product, Category, DataLog } from '../types';
import { getStoredLogs, saveLog } from '../services/storageService';
import { Download, Upload, Database, X, Check, AlertTriangle, Save, FileText, ArrowUp, ArrowDown, Clock, Trash2 } from 'lucide-react';

interface DataManagementProps {
  products: Product[];
  onImport: (newProducts: Product[]) => void;
  onClearData: () => void;
  onClose: () => void;
}

const DataManagement: React.FC<DataManagementProps> = ({ products, onImport, onClearData, onClose }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStats, setImportStats] = useState<{total: number, valid: number} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<DataLog[]>([]);

  useEffect(() => {
      setLogs(getStoredLogs());
  }, []);

  const handleExportCSV = () => {
    const fileName = `inventario_completo_${new Date().toISOString().split('T')[0]}.csv`;
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
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Log Export
    const log: DataLog = {
        id: crypto.randomUUID(),
        type: 'EXPORT',
        fileName: fileName,
        date: Date.now(),
        recordCount: products.length,
        format: 'CSV'
    };
    saveLog(log);
    setLogs([log, ...logs]);
  };

  const handleExportJSON = () => {
      const fileName = `backup_inventario_${new Date().toISOString().split('T')[0]}.json`;
      const jsonString = JSON.stringify(products, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Log Export
      const log: DataLog = {
        id: crypto.randomUUID(),
        type: 'EXPORT',
        fileName: fileName,
        date: Date.now(),
        recordCount: products.length,
        format: 'JSON'
    };
    saveLog(log);
    setLogs([log, ...logs]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      
      reader.onload = (event) => {
          try {
              const text = event.target?.result as string;
              let rawProducts: any[] = [];
              const format = file.name.endsWith('.json') ? 'JSON' : 'CSV';

              if (format === 'JSON') {
                  const json = JSON.parse(text);
                  
                  // Handle different JSON structures
                  if (Array.isArray(json)) {
                      rawProducts = json;
                  } else if (json.inventario && Array.isArray(json.inventario)) {
                      rawProducts = json.inventario;
                  } else if (json.products && Array.isArray(json.products)) {
                      rawProducts = json.products;
                  } else if (json.data && Array.isArray(json.data)) {
                      rawProducts = json.data;
                  }
              } else if (format === 'CSV') {
                  // Basic CSV Parser
                  const lines = text.split('\n').filter(l => l.trim());
                  const startIdx = lines[0].toLowerCase().includes('precio') ? 1 : 0;
                  
                  for (let i = startIdx; i < lines.length; i++) {
                      const cols = lines[i].split(',').map(c => c.trim().replace(/^"|"$/g, ''));
                      if (cols.length < 4) continue;

                      const category = Object.values(Category).find(c => c === cols[2]) || Category.OTROS;

                      rawProducts.push({
                          id: cols[0],
                          name: cols[1] || 'Producto Importado',
                          category: category,
                          price: parseFloat(cols[3]),
                          cost: parseFloat(cols[4]),
                          stock: parseInt(cols[5]),
                          minStock: parseInt(cols[6]),
                          description: cols[7],
                          lastUpdated: Date.now()
                      });
                  }
              }

              // --- CRITICAL FIX: Handle Duplicate IDs within the file ---
              const seenIds = new Set<string>();
              const validProducts: Product[] = [];

              rawProducts.forEach(p => {
                  if (!p || !p.name) return;

                  // Normalize ID: If missing or already seen in this batch, generate new
                  let finalId = p.id;
                  if (!finalId || seenIds.has(finalId)) {
                      finalId = crypto.randomUUID();
                  }
                  seenIds.add(finalId);

                  // Normalize Category
                  let finalCat = p.category;
                  if (!Object.values(Category).includes(finalCat)) {
                      finalCat = Category.OTROS;
                  }

                  validProducts.push({
                      id: finalId,
                      name: p.name,
                      description: p.description || '',
                      category: finalCat,
                      price: typeof p.price === 'number' ? p.price : 0,
                      cost: typeof p.cost === 'number' ? p.cost : 0,
                      stock: typeof p.stock === 'number' ? p.stock : 0,
                      minStock: typeof p.minStock === 'number' ? p.minStock : 5,
                      lastUpdated: Date.now(),
                      suppliers: p.suppliers || [],
                      barcode: p.barcode
                  });
              });

              if (validProducts.length > 0) {
                  onImport(validProducts);
                  setImportStats({ total: validProducts.length, valid: validProducts.length });
                  setError(null);

                  // Log Import
                  const log: DataLog = {
                    id: crypto.randomUUID(),
                    type: 'IMPORT',
                    fileName: file.name,
                    date: Date.now(),
                    recordCount: validProducts.length,
                    format: format
                  };
                  saveLog(log);
                  setLogs([log, ...logs]);

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

  const handleClearDatabase = () => {
      const confirm1 = window.confirm("¡ADVERTENCIA! ¿Estás seguro de que quieres BORRAR TODOS LOS PRODUCTOS?");
      if (confirm1) {
          const confirm2 = window.confirm("Esta acción no se puede deshacer. Se eliminarán todos los productos de la base de datos local. ¿Continuar?");
          if (confirm2) {
              onClearData();
              onClose();
          }
      }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-scale-up max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Database className="text-blue-600" /> Gestión de Datos
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                    <X size={20} className="text-slate-500" />
                </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
                
                {/* Export Section */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Exportar (Copia de Seguridad)</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button 
                            onClick={handleExportCSV}
                            className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                            <Download size={24} className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Excel / CSV</span>
                        </button>
                        <button 
                            onClick={handleExportJSON}
                            className="flex flex-col items-center justify-center p-4 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                        >
                            <Save size={24} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-medium">Respaldo JSON</span>
                        </button>
                    </div>
                </div>

                {/* Import Section */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200">Importar Datos</h3>
                    
                    {!importStats ? (
                        <>
                             <p className="text-xs text-slate-500 mb-2">
                                Soporta archivos .csv y .json. Los duplicados en el archivo se importarán como nuevos items.
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
                                Se han procesado {importStats.total} productos correctamente.
                            </p>
                            <button 
                                onClick={() => { setImportStats(null); onClose(); }}
                                className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
                            >
                                Ver Productos
                            </button>
                        </div>
                    )}
                </div>

                {/* History Log Section */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-3 flex items-center gap-2">
                        <Clock size={16} /> Historial de Cambios
                    </h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                        {logs.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No hay historial reciente.</p>
                        ) : (
                            logs.map(log => (
                                <div key={log.id} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-1.5 rounded-full ${log.type === 'IMPORT' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                            {log.type === 'IMPORT' ? <ArrowDown size={14} /> : <ArrowUp size={14} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate w-32 sm:w-40">{log.fileName}</p>
                                            <p className="text-[10px] text-slate-500">{new Date(log.date).toLocaleString()} • {log.recordCount} items</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                                        {log.format}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* DANGER ZONE */}
                <div className="border-t-2 border-red-100 dark:border-red-900/30 pt-4 mt-2">
                    <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-xl border border-red-100 dark:border-red-900/20">
                        <h3 className="font-bold text-red-600 dark:text-red-400 flex items-center gap-2 text-sm mb-2">
                            <AlertTriangle size={16} /> Zona de Peligro
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3">
                            Si tuviste errores al importar o quieres reiniciar el sistema, puedes eliminar toda la base de datos de productos.
                        </p>
                        <button 
                            onClick={handleClearDatabase}
                            className="w-full flex items-center justify-center gap-2 bg-white dark:bg-slate-900 border border-red-200 dark:border-red-800 text-red-500 dark:text-red-400 py-2 rounded-lg text-sm font-bold hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <Trash2 size={16} /> Eliminar Todos los Productos
                        </button>
                    </div>
                </div>

            </div>
        </div>
    </div>
  );
};

export default DataManagement;
