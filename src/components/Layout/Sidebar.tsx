import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowUpDown, PieChart, Wallet, Target,
  CreditCard, Receipt, Calendar, BarChart3, Settings, LogOut, TrendingUp, AlertTriangle,
} from 'lucide-react';
import { useFinance } from '../../store/FinanceContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/transactions', icon: ArrowUpDown, label: 'Movimientos' },
  { to: '/budget', icon: PieChart, label: 'Presupuesto' },
  { to: '/charts', icon: BarChart3, label: 'Gráficos' },
  { to: '/calendar', icon: Calendar, label: 'Calendario' },
  { to: '/income', icon: TrendingUp, label: 'Ingresos' },
  { to: '/accounts', icon: Wallet, label: 'Cuentas' },
  { to: '/credit-cards', icon: CreditCard, label: 'Tarjetas' },
  { to: '/debts', icon: Receipt, label: 'Deudas' },
  { to: '/goals', icon: Target, label: 'Metas' },
  { to: '/leaks', icon: AlertTriangle, label: 'Fugas' },
  { to: '/reports', icon: BarChart3, label: 'Informes' },
  { to: '/settings', icon: Settings, label: 'Ajustes' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { dispatch } = useFinance();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 z-50 transform transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } flex flex-col`}
      >
        <div className="p-5 border-b border-slate-100">
          <h1 className="text-xl font-bold text-indigo-600">FINANZAS PRO</h1>
          <p className="text-[11px] text-slate-400 mt-0.5">Controla tu dinero</p>
        </div>
        <nav className="flex-1 overflow-y-auto py-3 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all mb-0.5 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button
            onClick={() => dispatch({ type: 'LOGOUT' })}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 w-full transition-colors"
          >
            <LogOut size={18} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  );
}
