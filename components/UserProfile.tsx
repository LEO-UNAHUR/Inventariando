
import React, { useState, useRef } from 'react';
import { User } from '../types';
import { Save, User as UserIcon, Lock, Camera, ShieldCheck, Upload, Trash2 } from 'lucide-react';

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
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          // Check size (limit to 1MB roughly)
          if (file.size > 1024 * 1024) {
              alert("La imagen es muy grande. Máximo 1MB.");
              return;
          }

          const reader = new FileReader();
          reader.onloadend = () => {
              setAvatar(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const renderAvatar = (id: string, size: string = 'w-12 h-12') => {
      if (id.startsWith('data:image')) {
          return (
              <img 
                src={id} 
                alt="Avatar" 
                className={`${size} rounded-full object-cover shadow-sm border-2 border-white dark:border-slate-700`} 
              />
          );
      }

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

        <div className="flex-1 overflow-y-auto p-4 pb-32 max-w-lg mx-auto w-full">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Avatar Selection */}
                <div className="flex flex-col items-center gap-6 py-6 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="relative group">
                        {renderAvatar(avatar, 'w-28 h-28')}
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
                        >
                            <Camera size={18} />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload}
                        />
                    </div>
                    
                    <div className="flex flex-col items-center gap-2 w-full px-4">
                        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">O elegir predeterminado</p>
                        <div className="flex justify-center gap-3 w-full flex-wrap">
                            {AVATARS.map(av => (
                                <button
                                    key={av}
                                    type="button"
                                    onClick={() => setAvatar(av)}
                                    className={`rounded-full border-2 p-0.5 ${avatar === av ? 'border-blue-500 scale-110' : 'border-transparent opacity-70'} transition-all`}
                                >
                                    {renderAvatar(av, 'w-10 h-10')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="text" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">PIN (Acceso Rápido)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                            <input 
                                type="number" 
                                value={pin}
                                maxLength={4}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                            />
                        </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between py-2">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${is2FA ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                    <ShieldCheck size={24} />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-slate-700 dark:text-slate-200">Doble Factor (2FA)</span>
                                    <span className="text-xs text-slate-500">Mayor seguridad al ingresar</span>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setIs2FA(!is2FA)}
                                className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 focus:outline-none ${is2FA ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                            >
                                <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${is2FA ? 'translate-x-6' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
                >
                    <Save size={24} />
                    Guardar Cambios
                </button>

            </form>
        </div>
    </div>
  );
};

export default UserProfile;
