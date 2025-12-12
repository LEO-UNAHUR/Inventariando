
import React, { useState } from 'react';
import { User, Role } from '../types';
import { Plus, Trash2, Edit2, Shield, User as UserIcon, Save, X, Key } from 'lucide-react';

interface TeamManagementProps {
  users: User[];
  onAddUser: (user: User) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
  currentUser: User;
  isDark: boolean;
  onToggleTheme: () => void;
}

const TeamManagement: React.FC<TeamManagementProps> = ({ users, onAddUser, onUpdateUser, onDeleteUser, currentUser, isDark, onToggleTheme }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<Role>(Role.SELLER);
  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');

  const openForm = (user?: User) => {
      if (user) {
          setEditingUser(user);
          setName(user.name);
          setRole(user.role);
          setPin(user.pin);
          setPassword(user.password || '');
      } else {
          setEditingUser(null);
          setName('');
          setRole(Role.SELLER);
          setPin('');
          setPassword('');
      }
      setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      const userPayload: User = {
          id: editingUser ? editingUser.id : crypto.randomUUID(),
          name,
          role,
          pin,
          password,
          is2FAEnabled: editingUser ? editingUser.is2FAEnabled : false,
          avatar: editingUser ? editingUser.avatar : `AVATAR_${Math.floor(Math.random() * 5) + 1}`
      };

      if (editingUser) {
          onUpdateUser(userPayload);
      } else {
          onAddUser(userPayload);
      }
      setIsFormOpen(false);
  };

  const renderRoleBadge = (role: Role) => {
      switch (role) {
          case Role.ADMIN: return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 rounded text-[10px] uppercase font-bold">Admin</span>;
          case Role.MANAGER: return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded text-[10px] uppercase font-bold">Encargado</span>;
          default: return <span className="px-2 py-0.5 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 rounded text-[10px] uppercase font-bold">Vendedor</span>;
      }
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        
        {/* Header */}
        <div className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Shield className="text-blue-600" /> Gestión de Equipo
            </h1>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {users.map(u => (
                <div key={u.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${u.role === Role.ADMIN ? 'bg-purple-500' : 'bg-slate-400'}`}>
                            {u.name.substring(0,1).toUpperCase()}
                        </div>
                        <div>
                            <p className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                                {u.name} {renderRoleBadge(u.role)}
                            </p>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                <Key size={10} /> PIN: ****
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => openForm(u)} className="p-2 text-blue-500 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <Edit2 size={18} />
                        </button>
                        {u.id !== currentUser.id && (
                            <button onClick={() => onDeleteUser(u.id)} className="p-2 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <Trash2 size={18} />
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>

        {/* FAB */}
        <button
            onClick={() => openForm()}
            className="fixed bottom-24 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-2xl shadow-lg transition-all active:scale-95 z-20"
        >
            <Plus size={28} />
        </button>

        {/* Modal */}
        {isFormOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-up">
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
                            {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
                        </h2>
                        <button onClick={() => setIsFormOpen(false)} className="text-slate-400"><X size={24} /></button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white" 
                                required 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Rol</label>
                            <select 
                                value={role} 
                                onChange={e => setRole(e.target.value as Role)} 
                                className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white"
                            >
                                {Object.values(Role).map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                                <input 
                                    type="text" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white" 
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIN (4)</label>
                                <input 
                                    type="number"
                                    maxLength={4}
                                    value={pin} 
                                    onChange={e => setPin(e.target.value)} 
                                    className="w-full p-2 border border-slate-300 dark:border-slate-700 rounded-lg dark:bg-slate-800 dark:text-white" 
                                    required 
                                />
                            </div>
                        </div>

                        <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold mt-4 flex items-center justify-center gap-2">
                            <Save size={20} /> Guardar
                        </button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};

export default TeamManagement;
