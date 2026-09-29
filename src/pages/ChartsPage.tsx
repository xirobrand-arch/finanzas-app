import { useMemo } from 'react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, Legend,
} from 'recharts';
import { useFinance } from '../store/FinanceContext';
import {
  getMonthTransactions, getTotalIncome, getTotalExpenses, getExpensesByCategory,
  getDailyExpenses, getUnnecessaryExpenses,
} from '../utils/analysis';
import { formatCurrency, getMonthName } from '../utils/format';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];

export default function ChartsPage() {
  const { state } = useFinance();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthTx = useMemo(() => getMonthTransactions(state.transactions, month, year), [state.transactions, month, year]);

  const expensesByCat = useMemo(() => getExpensesByCategory(monthTx, state.categories), [monthTx, state.categories]);
  const dailyExpenses = useMemo(() => getDailyExpenses(state.transactions, month, year), [state.transactions, month, year]);

  const monthlyComparison = useMemo(() => {
    const data = [];
    for (let i = 11; i >= 0; i--) {
      const m = (month - i + 12) % 12;
      const y = month - i < 0 ? year - 1 : year;
      const tx = getMonthTransactions(state.transactions, m, y);
      const inc = getTotalIncome(tx);
      const exp = getTotalExpenses(tx);
      if (inc > 0 || exp > 0) {
        data.push({ name: getMonthName(m).slice(0, 3), ingresos: inc, gastos: exp, ahorro: inc - exp });
      }
    }
    return data;
  }, [state.transactions, month, year]);

  const balanceEvolution = useMemo(() => {
    const sorted = [...monthTx].sort((a, b) => a.date.localeCompare(b.date));
    let balance = state.accounts.reduce((s, a) => s + a.balance, 0) - getTotalIncome(monthTx) + getTotalExpenses(monthTx);
    const data: { day: number; balance: number }[] = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const byDay = new Map<number, number>();
    for (const t of sorted) {
      const day = new Date(t.date + 'T00:00:00').getDate();
      const delta = t.type === 'income' ? t.amount : -t.amount;
      byDay.set(day, (byDay.get(day) || 0) + delta);
    }
    for (let d = 1; d <= daysInMonth; d++) {
      balance += byDay.get(d) || 0;
      data.push({ day: d, balance });
    }
    return data;
  }, [state.transactions, state.accounts, month, year, monthTx]);

  const necessaryVsNot = useMemo(() => {
    const expenses = monthTx.filter((t) => t.type === 'expense');
    const necessary = expenses.filter((t) => t.isNecessary === 'yes').reduce((s, t) => s + t.amount, 0);
    const unnecessary = getUnnecessaryExpenses(monthTx);
    const unsure = expenses.filter((t) => t.isNecessary === 'unsure').reduce((s, t) => s + t.amount, 0);
    return [
      { name: 'Necesarios', value: necessary, fill: '#22c55e' },
      { name: 'Innecesarios', value: unnecessary, fill: '#ef4444' },
      { name: 'No estoy seguro', value: unsure, fill: '#f59e0b' },
    ].filter((d) => d.value > 0);
  }, [monthTx]);

  const chartCard = 'bg-white rounded-2xl p-5 shadow-sm border border-slate-100';

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Gráficos</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={chartCard}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Gastos por categoría</h3>
          {expensesByCat.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={expensesByCat} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60} label={({ name, percent }: any) => `${name} ${((percent || 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={10}>
                  {expensesByCat.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-12">Sin datos</p>}
        </div>

        <div className={chartCard}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Legend />
              <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={chartCard}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Evolución del saldo</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={balanceEvolution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Line type="monotone" dataKey="balance" stroke="#6366f1" strokeWidth={2} dot={false} name="Saldo" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={chartCard}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Gastos diarios</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={false} name="Gasto" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={chartCard}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Necesarios vs Innecesarios</h3>
          {necessaryVsNot.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={necessaryVsNot} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={60}>
                  {necessaryVsNot.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Pie>
                <Tooltip formatter={(v: any) => formatCurrency(v)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : <p className="text-slate-400 text-sm text-center py-12">Sin datos</p>}
        </div>

        <div className={chartCard}>
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Comparación mensual (Ahorro)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="ahorro" fill="#6366f1" radius={[4, 4, 0, 0]} name="Ahorro" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
