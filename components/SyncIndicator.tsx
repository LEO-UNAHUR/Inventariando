import React, { useEffect, useState } from 'react';
import { Check, Clock, Wifi, WifiOff, Database } from 'lucide-react';

type SyncStatus = 'synced' | 'pending' | 'offline';

interface SyncIndicatorProps {
  isDark?: boolean;
  compact?: boolean; // compact=true para Sidebar, false para Dashboard
}

const SyncIndicator: React.FC<SyncIndicatorProps> = ({ isDark = false, compact = false }) => {
  const [status, setStatus] = useState<SyncStatus>('synced');
  const [lastBackup, setLastBackup] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Detectar estado de conectividad
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Cargar último backup y actualizar estado
  useEffect(() => {
    const updateBackupInfo = () => {
      try {
        const backupData = localStorage.getItem('lastBackupTime');
        if (backupData) {
          const timestamp = new Date(backupData);
          const now = new Date();
          const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

          setLastBackup(backupData);

          // Determinar estado
          if (!isOnline) {
            setStatus('offline');
          } else if (diffMinutes > 30) {
            // Más de 30 min sin backup
            setStatus('pending');
          } else {
            setStatus('synced');
          }
        } else {
          setStatus('pending');
        }
      } catch {
        setStatus('pending');
      }
    };

    updateBackupInfo();

    // Verificar cada minuto
    const interval = setInterval(updateBackupInfo, 60000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Formatear última vez que se sincronizó
  const formatLastSync = () => {
    if (!lastBackup) return 'nunca';
    const timestamp = new Date(lastBackup);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));

    if (diffMinutes < 1) return 'hace unos segundos';
    if (diffMinutes < 60) return `hace ${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `hace ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    return `hace ${diffDays}d`;
  };

  // Estilos según estado
  const getStatusColor = () => {
    switch (status) {
      case 'synced':
        return isDark ? 'text-green-400' : 'text-green-600';
      case 'pending':
        return isDark ? 'text-amber-400' : 'text-amber-600';
      case 'offline':
        return isDark ? 'text-red-400' : 'text-red-600';
      default:
        return isDark ? 'text-slate-400' : 'text-slate-600';
    }
  };

  const getStatusBgColor = () => {
    switch (status) {
      case 'synced':
        return isDark ? 'bg-green-900/30' : 'bg-green-50';
      case 'pending':
        return isDark ? 'bg-amber-900/30' : 'bg-amber-50';
      case 'offline':
        return isDark ? 'bg-red-900/30' : 'bg-red-50';
      default:
        return isDark ? 'bg-slate-800/50' : 'bg-slate-100';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'synced':
        return <Check size={16} />;
      case 'pending':
        return <Clock size={16} />;
      case 'offline':
        return <WifiOff size={16} />;
      default:
        return <Wifi size={16} />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'synced':
        return 'Sincronizado';
      case 'pending':
        return 'Sin sincronizar';
      case 'offline':
        return 'Sin conexión';
      default:
        return 'Estado desconocido';
    }
  };

  // Versión compacta para Sidebar
  if (compact) {
    return (
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium ${getStatusBgColor()} ${getStatusColor()}`}
        title={`${getStatusText()} — ${formatLastSync()}`}
      >
        <Database size={14} />
        <span>{formatLastSync()}</span>
      </div>
    );
  }

  // Versión completa para Dashboard/modales
  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border ${getStatusBgColor()} border-current/20`}
      title={`${getStatusText()}`}
    >
      <div className={`flex-shrink-0 ${getStatusColor()}`}>
        {getStatusIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${getStatusColor()}`}>
          {getStatusText()}
        </p>
        <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
          Última sincronización: {formatLastSync()}
        </p>
      </div>
    </div>
  );
};

export default SyncIndicator;
