
import React, { useState } from 'react';
import { Expense, ExpenseCategory } from '../types';
import { Save, X, DollarSign, FileText, Calendar, Tag } from 'lucide-react';

interface ExpenseFormProps {
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onSave, onCancel }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>(ExpenseCategory.OTROS);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newExpense: Expense = {
      id: crypto.randomUUID(),
      description,
      amount: parseFloat(amount) || 0,
      category,
      date: new Date(date).getTime() + new Date().getTimezoneOffset() * 60000 // Simple timezone fix for display
    };
    onSave(newExpense);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 w-full sm:max-w-md h-auto rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col animate-slide-up transition-colors duration-300">
        
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Registrar Gasto</h2>
          <button onClick={onCancel} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Monto (ARS)</label>
            <div className="relative">
                <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-xl focus:ring-2 focus:ring-red-500 focus:outline-none text-lg font-bold"
                    placeholder="0.00"
                    autoFocus
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Concepto</label>
            <div className="relative">
                <FileText className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    placeholder="Ej: Pago de Luz Edesur"
                    required
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Categoría</label>
            <div className="relative">
                <Tag className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                >
                    {Object.values(ExpenseCategory).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Fecha</label>
             <div className="relative">
                <Calendar className="absolute left-3 top-2.5 text-slate-400" size={18} />
                <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
             </div>
          </div>

          <div className="pt-2">
             <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl font-semibold text-lg active:scale-95 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            >
                <Save size={20} />
                Registrar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
