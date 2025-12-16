
import React, { useEffect, useState } from 'react';
import { User, Backup } from '../types';
import { createBackup, getStoredBackups, restoreBackup, deleteBackup } from '../services/storageService';
import { Shield, Smartphone, Globe, Clock, Download, RefreshCw, Trash2, CheckCircle, AlertTriangle, FileJson, Cloud, Sun, Moon } from 'lucide-react';

interface SecurityPanelProps {
  user: User;
  isDark: boolean;
  onToggleTheme: () => void;
}

const SecurityPanel: React.FC<SecurityPanelProps> = ({ user, isDark, onToggleTheme }) => {
  const [activeTab, setActiveTab] = useState<'BACKUP' | 'SECURITY'>('BACKUP');
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true); // Mock setting

  useEffect(() => {
    setBackups(getStoredBackups());
  }, []);

  const handleCreateBackup = () => {
      setIsProcessing(true);
      // Simulate cloud upload delay
      setTimeout(() => {
          const newBackup = createBackup(false);
          setBackups([newBackup, ...backups]);
          setIsProcessing(false);
      }, 1500);
  };

  const handleRestore = (id: string) => {
      if (window.confirm("ATENCIÓN: Esto sobrescribirá todos los datos actuales con la copia seleccionada. ¿Continuar?")) {
          setIsProcessing(true);
          setTimeout(() => {
              const success = restoreBackup(id);
              setIsProcessing(false);
              if (success) {
                  alert("Sistema restaurado correctamente. Se recargará la página.");
                  window.location.reload();
              } else {
                  alert("Error al restaurar.");
              }
          }, 2000);
      }
  };

  const handleDeleteBackup = (id: string) => {
      if (window.confirm("¿Eliminar esta copia de seguridad?")) {
          setBackups(deleteBackup(id));
      }
  };

  return (
    <div className="h-full flex flex-col pb-20 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Header */}
      <header className="sticky top-0 bg-slate-50 dark:bg-slate-950 z-10 p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center transition-colors">
        <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Shield className="text-emerald-600 dark:text-emerald-400" />
                Seguridad
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Respaldo y Acceso</p>
        </div>
        <button 
            onClick={onToggleTheme}
            className="p-2 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
        >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </header>

      {/* Tabs */}
      <div className="p-4 pb-0">
          <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
            <button
                onClick={() => setActiveTab('BACKUP')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'BACKUP' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
                Copia de Seguridad
            </button>
            <button
                onClick={() => setActiveTab('SECURITY')}
                className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'SECURITY' ? 'bg-white dark:bg-slate-700 shadow text-slate-900 dark:text-white' : 'text-slate-500'}`}
            >
                Autenticación
            </button>
          </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
          
          {activeTab === 'BACKUP' && (
              <div className="space-y-4 animate-fade-in">
                  
                  {/* Status Card */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-5 text-white shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-2">
                              <Cloud size={24} />
                              <h3 className="font-bold text-lg">Estado de la Nube</h3>
                          </div>
                          <span className="bg-blue-500/30 px-2 py-1 rounded text-xs font-medium">Conectado</span>
                      </div>
                      <p className="text-blue-100 text-sm mb-4">
                          Las copias automáticas están {autoBackup ? 'activadas' : 'desactivadas'}. Se realizan diariamente a las 00:00.
                      </p>
                      <div className="flex items-center justify-between bg-black/10 p-3 rounded-xl">
                          <span className="text-sm font-medium">Auto-Exportar a JSON</span>
                          <button 
                            onClick={() => setAutoBackup(!autoBackup)}
                            className={`w-10 h-6 rounded-full p-1 transition-colors ${autoBackup ? 'bg-emerald-400' : 'bg-slate-400'}`}
                          >
                              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${autoBackup ? 'translate-x-4' : ''}`} />
                          </button>
                      </div>
                  </div>

                  {/* Action Button */}
                  <button 
                    onClick={handleCreateBackup}
                    disabled={isProcessing}
                    className="w-full py-4 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 rounded-xl shadow-sm flex items-center justify-center gap-2 text-blue-600 dark:text-blue-400 font-bold active:scale-95 transition-all hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                      {isProcessing ? <RefreshCw className="animate-spin" /> : <Download />}
                      Crear Copia de Seguridad Ahora
                  </button>

                  {/* List */}
                  <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 px-1">Historial de Copias</h3>
                      <div className="space-y-3">
                          {backups.length === 0 ? (
                              <p className="text-center text-slate-400 py-4 text-sm">No hay copias disponibles.</p>
                          ) : (
                              backups.map(backup => (
                                  <div key={backup.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                      <div className="flex items-center gap-3">
                                          <div className={`p-2 rounded-full ${backup.autoGenerated ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30'}`}>
                                              <FileJson size={20} />
                                          </div>
                                          <div>
                                              <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                                  {new Date(backup.date).toLocaleDateString()}
                                              </p>
                                              <p className="text-xs text-slate-500">
                                                  {new Date(backup.date).toLocaleTimeString()} • {backup.size} • {backup.autoGenerated ? 'Auto' : 'Manual'}
                                              </p>
                                          </div>
                                      </div>
                                      <div className="flex gap-2">
                                          <button 
                                            onClick={() => handleRestore(backup.id)}
                                            className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                                            title="Restaurar"
                                          >
                                              <RefreshCw size={18} />
                                          </button>
                                          <button 
                                            onClick={() => handleDeleteBackup(backup.id)}
                                            className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Eliminar"
                                          >
                                              <Trash2 size={18} />
                                          </button>
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          )}

          {activeTab === 'SECURITY' && (
              <div className="space-y-6 animate-fade-in">
                  
                  {/* Password & 2FA Card */}
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-sm">
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
                          <Shield size={18} className="text-emerald-500" /> Credenciales
                      </h3>
                      
                      <div className="flex items-center justify-between py-3 border-b border-slate-100 dark:border-slate-800">
                          <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Contraseña</p>
                              <p className="text-xs text-slate-500">Último cambio hace 30 días</p>
                          </div>
                          <button className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg">
                              Cambiar
                          </button>
                      </div>

                      <div className="flex items-center justify-between py-3">
                          <div>
                              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Autenticación de 2 Factores</p>
                              <p className="text-xs text-slate-500">Protege tu cuenta con un código extra</p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold ${user.is2FAEnabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {user.is2FAEnabled ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                              {user.is2FAEnabled ? 'Activado' : 'Desactivado'}
                          </div>
                      </div>
                  </div>

                  {/* Sessions */}
                  <div>
                      <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-3 px-1">Dispositivos Activos</h3>
                      <div className="space-y-3">
                          {user.sessions?.map(session => (
                              <div key={session.id} className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full text-slate-600 dark:text-slate-400">
                                          {session.deviceName.toLowerCase().includes('pc') ? <Globe size={20} /> : <Smartphone size={20} />}
                                      </div>
                                      <div>
                                          <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                                              {session.deviceName} {session.isCurrent && <span className="text-emerald-500 text-xs ml-1">(Actual)</span>}
                                          </p>
                                          <div className="flex items-center gap-2 text-xs text-slate-500">
                                              <span className="flex items-center gap-1"><Globe size={10} /> {session.ip}</span>
                                              <span className="flex items-center gap-1"><Clock size={10} /> {session.isCurrent ? 'Ahora' : 'Hace 1h'}</span>
                                          </div>
                                      </div>
                                  </div>
                                  {!session.isCurrent && (
                                      <button className="text-xs text-red-500 font-medium hover:underline">
                                          Cerrar
                                      </button>
                                  )}
                              </div>
                          ))}
                          {!user.sessions && <p className="text-slate-400 text-sm italic">No hay información de sesiones.</p>}
                      </div>
                  </div>

              </div>
          )}
      </div>
    </div>
  );
};

export default SecurityPanel;
