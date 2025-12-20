import React, { useState } from 'react';
import { Customer, Sale } from '@/types';
import { formatCurrency } from '@/constants';
import {
  Search,
  Plus,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2,
  MessageCircle,
  Sun,
  Moon,
  Users,
  Star,
  Wallet,
  History,
  ArrowRight,
} from 'lucide-react';

interface CustomerListProps {
  customers: Customer[];
  sales: Sale[]; // To show history
  onAdd: () => void;
  onEdit: (customer: Customer) => void;
  onDelete: (id: string) => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

const CustomerList: React.FC<CustomerListProps> = ({
  customers,
  sales,
  onAdd,
  onEdit,
  onDelete,
  isDark,
  onToggleTheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const filteredCustomers = customers.filter(
    (c) => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.phone.includes(searchTerm)
  );

  const getWhatsappLink = (phone: string) => {
    const cleanNumber = phone.replace(/[^0-9]/g, '');
    return `https://wa.me/549${cleanNumber}`;
  };

  const getCustomerSales = (customerId: string) => {
    return sales.filter((s) => s.customerId === customerId).sort((a, b) => b.date - a.date);
  };

  // Render Detail View if a customer is selected
  if (selectedCustomer) {
    const history = getCustomerSales(selectedCustomer.id);
    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900 sticky top-0 z-10">
          <button
            onClick={() => setSelectedCustomer(null)}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowRight className="rotate-180" size={20} />
          </button>
          <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100">
            {selectedCustomer.name}
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1 opacity-90">
                <Wallet size={16} />
                <span className="text-xs font-medium uppercase">Cuenta Corriente</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(selectedCustomer.balance)}</p>
              <p className="text-xs opacity-75 mt-1">
                {selectedCustomer.balance < 0 ? 'Deuda Pendiente' : 'Saldo a Favor / Al día'}
              </p>
            </div>
            <div className="bg-gradient-to-br from-amber-400 to-amber-500 rounded-2xl p-4 text-white shadow-lg">
              <div className="flex items-center gap-2 mb-1 opacity-90">
                <Star size={16} />
                <span className="text-xs font-medium uppercase">Puntos</span>
              </div>
              <p className="text-2xl font-bold">{selectedCustomer.loyaltyPoints}</p>
              <p className="text-xs opacity-75 mt-1">
                Nivel: {selectedCustomer.loyaltyPoints > 1000 ? 'Oro' : 'Plata'}
              </p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
              Información de Contacto
            </h3>
            {selectedCustomer.phone && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Phone size={16} /> <span>{selectedCustomer.phone}</span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`tel:${selectedCustomer.phone}`}
                    className="p-1.5 bg-slate-100 dark:bg-slate-800 rounded text-blue-500"
                  >
                    <Phone size={14} />
                  </a>
                  <a
                    href={getWhatsappLink(selectedCustomer.phone)}
                    target="_blank"
                    className="p-1.5 bg-emerald-100 dark:bg-emerald-900/20 rounded text-emerald-500"
                    rel="noreferrer"
                  >
                    <MessageCircle size={14} />
                  </a>
                </div>
              </div>
            )}
            {selectedCustomer.email && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail size={16} /> <span>{selectedCustomer.email}</span>
              </div>
            )}
            {selectedCustomer.address && (
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <MapPin size={16} /> <span>{selectedCustomer.address}</span>
              </div>
            )}
            <div className="pt-2 flex gap-2">
              <button
                onClick={() => {
                  onEdit(selectedCustomer);
                  setSelectedCustomer(null);
                }}
                className="flex-1 py-2 text-sm bg-slate-100 dark:bg-slate-800 rounded-lg font-medium text-slate-600 dark:text-slate-300"
              >
                Editar
              </button>
            </div>
          </div>

          {/* Purchase History */}
          <div>
            <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
              <History size={18} /> Historial de Compras
            </h3>
            <div className="space-y-2">
              {history.length === 0 ? (
                <p className="text-slate-400 text-sm italic">Sin compras registradas.</p>
              ) : (
                history.map((sale) => (
                  <div
                    key={sale.id}
                    className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 flex justify-between items-center"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Compra #{sale.id.slice(0, 4)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(sale.date).toLocaleDateString()} • {sale.items.length} items
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-800 dark:text-slate-100">
                        {formatCurrency(sale.total)}
                      </p>
                      <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
                        {sale.paymentMethod}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Sticky Header */}
      <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 space-y-3 shadow-sm border-b border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="text-blue-600 dark:text-blue-400" />
            Clientes
          </h1>
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 transition-colors"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <p>No se encontraron clientes.</p>
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)}
              className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm transition-colors active:scale-[0.99] cursor-pointer"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-600 dark:text-slate-300">
                    {customer.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100">
                      {customer.name}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Star size={12} className="text-amber-400" /> {customer.loyaltyPoints} pts
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-bold ${
                      customer.balance < 0 ? 'text-red-500' : 'text-emerald-500'
                    }`}
                  >
                    {formatCurrency(customer.balance)}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase">Saldo</p>
                </div>
              </div>

              <div
                className="flex gap-2 justify-end mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onEdit(customer)}
                  className="p-2 text-slate-400 hover:text-blue-500 dark:hover:text-blue-400"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => onDelete(customer.id)}
                  className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400"
                >
                  <Trash2 size={18} />
                </button>
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

export default CustomerList;
