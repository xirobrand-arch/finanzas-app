import { useState } from 'react';
import { Plus, Edit3, Trash2, TrendingDown, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { formatCurrency } from '../utils/format';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { Debt } from '../types';

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
  const [creditor, setCreditor] = useState('');
  const [initialAmount, setInitialAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState('');
  const [monthlyPayment, setMonthlyPayment] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('');
  const [status, setStatus] = useState<Debt['status']>('active');

  const totalDebt = state.debts.reduce((s, d) => s + d.currentBalance, 0);
  const totalMonthly = state.debts.filter((d) => d.status === 'active').reduce((s, d) => s + d.monthlyPayment, 0);
  const activeDebts = state.debts.filter((d) => d.status !== 'paid').length;

  function openEdit(debt: Debt) {
    setEditDebt(debt);
    setCreditor(debt.creditor);
    setInitialAmount(String(debt.initialAmount));
    setCurrentBalance(String(debt.currentBalance));
    setMonthlyPayment(String(debt.monthlyPayment));
    setInterestRate(String(debt.interestRate));
    setDueDate(debt.dueDate);
    setTotalInstallments(String(debt.totalInstallments));
    setPaidInstallments(String(debt.paidInstallments));
    setStatus(debt.status);
    setShowModal(true);
  }

  function openNew() {
    setEditDebt(null);
    setCreditor('');
    setInitialAmount('');
    setCurrentBalance('');
    setMonthlyPayment('');
    setInterestRate('0');
    setDueDate('');
    setTotalInstallments('');
    setPaidInstallments('0');
    setStatus('active');
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      creditor,
      initialAmount: parseFloat(initialAmount) || 0,
      currentBalance: parseFloat(currentBalance) || 0,
      monthlyPayment: parseFloat(monthlyPayment) || 0,
      interestRate: parseFloat(interestRate) || 0,
      dueDate,
      totalInstallments: parseInt(totalInstallments) || 0,
      paidInstallments: parseInt(paidInstallments) || 0,
      status,
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
            const paid = debt.initialAmount - debt.currentBalance;
            const progress = debt.initialAmount > 0 ? (paid / debt.initialAmount) * 100 : 0;
            return (
              <div key={debt.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🏦</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{debt.creditor}</p>
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusColors[debt.status]}`}>
                          {debt.status === 'active' ? 'Activa' : debt.status === 'overdue' ? 'Vencida' : 'Pagada'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{debt.interestRate}% interés · {debt.paidInstallments}/{debt.totalInstallments} cuotas</p>
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
                    <p className="text-sm font-semibold text-slate-800">{formatCurrency(debt.initialAmount)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Pagado</p>
                    <p className="text-sm font-semibold text-emerald-600">{formatCurrency(paid)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400">Restante</p>
                    <p className="text-sm font-semibold text-red-600">{formatCurrency(debt.currentBalance)}</p>
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
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Acreedor</label>
            <input type="text" value={creditor} onChange={(e) => setCreditor(e.target.value)} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Monto inicial (S/)</label>
              <input type="number" step="0.01" value={initialAmount} onChange={(e) => setInitialAmount(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Saldo actual (S/)</label>
              <input type="number" step="0.01" value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Cuota mensual (S/)</label>
              <input type="number" step="0.01" value={monthlyPayment} onChange={(e) => setMonthlyPayment(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Tasa de interés (%)</label>
              <input type="number" step="0.01" value={interestRate} onChange={(e) => setInterestRate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Total cuotas</label>
              <input type="number" value={totalInstallments} onChange={(e) => setTotalInstallments(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Cuotas pagadas</label>
              <input type="number" value={paidInstallments} onChange={(e) => setPaidInstallments(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha de vencimiento</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputClass} />
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
