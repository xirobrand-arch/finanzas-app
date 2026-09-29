import { useState } from 'react';
import { Plus, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { formatCurrency } from '../utils/format';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { CreditCard } from '../types';

const cardColors = ['#1e293b', '#7c3aed', '#2563eb', '#dc2626', '#059669', '#d97706'];

export default function CreditCardsPage() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editCard, setEditCard] = useState<CreditCard | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [usedBalance, setUsedBalance] = useState('');
  const [cutoffDate, setCutoffDate] = useState('');
  const [paymentDate, setPaymentDate] = useState('');
  const [color, setColor] = useState(cardColors[0]);

  function openEdit(card: CreditCard) {
    setEditCard(card);
    setName(card.name);
    setLimit(String(card.limit));
    setUsedBalance(String(card.usedBalance));
    setCutoffDate(String(card.cutoffDate));
    setPaymentDate(String(card.paymentDate));
    setColor(card.color);
    setShowModal(true);
  }

  function openNew() {
    setEditCard(null);
    setName('');
    setLimit('');
    setUsedBalance('');
    setCutoffDate('');
    setPaymentDate('');
    setColor(cardColors[Math.floor(Math.random() * cardColors.length)]);
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      name, limit: parseFloat(limit) || 0, usedBalance: parseFloat(usedBalance) || 0,
      cutoffDate: parseInt(cutoffDate) || 1, paymentDate: parseInt(paymentDate) || 1, color,
    };
    if (editCard) {
      dispatch({ type: 'UPDATE_CREDIT_CARD', payload: { ...data, id: editCard.id } });
    } else {
      dispatch({ type: 'ADD_CREDIT_CARD', payload: data });
    }
    setShowModal(false);
  }

  const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Tarjetas de Crédito</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
          <Plus size={16} /> Nueva tarjeta
        </button>
      </div>

      {state.creditCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <p className="text-slate-400">No tienes tarjetas registradas.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {state.creditCards.map((card) => {
            const available = card.limit - card.usedBalance;
            const usagePct = card.limit > 0 ? (card.usedBalance / card.limit) * 100 : 0;
            return (
              <div key={card.id} className="rounded-2xl p-5 text-white shadow-lg relative overflow-hidden" style={{ background: card.color }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="flex items-center justify-between mb-6">
                  <p className="font-bold text-lg">{card.name}</p>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(card)} className="p-1.5 rounded-lg hover:bg-white/20"><Edit3 size={14} /></button>
                    <button onClick={() => setDeleteId(card.id)} className="p-1.5 rounded-lg hover:bg-white/20"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-xs opacity-70">Límite</p>
                    <p className="font-semibold">{formatCurrency(card.limit)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Utilizado</p>
                    <p className="font-semibold">{formatCurrency(card.usedBalance)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Disponible</p>
                    <p className="font-semibold">{formatCurrency(available)}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Deuda actual</p>
                    <p className="font-semibold">{formatCurrency(card.usedBalance)}</p>
                  </div>
                </div>
                <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${usagePct >= 80 ? 'bg-red-400' : 'bg-white/60'}`} style={{ width: `${Math.min(usagePct, 100)}%` }} />
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="opacity-70">{usagePct.toFixed(0)}% utilizado</span>
                  <span className="opacity-70">Corte: día {card.cutoffDate} · Pago: día {card.paymentDate}</span>
                </div>
                {usagePct >= 70 && (
                  <div className="mt-3 flex items-center gap-1.5 bg-white/15 rounded-lg px-3 py-1.5 text-xs">
                    <AlertTriangle size={14} />
                    Has utilizado el {usagePct.toFixed(0)}% del límite de tu tarjeta.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCard ? 'Editar tarjeta' : 'Nueva tarjeta'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required placeholder="Ej: Visa BCP" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Límite (S/)</label>
              <input type="number" step="0.01" value={limit} onChange={(e) => setLimit(e.target.value)} className={inputClass} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Saldo utilizado (S/)</label>
              <input type="number" step="0.01" value={usedBalance} onChange={(e) => setUsedBalance(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Día de corte</label>
              <input type="number" min="1" max="31" value={cutoffDate} onChange={(e) => setCutoffDate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-1.5">Día de pago</label>
              <input type="number" min="1" max="31" value={paymentDate} onChange={(e) => setPaymentDate(e.target.value)} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Color</label>
            <div className="flex gap-2">
              {cardColors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${color === c ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
            {editCard ? 'Guardar' : 'Crear tarjeta'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar tarjeta"
        message="¿Estás seguro de eliminar esta tarjeta?"
        confirmLabel="Eliminar"
        danger
        onConfirm={() => { if (deleteId) dispatch({ type: 'DELETE_CREDIT_CARD', payload: deleteId }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
