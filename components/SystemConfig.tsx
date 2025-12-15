import React, { useState, useEffect } from 'react';

interface SystemConfigProps {
  isDark: boolean;
  onClose: () => void;
}

const SystemConfig: React.FC<SystemConfigProps> = ({ isDark, onClose }) => {
  const [defaultThemeDark, setDefaultThemeDark] = useState<boolean>(false);
  const [defaultLanguage, setDefaultLanguage] = useState<string>('es');
  const [currency, setCurrency] = useState<string>('ARS');
  const [backupInterval, setBackupInterval] = useState<number>(0);

  useEffect(() => {
    // Load system prefs from localStorage
    const prefs = JSON.parse(localStorage.getItem('system_config') || '{}');
    if (prefs.defaultThemeDark !== undefined) setDefaultThemeDark(!!prefs.defaultThemeDark);
    if (prefs.defaultLanguage) setDefaultLanguage(prefs.defaultLanguage);
    if (prefs.currency) setCurrency(prefs.currency);
    if (prefs.backupInterval !== undefined) setBackupInterval(Number(prefs.backupInterval));
  }, []);

  const handleSave = () => {
    const prefs = { defaultThemeDark, defaultLanguage, currency, backupInterval };
    localStorage.setItem('system_config', JSON.stringify(prefs));
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-end md:items-center justify-center animate-fade-in">
      <div className={`w-full md:w-[520px] rounded-t-3xl md:rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto ${isDark ? 'bg-slate-900' : 'bg-white'} transition-colors`}>
        <div className={`sticky top-0 flex items-center justify-between p-4 border-b ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
          <div>
            <h2 className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Configuración del Sistema</h2>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Preferencias generales y operativas</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>✕</button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className={`flex items-center gap-2 font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Tema por defecto</label>
            <button
              type="button"
              onClick={() => setDefaultThemeDark(!defaultThemeDark)}
              className={`w-full px-4 py-2 rounded-lg border flex items-center justify-between text-sm font-medium ${
                defaultThemeDark
                  ? 'bg-indigo-50 border-indigo-300 dark:bg-indigo-900/20 dark:border-indigo-700 text-indigo-800 dark:text-indigo-200'
                  : 'bg-slate-50 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              {defaultThemeDark ? 'Oscuro' : 'Claro'}
              <span className={`w-5 h-5 rounded-full ${defaultThemeDark ? 'bg-indigo-500' : 'bg-slate-400 dark:bg-slate-600'}`} />
            </button>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Se aplicará al primer uso y usuarios nuevos.</p>
          </div>

          <div>
            <label className={`flex items-center gap-2 font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Idioma por defecto</label>
            <select
              value={defaultLanguage}
              onChange={(e) => setDefaultLanguage(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
              <option value="pt">Português</option>
            </select>
          </div>

          <div>
            <label className={`flex items-center gap-2 font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Formato de moneda</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
            >
              <option value="ARS">ARS (Peso Argentino)</option>
              <option value="USD">USD (Dólar)</option>
              <option value="BRL">BRL (Real)</option>
            </select>
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Determinará el símbolo y separación de miles/decimales.</p>
          </div>

          <div>
            <label className={`flex items-center gap-2 font-semibold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>Backup automático (minutos)</label>
            <input
              type="number"
              min={0}
              placeholder="0 (desactivado)"
              value={backupInterval}
              onChange={(e) => setBackupInterval(Number(e.target.value))}
              className={`w-full px-4 py-2 rounded-lg border ${isDark ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-slate-200 bg-slate-50 text-slate-900'}`}
            />
            <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Define cada cuánto realizar un backup local automático.</p>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
