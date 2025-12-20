import React from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';

interface NetworkStatusProps {
  isOnline: boolean;
  isSyncing: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ isOnline, isSyncing }) => {
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-slate-300 rounded-full text-xs font-medium border border-slate-700 shadow-sm animate-pulse">
        <WifiOff size={14} className="text-red-400" />
        <span>Offline</span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-800">
        <RefreshCw size={14} className="animate-spin" />
        <span>Sincronizando...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium border border-emerald-200 dark:border-emerald-800 transition-all duration-500">
      <CheckCircle2 size={14} />
      <span>Sincronizado</span>
    </div>
  );
};

export default NetworkStatus;
