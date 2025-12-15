import React, { useState, useEffect } from 'react';
import { User as UserType, IAProvider } from '../types';
import { getUserSettings, saveUserSettings, encryptCredential, decryptCredential } from '../services/userSettingsService';
import { X, Save, Lock, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

interface UserSettingsProps {
  user: UserType;
  isDark: boolean;
  onClose: () => void;
}

const UserSettings: React.FC<UserSettingsProps> = ({ user, isDark, onClose }) => {
  const [iaProvider, setIaProvider] = useState<IAProvider>(IAProvider.GEMINI);
  const [iaApiKey, setIaApiKey] = useState(''); // OpenAI/Anthropic
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [googleToken, setGoogleToken] = useState('');
  const [geminiLoginValidatedAt, setGeminiLoginValidatedAt] = useState<number | undefined>(undefined);
  const [geminiMode, setGeminiMode] = useState<'login' | 'apikey'>('login');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationMessage, setValidationMessage] = useState('');

  useEffect(() => {
    const settings = getUserSettings(user.id);
    setIaProvider(settings.iaProvider || IAProvider.GEMINI);
    setIaApiKey(settings.iaApiKey ? decryptCredential(settings.iaApiKey) : '');
    setGeminiApiKey(settings.geminiApiKey ? decryptCredential(settings.geminiApiKey) : '');
    setGoogleToken(settings.googleAccessToken ? decryptCredential(settings.googleAccessToken) : '');
    setGeminiLoginValidatedAt(settings.geminiLoginValidatedAt);
    setGeminiMode(settings.geminiApiKey ? 'apikey' : 'login');
  }, [user.id]);

  const handleSave = () => {
    const settings = getUserSettings(user.id);

    saveUserSettings({
      ...settings,
      iaProvider,
      iaApiKey: iaApiKey && (iaProvider === IAProvider.OPENAI || iaProvider === IAProvider.ANTHROPIC) ? encryptCredential(iaApiKey) : undefined,
      geminiApiKey: geminiApiKey && geminiMode === 'apikey' ? encryptCredential(geminiApiKey) : undefined,
      googleAccessToken: googleToken && geminiMode === 'login' ? encryptCredential(googleToken) : undefined,
      geminiLoginValidatedAt: geminiMode === 'login' && googleToken ? (geminiLoginValidatedAt || Date.now()) : undefined,
    });

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleValidateGeminiLogin = () => {
    if (!googleToken) {
      setValidationMessage('Ingresa tu token de Google antes de validar.');
      return;
    }
    setGeminiLoginValidatedAt(Date.now());
    setValidationMessage('Login validado (marcado localmente).');
  };

  const handleValidateGeminiApiKey = () => {
    if (!geminiApiKey) {
      setValidationMessage('Ingresa tu API Key de Gemini.');
      return;
    }
    if (geminiApiKey.length < 20) {
      setValidationMessage('API Key muy corta. Verifica el valor.');
      return;
    }
    setValidationMessage('API Key parece válida.');
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
                isDark ? 'bg-purple-900/30' : 'bg-purple-100'
              }`}
            >
              <Sparkles size={20} className={isDark ? 'text-purple-400' : 'text-purple-600'} />
            </div>
            <div>
              <h2 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
                Inteligencia Artificial
              </h2>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                Configuración de IA
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

          {/* Gemini Mode */}
          {iaProvider === IAProvider.GEMINI && (
            <div className={`p-3 rounded-xl border ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
              <p className={`text-sm font-bold mb-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>Modo de Autenticación Gemini</p>
              <div className="flex gap-3 mb-3">
                <button
                  type="button"
                  onClick={() => setGeminiMode('login')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-semibold ${
                    geminiMode === 'login'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200'
                      : isDark
                      ? 'border-slate-700 text-slate-200'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  Login con Google
                </button>
                <button
                  type="button"
                  onClick={() => setGeminiMode('apikey')}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-semibold ${
                    geminiMode === 'apikey'
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200'
                      : isDark
                      ? 'border-slate-700 text-slate-200'
                      : 'border-slate-200 text-slate-700'
                  }`}
                >
                  API Key
                </button>
              </div>

              {geminiMode === 'login' && (
                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Token de acceso Google (pegalo desde tu login)</label>
                  <input
                    type="text"
                    value={googleToken}
                    onChange={(e) => setGoogleToken(e.target.value)}
                    placeholder="token de OAuth..."
                    className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
                  />
                  <button
                    type="button"
                    onClick={handleValidateGeminiLogin}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95"
                  >
                    Validar login
                  </button>
                  {geminiLoginValidatedAt && (
                    <p className="text-xs text-emerald-500 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Login validado
                    </p>
                  )}
                </div>
              )}

              {geminiMode === 'apikey' && (
                <div className="space-y-2">
                  <label className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>API Key de Gemini</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AI..."
                      className={`w-full px-4 py-2 pr-10 rounded-lg border ${
                        isDark
                          ? 'border-slate-700 bg-slate-800 text-slate-100'
                          : 'border-slate-200 bg-slate-50 text-slate-900'
                      } placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className={`absolute right-3 top-2.5 ${
                        isDark ? 'text-slate-400 hover:text-slate-200' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {showApiKey ? '👁️' : '🔒'}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={handleValidateGeminiApiKey}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 active:scale-95"
                  >
                    Validar API Key
                  </button>
                </div>
              )}
            </div>
          )}

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

          {/* Success Message */}
          {saveSuccess && (
            <div className={`p-3 rounded-lg text-sm font-medium flex items-center gap-2 ${
              isDark
                ? 'bg-emerald-900/30 text-emerald-200 border border-emerald-700'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-300'
            }`}>
              ✓ Configuración guardada
            </div>
          )}
          {validationMessage && (
            <div className={`p-3 rounded-lg text-sm ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
              {validationMessage}
            </div>
          )}

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Save size={18} />
            Guardar Configuración IA
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
