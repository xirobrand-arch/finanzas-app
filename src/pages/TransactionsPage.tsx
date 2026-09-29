import { useState, useMemo } from 'react';
import { Search, Filter, Edit3, Trash2, Copy, Plus, Download } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import TransactionModal from '../components/Transactions/TransactionModal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { Transaction } from '../types';
import { formatCurrency, formatDate, getPaymentMethodLabel, getTransactionTypeLabel } from '../utils/format';

export default function TransactionsPage() {
  const { state, dispatch } = useFinance();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterNecessary, setFilterNecessary] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [editTx, setEditTx] = useState<Transaction | undefined>();
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return state.transactions.filter((t) => {
      if (search) {
        const s = search.toLowerCase();
        const cat = state.categories.find((c) => c.id === t.categoryId);
        if (
          !t.description.toLowerCase().includes(s) &&
          !cat?.name.toLowerCase().includes(s) &&
          !String(t.amount).includes(s)
        ) return false;
      }
      if (filterType !== 'all' && t.type !== filterType) return false;
      if (filterCategory !== 'all' && t.categoryId !== filterCategory) return false;
      if (filterMethod !== 'all' && t.paymentMethod !== filterMethod) return false;
      if (filterNecessary !== 'all' && t.isNecessary !== filterNecessary) return false;
      if (filterMonth !== 'all') {
        const d = new Date(t.date + 'T00:00:00');
        const key = `${d.getFullYear()}-${d.getMonth()}`;
        if (key !== filterMonth) return false;
      }
      return true;
    });
  }, [state.transactions, state.categories, search, filterType, filterCategory, filterMethod, filterNecessary, filterMonth]);

  function handleDuplicate(tx: Transaction) {
    dispatch({
      type: 'ADD_TRANSACTION',
      payload: {
        type: tx.type, amount: tx.amount, date: tx.date, time: tx.time,
        categoryId: tx.categoryId, subcategoryId: tx.subcategoryId,
        description: tx.description, paymentMethod: tx.paymentMethod,
        accountId: tx.accountId, isNecessary: tx.isNecessary,
        isRecurring: tx.isRecurring, notes: tx.notes,
      },
    });
  }

  function handleExportCSV() {
    const headers = ['Fecha', 'Descripción', 'Categoría', 'Tipo', 'Método', 'Monto', 'Necesario'];
    const rows = filtered.map((t) => {
      const cat = state.categories.find((c) => c.id === t.categoryId);
      return [t.date, t.description, cat?.name || '', getTransactionTypeLabel(t.type), getPaymentMethodLabel(t.paymentMethod), t.amount, t.isNecessary];
    });
    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'movimientos.csv';
    link.click();
  }

  const typeColor: Record<string, string> = {
    income: 'text-emerald-600 bg-emerald-50',
    expense: 'text-red-600 bg-red-50',
    transfer: 'text-blue-600 bg-blue-50',
    saving: 'text-indigo-600 bg-indigo-50',
    investment: 'text-amber-600 bg-amber-50',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Movimientos</h2>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500" title="Exportar CSV">
            <Download size={18} />
          </button>
          <button onClick={() => { setEditTx(undefined); setShowModal(true); }} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
            <Plus size={16} /> Nuevo
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar movimientos..."
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-2.5 rounded-xl border transition-colors ${showFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <Filter size={16} />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-slate-100">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <option value="all">Todos los tipos</option>
              <option value="income">Ingresos</option>
              <option value="expense">Gastos</option>
              <option value="transfer">Transferencias</option>
              <option value="saving">Ahorros</option>
              <option value="investment">Inversiones</option>
            </select>
            <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <option value="all">Todas las categorías</option>
              {state.categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
            </select>
            <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <option value="all">Todos los métodos</option>
              <option value="cash">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="debit_card">Tarjeta débito</option>
              <option value="credit_card">Tarjeta crédito</option>
              <option value="bank_transfer">Transferencia</option>
            </select>
            <select value={filterNecessary} onChange={(e) => setFilterNecessary(e.target.value)} className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <option value="all">Necesidad</option>
              <option value="yes">Necesario</option>
              <option value="no">Innecesario</option>
              <option value="unsure">No estoy seguro</option>
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Fecha</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500">Descripción</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden sm:table-cell">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden md:table-cell">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-slate-500 hidden lg:table-cell">Método</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-slate-500">Monto</th>
                <th className="px-4 py-3 text-xs font-medium text-slate-500 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-slate-400">Sin movimientos</td></tr>
              ) : (
                filtered.map((t) => {
                  const cat = state.categories.find((c) => c.id === t.categoryId);
                  return (
                    <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{formatDate(t.date)}</td>
                      <td className="px-4 py-3 text-slate-800 font-medium max-w-[200px] truncate">{t.description || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 hidden sm:table-cell">{cat?.icon} {cat?.name}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${typeColor[t.type] || ''}`}>
                          {getTransactionTypeLabel(t.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell text-xs">{getPaymentMethodLabel(t.paymentMethod)}</td>
                      <td className={`px-4 py-3 text-right font-semibold whitespace-nowrap ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-0.5">
                          <button onClick={() => { setEditTx(t); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Edit3 size={14} /></button>
                          <button onClick={() => handleDuplicate(t)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Copy size={14} /></button>
                          <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TransactionModal isOpen={showModal} onClose={() => { setShowModal(false); setEditTx(undefined); }} editTransaction={editTx} />
      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar movimiento"
        message="¿Estás seguro de eliminar este movimiento? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => { if (deleteId) dispatch({ type: 'DELETE_TRANSACTION', payload: deleteId }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
