import { useMemo } from 'react';
import { AlertTriangle, TrendingDown, Zap } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { getMonthTransactions, getUnnecessaryExpenses, getTotalExpenses } from '../utils/analysis';
import { formatCurrency, getMonthName } from '../utils/format';

const typeColors: Record<string, { bg: string; border: string; text: string }> = {
  unnecessary: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  recurring: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700' },
  impulse: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-700' },
  avoidable: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
};

export default function LeaksPage() {
  const { state } = useFinance();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthTx = useMemo(() => getMonthTransactions(state.transactions, month, year), [state.transactions, month, year]);

  const totalExpenses = useMemo(() => getTotalExpenses(monthTx), [monthTx]);
  const unnecessaryTotal = useMemo(() => getUnnecessaryExpenses(monthTx), [monthTx]);

  const leaks = useMemo(() => {
    const result: { type: string; label: string; transactions: typeof monthTx; total: number }[] = [];

    const unnecessary = monthTx.filter((t) => t.type === 'expense' && t.isNecessary === 'no');
    if (unnecessary.length > 0) {
      result.push({ type: 'unnecessary', label: 'Gastos innecesarios', transactions: unnecessary, total: unnecessary.reduce((s, t) => s + t.amount, 0) });
    }

    const smallExpenses = monthTx.filter((t) => t.type === 'expense' && t.amount < 10);
    if (smallExpenses.length >= 5) {
      result.push({ type: 'impulse', label: 'Gastos hormiga (<S/ 10)', transactions: smallExpenses, total: smallExpenses.reduce((s, t) => s + t.amount, 0) });
    }

    const unsure = monthTx.filter((t) => t.type === 'expense' && t.isNecessary === 'unsure');
    if (unsure.length > 0) {
      result.push({ type: 'avoidable', label: 'Gastos cuestionables', transactions: unsure, total: unsure.reduce((s, t) => s + t.amount, 0) });
    }

    return result;
  }, [monthTx]);

  const leakPercentage = totalExpenses > 0 ? (unnecessaryTotal / totalExpenses) * 100 : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Fugas de Dinero</h2>
      <p className="text-sm text-slate-500">{getMonthName(month)} {year}</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-red-500 text-white rounded-2xl p-4">
          <TrendingDown size={18} className="mb-1 opacity-80" />
          <p className="text-xs opacity-80">Total en fugas</p>
          <p className="text-2xl font-bold">{formatCurrency(unnecessaryTotal)}</p>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-4">
          <AlertTriangle size={18} className="mb-1 opacity-80" />
          <p className="text-xs opacity-80">% de gastos</p>
          <p className="text-2xl font-bold">{leakPercentage.toFixed(1)}%</p>
        </div>
        <div className="bg-orange-500 text-white rounded-2xl p-4">
          <Zap size={18} className="mb-1 opacity-80" />
          <p className="text-xs opacity-80">Tipos de fuga</p>
          <p className="text-2xl font-bold">{leaks.length}</p>
        </div>
      </div>

      {leaks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 text-center">
          <p className="text-emerald-500 font-medium">No se detectaron fugas de dinero este mes.</p>
          <p className="text-slate-400 text-sm mt-1">Marca tus gastos como necesarios/innecesarios para un mejor análisis.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaks.map((leak) => {
            const colors = typeColors[leak.type] || typeColors.unnecessary;
            return (
              <div key={leak.type} className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${colors.text}`}>{leak.label}</h3>
                  <span className={`text-sm font-bold ${colors.text}`}>{formatCurrency(leak.total)}</span>
                </div>
                <div className="space-y-2">
                  {leak.transactions.slice(0, 5).map((t) => {
                    const cat = state.categories.find((c) => c.id === t.categoryId);
                    return (
                      <div key={t.id} className="flex items-center justify-between py-1.5 border-b border-white/50 last:border-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{cat?.icon}</span>
                          <div>
                            <p className="text-sm font-medium text-slate-700">{t.description || cat?.name}</p>
                            <p className="text-[10px] text-slate-400">{t.date}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-red-600">-{formatCurrency(t.amount)}</span>
                      </div>
                    );
                  })}
                  {leak.transactions.length > 5 && (
                    <p className="text-xs text-slate-400 text-center pt-1">
                      +{leak.transactions.length - 5} más
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
