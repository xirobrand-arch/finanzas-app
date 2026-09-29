import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { useFinance } from '../../store/FinanceContext';
import type { Transaction, TransactionType, PaymentMethod, NecessityLevel } from '../../types';
import { getToday, getCurrentTime } from '../../utils/format';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
  editTransaction?: Transaction;
}

export default function TransactionModal({ isOpen, onClose, defaultType = 'expense', editTransaction }: Props) {
  const { state, dispatch } = useFinance();
  const [type, setType] = useState<TransactionType>(defaultType);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getToday());
  const [time, setTime] = useState(getCurrentTime());
  const [categoryId, setCategoryId] = useState('');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [accountId, setAccountId] = useState('cash');
  const [isNecessary, setIsNecessary] = useState<NecessityLevel>('yes');
  const [isRecurring, setIsRecurring] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(String(editTransaction.amount));
      setDate(editTransaction.date);
      setTime(editTransaction.time);
      setCategoryId(editTransaction.categoryId);
      setSubcategoryId(editTransaction.subcategoryId || '');
      setDescription(editTransaction.description);
      setPaymentMethod(editTransaction.paymentMethod);
      setAccountId(editTransaction.accountId);
      setIsNecessary(editTransaction.isNecessary);
      setIsRecurring(editTransaction.isRecurring);
      setNotes(editTransaction.notes || '');
    } else {
      setType(defaultType);
      setAmount('');
      setDate(getToday());
      setTime(getCurrentTime());
      setCategoryId('');
      setSubcategoryId('');
      setDescription('');
      setPaymentMethod('cash');
      setAccountId('cash');
      setIsNecessary('yes');
      setIsRecurring(false);
      setNotes('');
    }
  }, [editTransaction, defaultType, isOpen]);

  const filteredCategories = state.categories.filter((c) => {
    if (type === 'income') return c.type === 'income' || c.type === 'both';
    return c.type === 'expense' || c.type === 'both';
  });

  const selectedCategory = state.categories.find((c) => c.id === categoryId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || !categoryId) return;

    const data = {
      type, amount: parseFloat(amount), date, time, categoryId, subcategoryId: subcategoryId || undefined,
      description, paymentMethod, accountId, isNecessary, isRecurring, notes: notes || undefined,
    };

    if (editTransaction) {
      dispatch({ type: 'UPDATE_TRANSACTION', payload: { ...data, id: editTransaction.id, createdAt: editTransaction.createdAt } });
    } else {
      dispatch({ type: 'ADD_TRANSACTION', payload: data });
    }
    onClose();
  }

  const typeOptions: { value: TransactionType; label: string; color: string }[] = [
    { value: 'income', label: 'Ingreso', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    { value: 'expense', label: 'Gasto', color: 'bg-red-100 text-red-700 border-red-200' },
    { value: 'transfer', label: 'Transferencia', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { value: 'saving', label: 'Ahorro', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { value: 'investment', label: 'Inversión', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  ];

  const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all';
  const labelClass = 'block text-xs font-medium text-slate-500 mb-1.5';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editTransaction ? 'Editar movimiento' : 'Nuevo movimiento'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type selector */}
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setType(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                type === opt.value ? opt.color : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Monto *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={`${inputClass} text-lg font-semibold`}
              required
              autoFocus
            />
          </div>
          <div>
            <label className={labelClass}>Fecha</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Categoría *</label>
            <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(''); }} className={inputClass} required>
              <option value="">Seleccionar</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Subcategoría</label>
            <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className={inputClass}>
              <option value="">Seleccionar</option>
              {selectedCategory?.subcategories.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Descripción</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Ej: Almuerzo con amigos" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Método de pago</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className={inputClass}>
              <option value="cash">Efectivo</option>
              <option value="yape">Yape</option>
              <option value="plin">Plin</option>
              <option value="debit_card">Tarjeta de débito</option>
              <option value="credit_card">Tarjeta de crédito</option>
              <option value="bank_transfer">Transferencia bancaria</option>
              <option value="other">Otro</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Cuenta</label>
            <select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass}>
              {state.accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.icon} {a.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Hora</label>
            <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>¿Es necesario?</label>
            <select value={isNecessary} onChange={(e) => setIsNecessary(e.target.value as NecessityLevel)} className={inputClass}>
              <option value="yes">Sí</option>
              <option value="no">No</option>
              <option value="unsure">No estoy seguro</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
            Gasto recurrente
          </label>
        </div>

        <div>
          <label className={labelClass}>Notas</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Notas adicionales..." className={inputClass} />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
            Cancelar
          </button>
          <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-sm">
            {editTransaction ? 'Guardar cambios' : 'Registrar'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
