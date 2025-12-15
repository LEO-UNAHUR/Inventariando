
import React, { useState, useEffect } from 'react';
import { View, User, Role } from '../types';
import { 
    ChevronsLeft, LayoutDashboard, PackageSearch, ShoppingBag, Users, 
    DollarSign, Shield, Sparkles, Truck, Tag, UserCircle, 
    Database, LogOut, ChevronRight, BarChart3, Settings
} from 'lucide-react';
import { getFooterText } from '../services/appMetadataService';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: View) => void;
  currentView: View;
  currentUser: User;
  onLogout: () => void;
  onOpenDataManagement: () => void;
  onOpenUserSettings?: () => void;
    onOpenSystemConfig?: () => void;
  onOpenAnalyticsDashboard?: () => void;
  isDark: boolean;
  isDesktop: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
    isOpen, onClose, onNavigate, currentView, currentUser, 
    onLogout, onOpenDataManagement, onOpenUserSettings, onOpenAnalyticsDashboard, onOpenSystemConfig, isDark, isDesktop 
}) => {
  const [footerText, setFooterText] = useState('Inventariando');

  // Cargar información del footer al montar
  useEffect(() => {
    const loadFooter = async () => {
      const text = await getFooterText();
      setFooterText(text);
    };
    loadFooter();
  }, []);
  
  const menuItems = [
    { view: View.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
    { view: View.INVENTORY, label: 'Inventario', icon: PackageSearch },
    { view: View.SALES, label: 'Ventas (POS)', icon: ShoppingBag },
    { view: View.CUSTOMERS, label: 'Clientes', icon: Users },
    { view: View.PROMOTIONS, label: 'Ofertas & Promos', icon: Tag },
    { view: View.SUPPLIERS, label: 'Proveedores', icon: Truck },
    { view: View.FINANCE, label: 'Finanzas', icon: DollarSign, role: [Role.ADMIN, Role.MANAGER] },
    { view: View.ANALYSIS, label: 'Inteligencia Artificial', icon: Sparkles, role: [Role.ADMIN, Role.MANAGER] },
    { view: View.TEAM, label: 'Equipo', icon: Shield, role: [Role.ADMIN] },
    { view: View.SECURITY, label: 'Seguridad & Backup', icon: Database }, // Mapped to Security View
  ];

  const handleNav = (view: View) => {
    onNavigate(view);
    onClose();
  };

  const getAvatarContent = () => {
    if (currentUser.avatar?.startsWith('data:image')) {
        return <img src={currentUser.avatar} alt="Profile" className="w-full h-full object-cover" />;
    }
    // Fallback for old avatars or initials
    return <UserCircle size={40} className="text-slate-400" />;
  };

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[60] transition-opacity duration-300 backdrop-blur-sm ${isOpen && !isDesktop ? 'opacity-100' : 'opacity-0 pointer-events-none'} ${isDesktop ? 'hidden' : ''}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
    <div className={`fixed lg:static top-0 left-0 h-full w-[80%] max-w-xs lg:w-72 bg-white dark:bg-slate-900 z-[70] transform transition-transform duration-300 shadow-2xl lg:shadow-none flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`} data-tour="sidebar">
        
        {/* Header Profile */}
        <div className="p-6 bg-slate-100 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-4">
            <div className="flex justify-between items-start">
                <div 
                    onClick={() => handleNav(View.PROFILE)}
                    className="w-16 h-16 rounded-full bg-white dark:bg-slate-800 shadow-md overflow-hidden flex items-center justify-center cursor-pointer border-2 border-white dark:border-slate-700"
                >
                    {getAvatarContent()}
                </div>
                {!isDesktop && (
                    <button
                        onClick={onClose}
                        className={`p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm text-slate-500 ${isDark ? 'hover:bg-slate-800' : 'hover:bg-slate-100'}`}
                        title="Cerrar panel"
                        aria-label="Cerrar menú"
                    >
                        <ChevronsLeft size={20} />
                    </button>
                )}
            </div>
            <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{currentUser.name}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.role}</p>
            </div>
            <button 
                onClick={() => handleNav(View.PROFILE)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
                Editar Perfil <ChevronRight size={12} />
            </button>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto py-2">
            <nav className="px-3 space-y-1">
                {menuItems.map((item) => {
                    if (item.role && !item.role.includes(currentUser.role)) return null;
                    
                    const isActive = currentView === item.view;
                    return (
                        <button
                            key={item.view}
                            onClick={() => handleNav(item.view)}
                            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all active:scale-95 ${isActive ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                        >
                            <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-400'} />
                            <span className="font-medium text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </nav>

            <div className="px-6 py-4 mt-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Sistema</p>
                <button 
                    onClick={() => { onOpenDataManagement(); onClose(); }}
                    className="w-full flex items-center gap-3 px-0 py-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                    <Database size={18} />
                    <span className="text-sm font-medium">Gestión de Datos</span>
                </button>
                {onOpenAnalyticsDashboard && (
                    <button 
                        onClick={() => { onOpenAnalyticsDashboard(); onClose(); }}
                        className="w-full flex items-center gap-3 px-0 py-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <BarChart3 size={18} />
                        <span className="text-sm font-medium">Métricas Internas</span>
                    </button>
                )}
                {onOpenSystemConfig && (
                    <button 
                        onClick={() => { onOpenSystemConfig(); onClose(); }}
                        className="w-full flex items-center gap-3 px-0 py-3 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                        <Settings size={18} />
                        <span className="text-sm font-medium">Configuración</span>
                    </button>
                )}
            </div>
        </div>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
            <button 
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
                <LogOut size={18} /> Cerrar Sesión
            </button>
            <p className="text-xs text-center text-slate-400 dark:text-slate-500 mt-3 leading-relaxed px-2">{footerText}</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
