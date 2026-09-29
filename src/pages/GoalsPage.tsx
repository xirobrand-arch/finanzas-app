import { useState } from 'react';
import { Plus, Edit3, Trash2, Target } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { formatCurrency } from '../utils/format';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { FinancialGoal } from '../types';

const goalIcons = ['🎯', '🏠', '🚗', '✈️', '💻', '📱', '🎓', '💍', '🏥', '🎮', '📚', '🏋️', '🎸', '🏖️', '👶', '🐕'];
const goalColors = ['#6366f1', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6'];

export default function GoalsPage() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editGoal, setEditGoal] = useState<FinancialGoal | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState(goalColors[0]);

  function openEdit(goal: FinancialGoal) {
    setEditGoal(goal);
    setName(goal.name);
    setTargetAmount(String(goal.targetAmount));
    setCurrentAmount(String(goal.currentAmount));
    setDeadline(goal.deadline || '');
    setIcon(goal.icon);
    setColor(goal.color);
    setShowModal(true);
  }

  function openNew() {
    setEditGoal(null);
    setName('');
    setTargetAmount('');
    setCurrentAmount('0');
    setDeadline('');
    setIcon('🎯');
    setColor(goalColors[Math.floor(Math.random() * goalColors.length)]);
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name, targetAmount: parseFloat(targetAmount) || 0, currentAmount: parseFloat(currentAmount) || 0,
      deadline, icon, color,
    };
    if (editGoal) {
      dispatch({ type: 'UPDATE_GOAL', payload: { ...data, id: editGoal.id } });
    } else {
      dispatch({ type: 'ADD_GOAL', payload: data });
    }
    setShowModal(false);
  }

  const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Metas de Ahorro</h2>
          <p className="text-sm text-slate-500">{state.goals.length} meta{state.goals.length !== 1 ? 's' : ''} activa{state.goals.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
          <Plus size={16} /> Nueva meta
        </button>
      </div>

      {state.goals.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <Target size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">Sin metas de ahorro</p>
          <p className="text-slate-400 text-sm mt-1">Crea una meta para empezar a ahorrar con propósito.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.goals.map((goal) => {
            const progress = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);
            const daysLeft = goal.deadline
              ? Math.max(Math.ceil((new Date(goal.deadline + 'T00:00:00').getTime() - Date.now()) / 86400000), 0)
              : null;
            const dailySaving = daysLeft && daysLeft > 0 ? remaining / daysLeft : null;

            return (
              <div key={goal.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: goal.color + '15' }}>
                      {goal.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{goal.name}</p>
                      {goal.deadline && (
                        <p className="text-xs text-slate-400">
                          {daysLeft !== null && daysLeft > 0 ? `${daysLeft} días restantes` : daysLeft === 0 ? 'Vence hoy' : 'Meta vencida'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                    <button onClick={() => setDeleteId(goal.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="flex items-end justify-between mb-1.5">
                    <span className="text-2xl font-bold" style={{ color: goal.color }}>{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-sm text-slate-400">de {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%`, background: goal.color }} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{progress.toFixed(1)}% completado</p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-400">Falta</p>
                    <p className="text-sm font-semibold text-slate-700">{formatCurrency(remaining)}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-[10px] text-slate-400">Ahorro diario</p>
                    <p className="text-sm font-semibold text-slate-700">{dailySaving ? formatCurrency(dailySaving) : '—'}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editGoal ? 'Editar meta' : 'Nueva meta'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="Ej: Viaje a Europa" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Meta (S/)</label>
              <input type="number" step="0.01" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Ahorrado (S/)</label>
              <input type="number" step="0.01" value={currentAmount} onChange={(e) => setCurrentAmount(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Fecha objetivo</label>
            <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Icono</label>
            <div className="grid grid-cols-8 gap-2">
              {goalIcons.map((ic) => (
                <button key={ic} type="button" onClick={() => setIcon(ic)} className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${icon === ic ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Color</label>
            <div className="flex gap-2">
              {goalColors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
            {editGoal ? 'Guardar' : 'Crear meta'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar meta"
        message="¿Estás seguro de eliminar esta meta?"
        confirmLabel="Eliminar"
        danger
        onConfirm={() => { if (deleteId) dispatch({ type: 'DELETE_GOAL', payload: deleteId }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
