
import React, { useState } from 'react';
import { Supplier } from '../types';
import { Save, X, User, Phone, MapPin, Mail, FileText, Building2 } from 'lucide-react';

interface SupplierFormProps {
  initialSupplier?: Supplier | null;
  onSave: (supplier: Supplier) => void;
  onCancel: () => void;
}

const SupplierForm: React.FC<SupplierFormProps> = ({ initialSupplier, onSave, onCancel }) => {
  const [name, setName] = useState(initialSupplier?.name || '');
  const [contactName, setContactName] = useState(initialSupplier?.contactName || '');
  const [phone, setPhone] = useState(initialSupplier?.phone || '');
  const [email, setEmail] = useState(initialSupplier?.email || '');
  const [address, setAddress] = useState(initialSupplier?.address || '');
  const [notes, setNotes] = useState(initialSupplier?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      id: initialSupplier?.id || crypto.randomUUID(),
      name,
      contactName,
      phone,
      email,
      address,
      notes
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-[90vh] sm:h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up transition-colors duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
            {initialSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Empresa / Razón Social</label>
            <div className="relative">
                <Building2 className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ej: Distribuidora Oeste"
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre de Contacto</label>
            <div className="relative">
                <User className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ej: Juan Pérez"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Teléfono / Celular</label>
            <div className="relative">
                <Phone className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Ej: 11 4455 6677"
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <div className="relative">
                <Mail className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="contacto@empresa.com"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dirección</label>
            <div className="relative">
                <MapPin className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Calle Falsa 123, CABA"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notas</label>
            <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Días de entrega, horarios, CBU..."
                    rows={3}
                />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
             <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold text-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
                <Save size={20} />
                Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierForm;
