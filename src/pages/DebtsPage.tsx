import { useState } from 'react';
import { Plus, Edit3, Trash2, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { formatCurrency } from '../utils/format';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { Debt } from '../types';

const debtTypes = [
  { value: 'personal', label: 'Préstamo personal', icon: '🤝' },
  { value: 'bank', label: 'Préstamo bancario', icon: '🏦' },
  { value: 'credit_card', label: 'Tarjeta de crédito', icon: '💳' },
  { value: 'mortgage', label: 'Hipoteca', icon: '🏠' },
  { value: 'car', label: 'Préstamo vehicular', icon: '🚗' },
  { value: 'student', label: 'Préstamo estudiantil', icon: '🎓' },
  { value: 'other', label: 'Otro', icon: '📋' },
] as const;

const statusColors: Record<string, string> = {
  active: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  paid: 'bg-emerald-100 text-emerald-700',
};

export default function DebtsPage() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editDebt, setEditDebt] = useState<Debt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Debt['type']>('personal');
  const [totalAmount, setTotalAmount] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [status, setStatus] = useState<Debt['status']>('active');

  const totalDebt = state.debts.reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);
  const totalMonthly = state.debts.filter((d) => d.status === 'active').reduce((s, d) => s + d.monthlyPayment, 0);
  const activeDebts = state.debts.filter((d) => d.status !== 'paid').length;

  function openEdit(debt: Debt) {
    setEditDebt(debt);
    setName(debt.name);
    setType(debt.type);
    setTotalAmount(String(debt.totalAmount));
    setPaidAmount(String(debt.paidAmount));
    setMonthlyPayment(String(debt.monthlyPayment));
    setInterestRate(String(debt.interestRate));
    setDueDate(debt.dueDate);
    setStatus(debt.status);
    setShowModal(true);
  }

  function openNew() {
    setEditDebt(null);
    setName('');
    setType('personal');
    setTotalAmount('');
    setPaidAmount('0');
    setMonthlyPayment('');
    setInterestRate('0');
    setDueDate('');
    setStatus('active');
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name, type, totalAmount: parseFloat(totalAmount) || 0, paidAmount: parseFloat(paidAmount) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0, interestRate: parseFloat(interestRate) || 0, dueDate, status,
    };
    if (editDebt) {
      dispatch({ type: 'UPDATE_DEBT', payload: { ...data, id: editDebt.id } });
    } else {
      dispatch({ type: 'ADD_DEBT', payload: data });
    }
    setShowModal(false);
  }

  const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Deudas</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
          <Plus size={16} /> Nueva deuda
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-red-500 text-white rounded-2xl p-4">
          <TrendingDown size={18} className="mb-1 opacity-80" />
          <p className="text-xs opacity-80">Deuda total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalDebt)}</p>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-4">
          <AlertTriangle size={18} className="mb-1 opacity-80" />
          <p className="text-xs opacity-80">Pago mensual total</p>
          <p className="text-2xl font-bold">{formatCurrency(totalMonthly)}</p>
        </div>
        <div className="bg-indigo-500 text-white rounded-2xl p-4">
          <CheckCircle2 size={18} className="mb-1 opacity-80" />
          <p className="text-xs opacity-80">Deudas activas</p>
          <p className="text-2xl font-bold">{activeDebts}</p>
        </div>
      </div>

      {state.debts.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400">No tienes deudas registradas.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {state.debts.map((debt) => {
            const remaining = debt.totalAmount - debt.paidAmount;
            const progress = debt.totalAmount > 0 ? (debt.paidAmount / debt.totalAmount) * 100 : 0;
            const typeInfo = debtTypes.find((t) => t.value === debt.type);
            return (
              <div key={debt.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{typeInfo?.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{debt.name}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[debt.status]}`}>
                          {debt.status === 'active' ? 'Activa' : debt.status === 'overdue' ? 'Vencida' : 'Pagada'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{typeInfo?.label} · {debt.interestRate}% interés</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => openEdit(debt)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                    <button onClick={() => setDeleteId(debt.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-3 text-center">
                  <div>
                    <p className="text-[10px] text-slate-400">Total</p>
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(debt.totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Pagado</p>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(debt.paidAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Restante</p>
                    <p className="text-sm font-semibold text-red-600">{formatCurrency(remaining)}</p>
                  </div>
                </div>
                <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mb-1.5">
                  <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>{progress.toFixed(1)}% pagado</span>
                  <span>Cuota: {formatCurrency(debt.monthlyPayment)}/mes</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editDebt ? 'Editar deuda' : 'Nueva deuda'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Tipo</label>
              <select value={type} onChange={(e) => setType(e.target.value as Debt['type'])} className={inputClass}>
                {debtTypes.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Estado</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Debt['status'])} className={inputClass}>
                <option value="active">Activa</option>
                <option value="overdue">Vencida</option>
                <option value="paid">Pagada</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Monto total (S/)</label>
              <input type="number" step="0.01" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Pagado (S/)</label>
              <input type="number" step="0.01" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Cuota mensual (S/)</label>
              <input type="number" step="0.01" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Tasa de interés (%)</label>
              <input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha de vencimiento</label>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
          </div>
          <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
            {editDebt ? 'Guardar' : 'Registrar deuda'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar deuda"
        message="¿Estás seguro de eliminar esta deuda?"
        confirmLabel="Eliminar"
        danger
        onConfirm={() => { if (deleteId) dispatch({ type: 'DELETE_DEBT', payload: deleteId }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
