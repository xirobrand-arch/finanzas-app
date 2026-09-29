import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { getBudgetUsage } from '../utils/analysis';
import { formatCurrency, getMonthName } from '../utils/format';
import Modal from '../components/common/Modal';

export default function BudgetPage() {
  const { state, dispatch } = useFinance();
  const now = new Date();
  const [month] = useState(now.getMonth());
  const [year] = useState(now.getFullYear());
  const [showAdd, setShowAdd] = useState(false);
  const [newCatId, setNewCatId] = useState('');
  const [newLimit, setNewLimit] = useState('');

  const usage = getBudgetUsage(state.budgets, state.transactions, state.categories, month, year);
  const expenseCategories = state.categories.filter((c) => c.type === 'expense' || c.type === 'both');
  const existingCatIds = new Set(usage.map((u) => u.categoryId));
  const availableCategories = expenseCategories.filter((c) => !existingCatIds.has(c.id));

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatId || !newLimit) return;
    dispatch({
      type: 'ADD_BUDGET',
      payload: { categoryId: newCatId, limit: parseFloat(newLimit), month, year },
    });
    setNewCatId('');
    setNewLimit('');
    setShowAdd(false);
  }

  const totalBudget = usage.reduce((s, b) => s + b.limit, 0);
  const totalSpent = usage.reduce((s, b) => s + b.spent, 0);
  const totalPct = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Mi Presupuesto</h2>
          <p className="text-sm text-slate-500">{getMonthName(month)} {year}</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} /> Agregar
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-slate-700">Presupuesto total</span>
          <span className="text-sm text-slate-500">{formatCurrency(totalSpent)} / {formatCurrency(totalBudget)}</span>
        </div>
        <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              totalPct >= 100 ? 'bg-red-500' : totalPct >= 90 ? 'bg-amber-500' : totalPct >= 70 ? 'bg-yellow-400' : 'bg-indigo-500'
            }`}
            style={{ width: `${Math.min(totalPct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-1.5">{totalPct.toFixed(1)}% utilizado</p>
      </div>

      {/* Budget items */}
      <div className="space-y-3">
        {usage.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
            <p className="text-slate-400">No tienes presupuestos configurados.</p>
            <p className="text-slate-400 text-sm mt-1">Agrega límites para controlar tus gastos.</p>
          </div>
        ) : (
          usage.map((b) => (
            <div key={b.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{b.categoryIcon}</span>
                  <span className="font-medium text-slate-800">{b.categoryName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">
                    {formatCurrency(b.spent)} / {formatCurrency(b.limit)}
                  </span>
                  <button
                    onClick={() => dispatch({ type: 'DELETE_BUDGET', payload: b.id })}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    b.percentage >= 100 ? 'bg-red-500' : b.percentage >= 90 ? 'bg-amber-500' : b.percentage >= 70 ? 'bg-yellow-400' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(b.percentage, 100)}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-1.5">
                <span className={`text-xs font-medium ${
                  b.percentage >= 100 ? 'text-red-600' : b.percentage >= 90 ? 'text-amber-600' : 'text-slate-500'
                }`}>
                  {b.percentage}% utilizado
                  {b.percentage >= 100 && ' — Presupuesto superado'}
                  {b.percentage >= 90 && b.percentage < 100 && ' — Alerta'}
                  {b.percentage >= 70 && b.percentage < 90 && ' — Aviso'}
                </span>
                <span className="text-xs text-slate-400">
                  Disponible: {formatCurrency(Math.max(b.limit - b.spent, 0))}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Agregar presupuesto" size="sm">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Categoría</label>
            <select
              value={newCatId}
              onChange={(e) => setNewCatId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            >
              <option value="">Seleccionar</option>
              {availableCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Límite mensual (S/)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={newLimit}
              onChange={(e) => setNewLimit(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              required
            />
          </div>
          <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
            Agregar
          </button>
        </form>
      </Modal>
    </div>
  );
}
