import React, { useState } from 'react';
import { User, Role } from '@/types';
import {
  Store,
  User as UserIcon,
  LogIn,
  ChevronRight,
  Key,
  ShieldCheck,
  RefreshCw,
  Moon,
  Sun,
} from 'lucide-react';

interface LoginScreenProps {
  users: User[];
  onLogin: (user: User) => void;
  isDark: boolean;
  onToggleDarkMode?: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ users, onLogin, isDark, onToggleDarkMode }) => {
  const [step, setStep] = useState<'SELECT_USER' | 'PASSWORD' | '2FA'>('SELECT_USER');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setStep('PASSWORD');
    setPassword('');
    setError('');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Simulate API delay
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Simple password check (use user.password or fallback to pin for simple users)
      const validPwd = selectedUser?.password || selectedUser?.pin;

      if (selectedUser && password === validPwd) {
        if (selectedUser.is2FAEnabled) {
          setStep('2FA');
        } else {
          onLogin(selectedUser);
        }
      } else {
        setError('Contraseña incorrecta');
        setPassword('');
      }
    }, 600);
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      // Hardcoded code for demo
      if (twoFactorCode === '123456') {
        if (selectedUser) onLogin(selectedUser);
      } else {
        setError('Código inválido. Intenta con 123456');
        setTwoFactorCode('');
      }
    }, 800);
  };

  const getRoleColor = (role: Role) => {
    switch (role) {
      case Role.ADMIN:
        return 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300';
      case Role.MANAGER:
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300';
      case Role.SELLER:
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getAvatarColor = (avatar?: string) => {
    // Map avatar string ID to color for quick visual distinction
    if (!avatar) return 'bg-slate-100 dark:bg-slate-800 text-slate-600';
    const colors: any = {
      AVATAR_1: 'bg-blue-500 text-white',
      AVATAR_2: 'bg-purple-500 text-white',
      AVATAR_3: 'bg-emerald-500 text-white',
      AVATAR_4: 'bg-orange-500 text-white',
      AVATAR_5: 'bg-pink-500 text-white',
    };
    return colors[avatar] || 'bg-slate-100 dark:bg-slate-800 text-slate-600';
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 transition-colors duration-300">
      {/* Dark Mode Toggle */}
      {onToggleDarkMode && (
        <button
          onClick={onToggleDarkMode}
          className={`absolute top-6 right-6 p-2 rounded-full ${
            isDark
              ? 'bg-slate-800 hover:bg-slate-700 text-yellow-400'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
          } transition-colors`}
          title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      )}

      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="inline-block p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-lg mb-4">
            <Store size={40} className="text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Inventariando</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Acceso al Sistema</p>
        </div>

        {step === 'SELECT_USER' && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-fade-in">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Seleccionar Usuario
              </h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${getAvatarColor(
                        user.avatar
                      )}`}
                    >
                      <UserIcon size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-100">{user.name}</p>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${getRoleColor(
                          user.role
                        )}`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-300" />
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 'PASSWORD' && selectedUser && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 animate-slide-left">
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setStep('SELECT_USER')}
                className="text-sm text-slate-400 hover:text-blue-500"
              >
                ← Cambiar
              </button>
              <div className="flex-1 text-center pr-8">
                <h3 className="font-bold text-slate-800 dark:text-slate-100">
                  {selectedUser.name}
                </h3>
                <p className="text-xs text-slate-500">Ingrese su contraseña</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div className="relative">
                <Key className="absolute left-3 top-3 text-slate-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError('');
                  }}
                  placeholder="Contraseña"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 transition-colors"
                  autoFocus
                />
              </div>
              {error && (
                <p className="text-center text-red-500 text-sm font-medium animate-pulse">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <LogIn size={20} />}
                Iniciar Sesión
              </button>
            </form>
          </div>
        )}

        {step === '2FA' && selectedUser && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 border border-slate-200 dark:border-slate-800 animate-slide-left">
            <div className="text-center mb-6">
              <div className="inline-block p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-3">
                <ShieldCheck size={32} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100">
                Verificación de 2 Pasos
              </h3>
              <p className="text-xs text-slate-500 px-4">
                Hemos enviado un código a tu dispositivo seguro. (Demo: 123456)
              </p>
            </div>

            <form onSubmit={handle2FASubmit} className="space-y-4">
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                  setTwoFactorCode(val);
                  setError('');
                }}
                placeholder="000000"
                className="w-full text-center text-3xl tracking-[0.5em] font-bold py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100"
                autoFocus
              />
              {error && (
                <p className="text-center text-red-500 text-sm font-medium animate-pulse">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading || twoFactorCode.length < 6}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <RefreshCw className="animate-spin" size={20} />
                ) : (
                  <ShieldCheck size={20} />
                )}
                Verificar
              </button>

              <button
                type="button"
                onClick={() => setStep('PASSWORD')}
                className="w-full text-sm text-slate-400 hover:text-slate-600 py-2"
              >
                Cancelar
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginScreen;
