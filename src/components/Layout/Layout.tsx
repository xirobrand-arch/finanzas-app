import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu, Bell, Plus } from 'lucide-react';
import Sidebar from './Sidebar';
import TransactionModal from '../Transactions/TransactionModal';
import { useFinance } from '../../store/FinanceContext';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [quickType, setQuickType] = useState<'expense' | 'income'>('expense');
  const { state } = useFinance();
  const unreadAlerts = state.alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-600"
            >
              <Menu size={22} />
            </button>
            <div className="hidden lg:block" />
            <div className="flex items-center gap-2">
              <button className="relative p-2 rounded-lg hover:bg-slate-100 text-slate-500">
                <Bell size={20} />
                {unreadAlerts > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </button>
            </div>
          </div>
        </header>

        <main className="p-4 lg:p-6 pb-24">
          <Outlet />
        </main>
      </div>

      {/* Floating action buttons */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-40">
        <button
          onClick={() => { setQuickType('income'); setShowQuickAdd(true); }}
          className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
          title="Nuevo ingreso"
        >
          <Plus size={22} />
        </button>
        <button
          onClick={() => { setQuickType('expense'); setShowQuickAdd(true); }}
          className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-105"
          title="Nuevo gasto"
        >
          <Plus size={26} />
        </button>
      </div>

      <TransactionModal
        isOpen={showQuickAdd}
        onClose={() => setShowQuickAdd(false)}
        defaultType={quickType}
      />
    </div>
  );
}
