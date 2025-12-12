
import React, { useState } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Lock, Camera, ShieldCheck } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onUpdateUser: (updatedUser: User) => void;
  isDark: boolean;
}

const AVATARS = ['AVATAR_1', 'AVATAR_2', 'AVATAR_3', 'AVATAR_4', 'AVATAR_5'];

const UserProfile: React.FC<UserProfileProps> = ({ user, onUpdateUser, isDark }) => {
  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState(user.password || '');
  const [pin, setPin] = useState(user.pin);
  const [avatar, setAvatar] = useState(user.avatar || 'AVATAR_1');
  const [is2FA, setIs2FA] = useState(user.is2FAEnabled);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name,
      password,
      pin,
      avatar,
      is2FAEnabled: is2FA
    });
    alert('Perfil actualizado correctamente');
  };

  const renderAvatar = (id: string, size: string = 'w-12 h-12') => {
      const colors: Record<string, string> = {
          'AVATAR_1': 'bg-blue-500',
          'AVATAR_2': 'bg-purple-500',
          'AVATAR_3': 'bg-emerald-500',
          'AVATAR_4': 'bg-orange-500',
          'AVATAR_5': 'bg-pink-500',
      };
      return (
          <div className={`${size} rounded-full ${colors[id] || 'bg-slate-500'} flex items-center justify-center text-white font-bold shadow-sm`}>
              <UserIcon size={parseInt(size.replace(/\D/g,'')) / 2.5} />
          </div>
      );
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300 animate-fade-in">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Mi Perfil</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-w-md mx-auto w-full">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Avatar Selection */}
                <div className="flex flex-col items-center gap-4 py-4">
                    <div className="relative">
                        {renderAvatar(avatar, 'w-24 h-24')}
                        <div className="absolute bottom-0 right-0 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow border border-slate-200 dark:border-slate-700">
                            <Camera size={16} className="text-slate-500" />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {AVATARS.map(av => (
                            <button
                                key={av}
                                type="button"
                                onClick={() => setAvatar(av)}
                                className={`rounded-full border-2 ${avatar === av ? 'border-blue-500 scale-110' : 'border-transparent opacity-70'} transition-all`}
                            >
                                {renderAvatar(av, 'w-10 h-10')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nombre</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">PIN (Acceso Rápido)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            <input 
                                type="number" 
                                value={pin}
                                maxLength={4}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                            <ShieldCheck size={20} className={is2FA ? "text-emerald-500" : "text-slate-400"} />
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Doble Factor (2FA)</span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setIs2FA(!is2FA)}
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${is2FA ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                        >
                            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${is2FA ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all"
                >
                    <Save size={20} />
                    Guardar Cambios
                </button>

            </form>
        </div>
    </div>
  );
};

export default UserProfile;
