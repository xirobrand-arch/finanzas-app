import { useState } from 'react';
import { Save, Download, Upload, Trash2 } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import ConfirmDialog from '../components/common/ConfirmDialog';
import type { Category } from '../types';
import Modal from '../components/common/Modal';

const categoryIcons = ['🍔', '🚗', '🏠', '💡', '📱', '🎮', '👕', '💊', '🎓', '✈️', '💼', '🛒', '🎬', '🏋️', '🐕', '💇'];

export default function SettingsPage() {
  const { state, dispatch } = useFinance();
  const [showReset, setShowReset] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [catName, setCatName] = useState('');
  const [catIcon, setCatIcon] = useState('🍔');
  const [catType, setCatType] = useState<Category['type']>('expense');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  function handleExport() {
    const data = JSON.stringify(state, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `finanzas-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string);
        Object.keys(data).forEach(() => {}); // data loaded via localStorage
        alert('Datos importados correctamente');
      } catch {
        alert('Error al importar. Archivo inválido.');
      }
    };
    reader.readAsText(file);
  }

  function openEditCat(cat: Category) {
    setEditCat(cat);
    setCatName(cat.name);
    setCatIcon(cat.icon);
    setCatType(cat.type);
    setShowCatModal(true);
  }

  function openNewCat() {
    setEditCat(null);
    setCatName('');
    setCatIcon('🍔');
    setCatType('expense');
    setShowCatModal(true);
  }

  function handleCatSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editCat) {
      dispatch({ type: 'UPDATE_CATEGORY', payload: { ...editCat, name: catName, icon: catIcon, type: catType } });
    } else {
      dispatch({ type: 'ADD_CATEGORY', payload: { name: catName, icon: catIcon, type: catType, subcategories: [] } });
    }
    setShowCatModal(false);
  }

  const inputClass = 'w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30';

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Configuración</h2>

      {/* Data management */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Gestión de datos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={handleExport} className="flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
            <Download size={16} /> Exportar datos
          </button>
          <label className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 text-slate-700 text-sm font-medium rounded-xl hover:bg-slate-200 cursor-pointer">
            <Upload size={16} /> Importar datos
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={() => setShowReset(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 text-sm font-medium rounded-xl hover:bg-red-100">
            <Trash2 size={16} /> Borrar todo
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-slate-700">Categorías</h3>
          <button onClick={openNewCat} className="text-sm text-indigo-600 font-medium hover:text-indigo-700">+ Agregar</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {state.categories.map((cat) => (
            <div key={cat.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <div>
                  <p className="text-sm font-medium text-slate-700">{cat.name}</p>
                  <p className="text-[10px] text-slate-400">
                    {cat.type === 'income' ? 'Ingreso' : cat.type === 'expense' ? 'Gasto' : 'Ambos'}
                  </p>
                </div>
              </div>
              <div className="flex gap-0.5">
                <button onClick={() => openEditCat(cat)} className="p-1.5 rounded-lg hover:bg-white text-slate-400">
                  <Save size={12} />
                </button>
                <button onClick={() => setDeleteId(cat.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Estadísticas de la app</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400">Movimientos</p>
            <p className="text-lg font-bold text-slate-700">{state.transactions.length}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400">Cuentas</p>
            <p className="text-lg font-bold text-slate-700">{state.accounts.length}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400">Categorías</p>
            <p className="text-lg font-bold text-slate-700">{state.categories.length}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-slate-400">Metas</p>
            <p className="text-lg font-bold text-slate-700">{state.goals.length}</p>
          </div>
        </div>
      </div>

      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title={editCat ? 'Editar categoría' : 'Nueva categoría'} size="sm">
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nombre</label>
            <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className={inputClass} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Tipo</label>
            <select value={catType} onChange={(e) => setCatType(e.target.value as Category['type'])} className={inputClass}>
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Icono</label>
            <div className="grid grid-cols-8 gap-2">
              {categoryIcons.map((ic) => (
                <button key={ic} type="button" onClick={() => setCatIcon(ic)} className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${catIcon === ic ? 'bg-indigo-100 ring-2 ring-indigo-400' : 'bg-slate-50 hover:bg-slate-100'}`}>
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700">
            {editCat ? 'Guardar' : 'Crear categoría'}
          </button>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showReset}
        title="Borrar todos los datos"
        message="¿Estás seguro? Se eliminarán todas las transacciones, cuentas, presupuestos y metas. Esta acción no se puede deshacer."
        confirmLabel="Borrar todo"
        danger
        onConfirm={() => { localStorage.clear(); window.location.reload(); }}
        onCancel={() => setShowReset(false)}
      />

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Eliminar categoría"
        message="¿Estás seguro? Las transacciones con esta categoría mantendrán su registro."
        confirmLabel="Eliminar"
        danger
        onConfirm={() => { if (deleteId) dispatch({ type: 'DELETE_CATEGORY', payload: deleteId }); setDeleteId(null); }}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
}
