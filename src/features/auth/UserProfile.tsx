
import React, { useState, useRef } from 'react';
import { User } from '@/types';
import { getUserSettings, saveUserSettings, isValidPhoneNumber, formatPhoneForWhatsApp, generateWhatsappCode, verifyWhatsappCode } from '@/services/userSettingsService';
import { Save, User as UserIcon, Lock, Camera, ShieldCheck, Upload, MessageCircle, Bell, Moon, Globe } from 'lucide-react';

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
  
  // New user settings fields
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);
  const [language, setLanguage] = useState('es');
  const [phoneError, setPhoneError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);
    const [verificationCode, setVerificationCode] = useState('');
    const [verificationMessage, setVerificationMessage] = useState('');
    const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load user settings from service
  React.useEffect(() => {
    const settings = getUserSettings(user.id);
    setWhatsappPhone(settings.whatsappPhone || '');
    setNotificationsEnabled(settings.notificationsEnabled ?? true);
    setDarkMode(settings.darkMode ?? isDark);
    setLanguage(settings.language ?? 'es');
        setIsPhoneVerified(!!settings.whatsappVerifiedAt);
  }, [user.id, isDark]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Update user
    onUpdateUser({
      ...user,
      name,
      password,
      pin,
      avatar,
      is2FAEnabled: is2FA
    });

    // Save user settings
    const settings = getUserSettings(user.id);
    saveUserSettings({
      ...settings,
      whatsappPhone: whatsappPhone ? formatPhoneForWhatsApp(whatsappPhone) : undefined,
      notificationsEnabled,
      darkMode,
      language,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handlePhoneChange = (value: string) => {
    setWhatsappPhone(value);
    if (value && !isValidPhoneNumber(value)) {
      setPhoneError('Número de teléfono inválido (mínimo 10 dígitos)');
    } else {
      setPhoneError('');
    }
  };

    const handleSendVerificationCode = () => {
        if (!whatsappPhone || phoneError) {
            setVerificationMessage('Ingresa un teléfono válido antes de enviar el código');
            return;
        }
        const code = generateWhatsappCode(user.id, whatsappPhone);
        const formatted = formatPhoneForWhatsApp(whatsappPhone);
        setVerificationMessage('Código enviado. Revisa tu WhatsApp y pega el código aquí.');
        window.open(`https://wa.me/${formatted}?text=Tu%20c%C3%B3digo%20de%20verificaci%C3%B3n%20para%20Inventariando%20es:%20${code}`, '_blank');
    };

    const handleVerifyCode = () => {
        const ok = verifyWhatsappCode(user.id, verificationCode);
        if (ok) {
            setIsPhoneVerified(true);
            setVerificationMessage('Número verificado correctamente');
        } else {
            setVerificationMessage('Código inválido o expirado. Genera uno nuevo.');
        }
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

        <div className="flex-1 overflow-y-auto p-4 pb-32 max-w-5xl mx-auto w-full">
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Top Grid: Avatar + Datos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Avatar Selection */}
                                    <div className="flex flex-col items-center gap-6 py-6 bg-secondary text-primary rounded-2xl shadow-sm border border-border-light">
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
                        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">O elegir predeterminado</p>
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

                  {/* Datos Básicos */}
                  <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-secondary mb-2">Nombre Completo</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3.5 text-secondary" size={18} />
                            <input 
                                type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-tertiary text-primary border border-border-light rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-secondary mb-2">Contraseña</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-secondary" size={18} />
                            <input 
                                type="text" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-tertiary text-primary border border-border-light rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-secondary mb-2">PIN (Acceso Rápido)</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3.5 text-secondary" size={18} />
                            <input 
                                type="number" 
                                value={pin}
                                maxLength={4}
                                onChange={(e) => setPin(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-tertiary text-primary border border-border-light rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-base"
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
                                    <span className="block text-sm font-bold text-secondary">Doble Factor (2FA)</span>
                                    <span className="text-xs text-tertiary">Mayor seguridad al ingresar</span>
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
                </div>

                {/* Preferences Section (Right Column full width below on mobile) */}
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 space-y-4">
                    <h3 className="font-bold text-primary mb-4">Preferencias</h3>

                    {/* WhatsApp Phone */}
                    <div>
                        <label className="block text-sm font-bold text-secondary mb-2 flex items-center gap-2">
                            <MessageCircle size={16} className="text-green-600" />
                            Teléfono WhatsApp
                        </label>
                                                <input
                                                    type="tel"
                                                    value={whatsappPhone}
                                                    onChange={(e) => handlePhoneChange(e.target.value)}
                                                    placeholder="+54 9 11 2345 6789"
                                                    className={`w-full px-4 py-2 rounded-lg border ${
                                                        phoneError
                                                        ? 'border-red-300 bg-red-50 dark:bg-red-900/10'
                                                        : 'border-border-light bg-tertiary dark:bg-slate-950'
                                                    } text-primary placeholder:text-tertiary focus:outline-none focus:ring-2 focus:ring-green-500`}
                                                />
                        {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
                        <div className="flex items-center gap-3 mt-2">
                            <button
                                type="button"
                                onClick={handleSendVerificationCode}
                                className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95 transition"
                                style={{ minHeight: 'var(--touch-target-min)' }}
                            >
                                Enviar código
                            </button>
                            {isPhoneVerified && (
                                <span className="text-xs font-bold text-emerald-500">Número verificado</span>
                            )}
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={verificationCode}
                              onChange={(e) => setVerificationCode(e.target.value)}
                              placeholder="Ingresa el código recibido"
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm"
                            />
                                                        <button
                                                            type="button"
                                                            onClick={handleVerifyCode}
                                                            className="px-3 py-2 rounded-lg border border-blue-500 text-blue-600 text-sm font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                                            style={{ minHeight: 'var(--touch-target-min)' }}
                                                        >
                              Verificar
                            </button>
                        </div>
                        {verificationMessage && (
                            <p className="text-xs mt-1 text-slate-500 dark:text-slate-400">{verificationMessage}</p>
                        )}
                        <p className="text-xs mt-1 text-slate-500">Para compartir ventas y productos por WhatsApp</p>
                    </div>

                    {/* Notifications */}
                    <div>
                        <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Bell size={16} className="text-amber-600" />
                            Notificaciones
                        </label>
                        <button
                            type="button"
                            onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                            className={`w-full px-4 py-2 rounded-lg border flex items-center justify-between text-sm font-medium ${
                              notificationsEnabled
                                ? 'bg-amber-50 border-amber-300 dark:bg-amber-900/20 dark:border-amber-700 text-amber-800 dark:text-amber-200'
                                : 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            {notificationsEnabled ? 'Habilitadas' : 'Deshabilitadas'}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              notificationsEnabled ? 'bg-amber-500' : 'bg-slate-400 dark:bg-slate-600'
                            }`}>
                              {notificationsEnabled && <span className="text-white text-xs">✓</span>}
                            </div>
                        </button>
                    </div>

                    {/* Dark Mode */}
                    <div>
                        <label className="flex items-center gap-2 font-bold text-slate-700 dark:text-slate-300 mb-2">
                            <Moon size={16} className="text-indigo-600" />
                            Tema Oscuro
                        </label>
                        <button
                            type="button"
                            onClick={() => setDarkMode(!darkMode)}
                            className={`w-full px-4 py-2 rounded-lg border flex items-center justify-between text-sm font-medium ${
                              darkMode
                                ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200'
                                : 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                        >
                            {darkMode ? 'Activado' : 'Desactivado'}
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                              darkMode ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'
                            }`}>
                              {darkMode && <span className="text-white text-xs">✓</span>}
                            </div>
                        </button>
                    </div>

                    {/* Language */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                            <Globe size={16} className="text-blue-600" />
                            Idioma
                        </label>
                        <select
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="es">Español</option>
                            <option value="en">English</option>
                            <option value="pt">Português</option>
                        </select>
                    </div>
                </div>

                {/* Success Message */}
                {saveSuccess && (
                    <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
                      isDark
                        ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-700'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    }`}>
                      ✓ Perfil actualizado correctamente
                    </div>
                )}

                <button 
                    type="submit"
                    className="w-full md:w-64 mx-auto bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20 active:scale-95 transition-all"
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
