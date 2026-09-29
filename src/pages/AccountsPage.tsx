import { useState } from 'react';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { formatCurrency } from '../utils/format';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { Account } from '../types';

const accountTypes = [
  { value: 'cash', label: 'Efectivo', icon: '💵' },
  { value: 'bank', label: 'Banco', icon: '🏦' },
  { value: 'yape', label: 'Yape', icon: '📱' },
  { value: 'plin', label: 'Plin', icon: '📲' },
  { value: 'card', label: 'Tarjeta', icon: '💳' },
  { value: 'savings', label: 'Cuenta de ahorro', icon: '🏧' },
  { value: 'business', label: 'Cuenta empresarial', icon: '🏢' },
] as const;

const colors = ['#22c55e', '#3b82f6', '#7c3aed', '#06b6d4', '#f59e0b', '#ef4444', '#ec4899'];

export default function AccountsPage() {
  const { state, dispatch } = useFinance();
  const [showModal, setShowModal] = useState(false);
  const [editAccount, setEditAccount] = useState<Account | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('bank');
  const [balance, setBalance] = useState('');
  const [color, setColor] = useState(colors[0]);

  const totalBalance = state.accounts.reduce((s, a) => s + a.balance, 0);

  function openEdit(account: Account) {
    setEditAccount(account);
    setName(account.name);
    setType(account.type);
    setBalance(String(account.balance));
    setColor(account.color);
    setShowModal(true);
  }

  function openNew() {
    setEditAccount(null);
    setName('');
    setType('bank');
    setBalance('');
    setColor(colors[Math.floor(Math.random() * colors.length)]);
    setShowModal(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const icon = accountTypes.find((t) => t.value === type)?.icon || '💰';
    if (editAccount) {
      dispatch({ type: 'UPDATE_ACCOUNT', payload: { ...editAccount, name, type, balance: parseFloat(balance) || 0, icon, color } });
    } else {
      dispatch({ type: 'ADD_ACCOUNT', payload: { name, type, balance: parseFloat(balance) || 0, icon, color } });
    }
    setShowModal(false);
  }

  const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800">Cuentas</h2>
        <button onClick={openNew} className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors">
          <Plus size={16} /> Nueva cuenta
        </button>
      </div>

      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 text-white">
        <p className="text-sm text-indigo-200">Patrimonio líquido total</p>
        <p className="text-3xl font-bold mt-1">{formatCurrency(totalBalance)}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {state.accounts.map((account) => (
          <div key={account.id} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ background: account.color + '20' }}>
                  {account.icon}
                </div>
                <div>
                  <p className="font-medium text-slate-800 text-sm">{account.name}</p>
                  <p className="text-xs text-slate-400">{accountTypes.find((t) => t.value === account.type)?.label}</p>
                </div>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => openEdit(account)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit3 size={14} /></button>
                <button onClick={() => setDeleteId(account.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className={`text-xl font-bold ${account.balance >= 0 ? 'text-slate-800' : 'text-red-600'}`}>
              {formatCurrency(account.balance)}
            </p>
          </div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editAccount ? 'Editar cuenta' : 'Nueva cuenta'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Tipo</label>
            <select value={type} onChange={(e) => setType(e.target.value as Account['type'])} className={inputClass}>
              {accountTypes.map((t) => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Saldo actual (S/)</label>
            <input type="number" step="0.01" value={balance} onChange={(e) => setBalance(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Color</label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-indigo-400' : ''}`} style={{ background: c }} />
              ))}
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
            {editAccount ? 'Guardar' : 'Crear cuenta'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar cuenta"
        message="¿Estás seguro? Los movimientos asociados se mantendrán."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => { if (deleteId) dispatch({ type: 'DELETE_ACCOUNT', payload: deleteId }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
