
import React, { useState } from 'react';
import { Supplier } from '@/types';
import { Search, Plus, Phone, Mail, MapPin, Edit2, Trash2, MessageCircle, Sun, Moon, Truck } from 'lucide-react';

interface SupplierListProps {
  suppliers: Supplier[];
  onAdd: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const SupplierList: React.FC<SupplierListProps> = ({ suppliers, onAdd, onEdit, onDelete, isDark, onToggleTheme }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.contactName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getWhatsappLink = (phone: string) => {
    // Basic cleanup for AR numbers, assuming they might enter 011... or 15...
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/549${cleanNumber}`;
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      
      {/* Sticky Header */}
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 space-y-3 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Truck className="text-blue-600 dark:text-blue-400" />
                Proveedores
            </h1>
            <button 
                onClick={onToggleTheme}
                className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Buscar proveedor o contacto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredSuppliers.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>No se encontraron proveedores.</p>
          </div>
        ) : (
            filteredSuppliers.map(supplier => (
            <div key={supplier.id} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">{supplier.name}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    {supplier.contactName}
                  </p>
                </div>
                <div className="flex gap-1">
                   <button onClick={() => onEdit(supplier)} className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400">
                     <Edit2 size={18} />
                   </button>
                   <button onClick={() => onDelete(supplier.id)} className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400">
                     <Trash2 size={18} />
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-sm text-slate-600 dark:text-slate-300 mb-4">
                 {supplier.address && (
                    <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        <span>{supplier.address}</span>
                    </div>
                 )}
                 {supplier.email && (
                    <div className="flex items-center gap-2">
                        <Mail size={16} className="text-slate-400" />
                        <a href={`mailto:${supplier.email}`} className="hover:underline">{supplier.email}</a>
                    </div>
                 )}
              </div>

              {/* Action Bar */}
              <div className="flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <a 
                    href={`tel:${supplier.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                    <Phone size={18} /> Llamar
                </a>
                <a 
                    href={getWhatsappLink(supplier.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                >
                    <MessageCircle size={18} /> WhatsApp
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={onAdd}
        className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 z-20"
      >
        <Plus size={28} />
      </button>

    </div>
  );
};

export default SupplierList;
