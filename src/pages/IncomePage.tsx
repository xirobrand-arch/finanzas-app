import { useMemo } from 'react';
import { TrendingUp, DollarSign, Star, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useFinance } from '../store/FinanceContext';
import { getMonthTransactions, getTotalIncome } from '../utils/analysis';
import { formatCurrency, getMonthName } from '../utils/format';

export default function IncomePage() {
  const { state } = useFinance();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthTx = useMemo(() => getMonthTransactions(state.transactions, month, year), [state.transactions, month, year]);
  const incomeTx = useMemo(() => monthTx.filter((t) => t.type === 'income'), [monthTx]);
  const totalIncome = useMemo(() => getTotalIncome(monthTx), [monthTx]);

  const incomeByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of incomeTx) map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
    return Array.from(map.entries())
      .map(([catId, amount]) => {
        const cat = state.categories.find((c) => c.id === catId);
        return { name: cat?.name || catId, icon: cat?.icon || '', amount };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [incomeTx, state.categories]);

  const monthlyIncome = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const m = (month - i + 12) % 12;
      const y = month - i < 0 ? year - 1 : year;
      const tx = getMonthTransactions(state.transactions, m, y);
      data.push({ name: getMonthName(m).slice(0, 3), amount: getTotalIncome(tx) });
    }
    return data;
  }, [state.transactions, month, year]);

  const avgIncome = useMemo(() => {
    const totals = monthlyIncome.map((m) => m.amount).filter((a) => a > 0);
    return totals.length > 0 ? totals.reduce((a, b) => a + b, 0) / totals.length : 0;
  }, [monthlyIncome]);

  const maxIncome = incomeTx.length > 0 ? Math.max(...incomeTx.map((t) => t.amount)) : 0;
  const mainSource = incomeByCategory[0];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Ingresos</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-emerald-500 text-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-80">Total del mes</span>
            <DollarSign size={16} />
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalIncome)}</p>
        </div>
        <div className="bg-blue-500 text-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-80">Promedio mensual</span>
            <TrendingUp size={16} />
          </div>
          <p className="text-xl font-bold">{formatCurrency(avgIncome)}</p>
        </div>
        <div className="bg-purple-500 text-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-80">Mayor ingreso</span>
            <Award size={16} />
          </div>
          <p className="text-xl font-bold">{formatCurrency(maxIncome)}</p>
        </div>
        <div className="bg-amber-500 text-white rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-80">Fuente principal</span>
            <Star size={16} />
          </div>
          <p className="text-lg font-bold truncate">{mainSource ? `${mainSource.icon} ${mainSource.name}` : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Ingresos mensuales</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyIncome}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: number) => formatCurrency(v)} />
              <Bar dataKey="amount" fill="#22c55e" radius={[4, 4, 0, 0]} name="Ingresos" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Por categoría</h3>
          <div className="space-y-3">
            {incomeByCategory.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Sin ingresos registrados</p>
            ) : (
              incomeByCategory.map((cat) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span className="text-sm text-slate-700">{cat.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-emerald-600">{formatCurrency(cat.amount)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent income transactions */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Últimos ingresos</h3>
        <div className="space-y-2">
          {incomeTx.slice(0, 10).map((t) => {
            const cat = state.categories.find((c) => c.id === t.categoryId);
            return (
              <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span>{cat?.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{t.description || cat?.name}</p>
                    <p className="text-xs text-slate-400">{t.date}</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-emerald-600">+{formatCurrency(t.amount)}</span>
              </div>
            );
          })}
          {incomeTx.length === 0 && <p className="text-slate-400 text-sm text-center py-4">Sin ingresos</p>}
        </div>
      </div>
    </div>
  );
}
