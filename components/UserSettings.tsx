import React, { useState, useEffect } from 'react';
import { User as UserType, IAProvider } from '../types';
import { getUserSettings, saveUserSettings, isValidPhoneNumber, formatPhoneForWhatsApp } from '../services/userSettingsService';
import { X, Save, Lock, Phone, Zap, Bell, Moon, MessageCircle, User } from 'lucide-react';

interface UserSettingsProps {
  user: UserType;
  isDark: boolean;
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ user, isDark, onClose }) => {
  const [whatsappPhone, setWhatsappPhone] = useState('');
  const [iaProvider, setIaProvider] = useState<IAProvider>(IAProvider.GEMINI);
  const [iaApiKey, setIaApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(isDark);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  useEffect(() => {
    const settings = getUserSettings(user.id);
    setWhatsappPhone(settings.whatsappPhone || '');
    setIaProvider(settings.iaProvider || IAProvider.GEMINI);
    setIaApiKey(settings.iaApiKey || '');
    setNotificationsEnabled(settings.notificationsEnabled ?? true);
    setDarkMode(settings.darkMode ?? isDark);
  }, [user.id, isDark]);

  const handlePhoneChange = (value: string) => {
    setWhatsappPhone(value);
    if (value && !isValidPhoneNumber(value)) {
      setPhoneError('Número de teléfono inválido (mínimo 10 dígitos)');
    } else {
      setPhoneError('');
    }
  };

  const handleSave = () => {
    const settings = getUserSettings(user.id);

    saveUserSettings({
      ...settings,
      whatsappPhone: whatsappPhone ? formatPhoneForWhatsApp(whatsappPhone) : undefined,
      iaProvider,
      iaApiKey: iaApiKey && (iaProvider !== IAProvider.GEMINI) ? iaApiKey : undefined,
      notificationsEnabled,
      darkMode,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end md:items-center justify-center animate-fade-in">
      <div
        className={`w-full md:w-96 rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-slate-900' : 'bg-white'
        } transition-colors`}
      >
        {/* Header */}
        <div
          className={`sticky top-0 flex items-center justify-between p-4 border-b ${
            isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-blue-900/30' : 'bg-blue-100'
              }`}
            >
              <User size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            <div>
              <h2 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                {user.name}
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                {user.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-full ${
              isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'
            }`}
          >
            <X size={20} className={isDark ? 'text-slate-400' : 'text-slate-600'} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* WhatsApp Phone */}
          <div>
            <label className={`flex items-center gap-2 font-semibold mb-2 ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <MessageCircle size={18} className="text-green-600" />
              Teléfono WhatsApp
            </label>
            <input
              type="tel"
              value={whatsappPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+54 9 11 2345 6789"
              className={`w-full px-4 py-2 rounded-lg border ${
                phoneError
                  ? isDark
                    ? 'border-red-500/50 bg-red-900/10'
                    : 'border-red-300 bg-red-50'
                  : isDark
                  ? 'border-slate-700 bg-slate-800'
                  : 'border-slate-200 bg-slate-50'
              } ${isDark ? 'text-slate-100' : 'text-slate-900'} placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-green-500`}
            />
            {phoneError && (
              <p className="text-sm text-red-500 mt-1">{phoneError}</p>
            )}
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Se usará para compartir ventas y productos por WhatsApp
            </p>
          </div>

          {/* IA Provider */}
          <div>
            <label className={`flex items-center gap-2 font-semibold mb-2 ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <Zap size={18} className="text-purple-600" />
              Proveedor de IA
            </label>
            <div className="space-y-2">
              {[
                { value: IAProvider.GEMINI, label: 'Google Gemini (Login)', color: 'blue' },
                { value: IAProvider.OPENAI, label: 'ChatGPT (API Key)', color: 'emerald' },
                { value: IAProvider.ANTHROPIC, label: 'Anthropic Claude (API Key)', color: 'amber' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer border ${
                    iaProvider === option.value
                      ? isDark
                        ? `bg-${option.color}-900/30 border-${option.color}-700`
                        : `bg-${option.color}-50 border-${option.color}-300`
                      : isDark
                      ? 'border-slate-700 hover:bg-slate-800'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    value={option.value}
                    checked={iaProvider === option.value}
                    onChange={(e) => setIaProvider(e.target.value as IAProvider)}
                    className="w-4 h-4"
                  />
                  <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* IA API Key (solo para OpenAI/Anthropic) */}
          {iaProvider !== IAProvider.GEMINI && (
            <div>
              <label className={`flex items-center gap-2 font-semibold mb-2 ${
                isDark ? 'text-slate-200' : 'text-slate-800'
              }`}>
                <Lock size={18} className="text-red-600" />
                API Key
              </label>
              <div className="relative">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={iaApiKey}
                  onChange={(e) => setIaApiKey(e.target.value)}
                  placeholder="sk-..."
                  className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                    isDark
                      ? 'border-slate-700 bg-slate-800 text-slate-100'
                      : 'border-slate-200 bg-slate-50 text-slate-900'
                  } placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-red-500`}
                />
                <button
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={`absolute right-3 top-2.5 ${
                    isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {showApiKey ? '👁️' : '🔒'}
                </button>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Guardada de forma encriptada. Nunca se envía al servidor.
              </p>
            </div>
          )}

          {/* Notifications */}
          <div>
            <label className={`flex items-center gap-2 font-semibold mb-3 ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <Bell size={18} className="text-amber-600" />
              Notificaciones
            </label>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between ${
                notificationsEnabled
                  ? isDark
                    ? 'bg-amber-900/30 border-amber-700'
                    : 'bg-amber-50 border-amber-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {notificationsEnabled ? 'Habilitadas' : 'Deshabilitadas'}
              </span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                notificationsEnabled
                  ? isDark ? 'bg-amber-600' : 'bg-amber-500'
                  : isDark ? 'bg-slate-600' : 'bg-slate-300'
              }`}>
                {notificationsEnabled && <span className="text-white text-sm">✓</span>}
              </div>
            </button>
          </div>

          {/* Theme */}
          <div>
            <label className={`flex items-center gap-2 font-semibold mb-3 ${
              isDark ? 'text-slate-200' : 'text-slate-800'
            }`}>
              <Moon size={18} className="text-indigo-600" />
              Tema Oscuro
            </label>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`w-full px-4 py-3 rounded-lg border flex items-center justify-between ${
                darkMode
                  ? isDark
                    ? 'bg-indigo-900/30 border-indigo-700'
                    : 'bg-indigo-50 border-indigo-300'
                  : isDark
                  ? 'bg-slate-800 border-slate-700'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <span className={isDark ? 'text-slate-200' : 'text-slate-800'}>
                {darkMode ? 'Activado' : 'Desactivado'}
              </span>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                darkMode
                  ? isDark ? 'bg-indigo-600' : 'bg-indigo-500'
                  : isDark ? 'bg-slate-600' : 'bg-slate-300'
              }`}>
                {darkMode && <span className="text-white text-sm">✓</span>}
              </div>
            </button>
          </div>

          {/* Success Message */}
          {saveSuccess && (
            <div className="px-4 py-3 rounded-lg bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 text-sm font-medium">
              ✓ Configuración guardada correctamente
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={`sticky bottom-0 flex gap-3 p-4 border-t ${
          isDark ? 'border-slate-800 bg-slate-900/95' : 'border-slate-100 bg-white/95'
        }`}>
          <button
            onClick={onClose}
            className={`flex-1 px-4 py-3 rounded-lg border font-semibold ${
              isDark
                ? 'border-slate-700 hover:bg-slate-800 text-slate-200'
                : 'border-slate-200 hover:bg-slate-100 text-slate-700'
            }`}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!!phoneError}
            className={`flex-1 px-4 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
              phoneError
                ? 'opacity-50 cursor-not-allowed bg-slate-400'
                : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
            }`}
          >
            <Save size={18} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
