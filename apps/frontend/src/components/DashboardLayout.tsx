'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuthStore } from '@/store/auth';
import { 
  LayoutDashboard, 
  Users, 
  ListTree, 
  Bot, 
  TrendingUp, 
  Megaphone,
  Plug,
  Calendar,
  Settings,
  MessageSquare,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  Sun,
  Moon,
  MessagesSquare
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: number;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Leads', href: '/dashboard/leads', icon: Users },
  { name: 'Filas', href: '/dashboard/filas', icon: ListTree },
  { name: 'Agentes de IA', href: '/dashboard/agentes', icon: Bot },
  { name: 'Mensagens', href: '/dashboard/mensagens', icon: MessageSquare },
  { name: 'Chat Interno', href: '/dashboard/chat-interno', icon: MessagesSquare },
  { name: 'Tráfego Pago', href: '/dashboard/trafego', icon: TrendingUp },
  { name: 'Publicidades', href: '/dashboard/publicidades', icon: Megaphone },
  { name: 'Vendas', href: '/dashboard/vendas', icon: DollarSign },
  { name: 'Integrações', href: '/dashboard/integracoes', icon: Plug },
  { name: 'Calendário', href: '/dashboard/calendario', icon: Calendar },
  { name: 'Configurações', href: '/dashboard/configuracoes', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = () => {
    clearAuth();
    localStorage.removeItem('auth-storage');
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-dark-950 dark:via-dark-900 dark:to-dark-800 transition-colors duration-300">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-blue-600 to-indigo-600 dark:from-dark-900 dark:to-dark-950 transition-all duration-300 z-40 shadow-2xl ${collapsed ? 'w-20' : 'w-64'}`}>
        {/* Logo */}
        <div className="h-24 flex items-center justify-center px-4 border-b border-white/10 dark:border-white/5 py-4">
          {!collapsed && (
            <div className="flex items-center justify-center w-full">
              <img src="/logo.png" alt="NEXO CRM" className="h-20 w-auto drop-shadow-2xl brightness-0 invert" onError={(e) => { e.currentTarget.style.display = 'none' }} />
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1 overflow-y-auto h-[calc(100vh-8rem)] scrollbar-thin">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group relative overflow-hidden ${
                  isActive
                    ? 'bg-white dark:bg-dark-800 text-blue-600 dark:text-blue-400 shadow-lg'
                    : 'text-white/90 dark:text-gray-300 hover:bg-white/10 dark:hover:bg-white/5'
                }`}
              >
                <item.icon size={20} className={`relative z-10 ${collapsed ? 'mx-auto' : ''}`} />
                {!collapsed && (
                  <>
                    <span className="flex-1 font-medium relative z-10">{item.name}</span>
                    {item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold relative z-10 ${
                        isActive
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-white/20 dark:bg-white/10 text-white'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-white/10 dark:border-white/5 bg-gradient-to-b from-transparent to-black/10 dark:to-black/30">
          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 text-white transition-colors">
            <LogOut size={20} className={collapsed ? 'mx-auto' : ''} />
            {!collapsed && <span className="font-medium">Sair</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${collapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="h-16 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-dark-900 dark:to-dark-950 border-b border-white/10 dark:border-white/5 flex items-center justify-between px-6 sticky top-0 z-30 shadow-lg">
          <div>
            <h1 className="text-xl font-bold text-white">
              {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>
            <p className="text-sm text-white/80">
              Sistema Operacional do Negócio
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 text-white transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5 text-white transition-colors">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full animate-pulse"></span>
            </button>
            
            {/* User Profile */}
            <div className="flex items-center gap-3 pl-3 border-l border-white/20 dark:border-white/10">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.name || user?.email || 'Usuario'}</p>
                <p className="text-xs text-white/80">{user?.role === 'admin' ? 'Administrador' : 'Colaborador'}</p>
              </div>
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
                <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold ring-2 ring-white/20">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
