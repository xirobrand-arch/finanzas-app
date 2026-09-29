import { useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, AlertTriangle, ShieldCheck } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid,
} from 'recharts';
import { useFinance } from '../store/FinanceContext';
import {
  getMonthTransactions, getTodayTransactions, getTotalIncome, getTotalExpenses,
  getUnnecessaryExpenses, getExpensesByCategory, getDailyExpenses, getBudgetUsage,
} from '../utils/analysis';
import { formatCurrency, getMonthName } from '../utils/format';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#06b6d4'];

export default function DashboardPage() {
  const { state } = useFinance();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const monthTx = useMemo(() => getMonthTransactions(state.transactions, month, year), [state.transactions, month, year]);
  const todayTx = useMemo(() => getTodayTransactions(state.transactions), [state.transactions]);
  const income = useMemo(() => getTotalIncome(monthTx), [monthTx]);
  const expenses = useMemo(() => getTotalExpenses(monthTx), [monthTx]);
  const saving = income - expenses;
  const unnecessary = useMemo(() => getUnnecessaryExpenses(monthTx), [monthTx]);
  const todayExpenses = useMemo(() => getTotalExpenses(todayTx), [todayTx]);
  const totalBalance = state.accounts.reduce((s, a) => s + a.balance, 0);
  const budgetUsage = useMemo(() => getBudgetUsage(state.budgets, state.transactions, state.categories, month, year), [state.budgets, state.transactions, state.categories, month, year]);
  const totalBudget = budgetUsage.reduce((s, b) => s + b.limit, 0);
  const totalBudgetSpent = budgetUsage.reduce((s, b) => s + b.spent, 0);
  const budgetRemaining = totalBudget > 0 ? totalBudget - totalBudgetSpent : state.settings.monthlyBudgetTotal - expenses;

  const expensesByCat = useMemo(() => getExpensesByCategory(monthTx, state.categories), [monthTx, state.categories]);
  const dailyExpenses = useMemo(() => getDailyExpenses(state.transactions, month, year), [state.transactions, month, year]);

  const monthlyComparison = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const m = (month - i + 12) % 12;
      const y = month - i < 0 ? year - 1 : year;
      const tx = getMonthTransactions(state.transactions, m, y);
      data.push({
        name: getMonthName(m).slice(0, 3),
        ingresos: getTotalIncome(tx),
        gastos: getTotalExpenses(tx),
      });
    }
    return data;
  }, [state.transactions, month, year]);

  const cards = [
    { label: 'Saldo actual', value: formatCurrency(totalBalance), icon: Wallet, color: 'bg-indigo-500', textColor: 'text-white', iconBg: 'bg-indigo-600' },
    { label: 'Ingresos del mes', value: formatCurrency(income), icon: TrendingUp, color: 'bg-emerald-500', textColor: 'text-white', iconBg: 'bg-emerald-600' },
    { label: 'Gastos del mes', value: formatCurrency(expenses), icon: TrendingDown, color: 'bg-red-500', textColor: 'text-white', iconBg: 'bg-red-600' },
    { label: 'Ahorro del mes', value: formatCurrency(saving), icon: PiggyBank, color: saving >= 0 ? 'bg-blue-500' : 'bg-orange-500', textColor: 'text-white', iconBg: saving >= 0 ? 'bg-blue-600' : 'bg-orange-600' },
    { label: 'Gastos innecesarios', value: formatCurrency(unnecessary), icon: AlertTriangle, color: 'bg-amber-500', textColor: 'text-white', iconBg: 'bg-amber-600' },
    { label: 'Presupuesto disponible', value: formatCurrency(budgetRemaining), icon: ShieldCheck, color: budgetRemaining >= 0 ? 'bg-teal-500' : 'bg-red-600', textColor: 'text-white', iconBg: budgetRemaining >= 0 ? 'bg-teal-600' : 'bg-red-700' },
  ];

  const savingRate = income > 0 ? ((saving / income) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 rounded-2xl p-5 lg:p-6 text-white">
        <h2 className="text-lg lg:text-xl font-semibold">
          Hola {state.settings.userName || ''} 👋
        </h2>
        <p className="text-indigo-100 text-sm mt-1">Este es el estado de tus finanzas.</p>
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-indigo-200 text-xs">Hoy gastaste</p>
            <p className="font-bold text-lg">{formatCurrency(todayExpenses)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-indigo-200 text-xs">Este mes llevas</p>
            <p className="font-bold text-lg">{formatCurrency(expenses)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-indigo-200 text-xs">Te quedan</p>
            <p className="font-bold text-lg">{formatCurrency(budgetRemaining)}</p>
          </div>
          <div className="bg-white/15 rounded-xl p-3">
            <p className="text-indigo-200 text-xs">Has ahorrado</p>
            <p className="font-bold text-lg">{formatCurrency(saving)}</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {cards.map((card) => (
          <div key={card.label} className={`${card.color} ${card.textColor} rounded-2xl p-4 lg:p-5 shadow-sm`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium opacity-80">{card.label}</span>
              <div className={`${card.iconBg} p-2 rounded-lg`}>
                <card.icon size={16} />
              </div>
            </div>
            <p className="text-xl lg:text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Expenses by category */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Gastos por categoría</h3>
          {expensesByCat.length > 0 ? (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={expensesByCat} dataKey="amount" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={50}>
                    {expensesByCat.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
              <div className="text-xs space-y-1.5 min-w-[140px]">
                {expensesByCat.slice(0, 6).map((cat, i) => (
                  <div key={cat.categoryId} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-slate-600 truncate">{cat.icon} {cat.name}</span>
                    <span className="font-medium text-slate-800 ml-auto">{formatCurrency(cat.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-slate-400 text-sm text-center py-8">Sin gastos registrados</p>
          )}
        </div>

        {/* Income vs Expenses */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Ingresos vs Gastos</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyComparison}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Bar dataKey="ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily expenses line + savings rate */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Gastos diarios — {getMonthName(month)}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={dailyExpenses}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} />
              <Tooltip formatter={(v: any) => formatCurrency(v)} />
              <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Tasa de ahorro</h3>
          <div className="relative w-28 h-28">
            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#f1f5f9" strokeWidth="3" />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={Number(savingRate) >= 20 ? '#22c55e' : '#f59e0b'}
                strokeWidth="3"
                strokeDasharray={`${Math.min(Number(savingRate), 100)}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-slate-800">{savingRate}%</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">del total de ingresos</p>
        </div>
      </div>

      {/* Budget overview */}
      {budgetUsage.length > 0 && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-4">Presupuesto del mes</h3>
          <div className="space-y-3">
            {budgetUsage.map((b) => (
              <div key={b.id}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600">{b.categoryIcon} {b.categoryName}</span>
                  <span className="text-slate-500">{formatCurrency(b.spent)} / {formatCurrency(b.limit)}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      b.percentage >= 100 ? 'bg-red-500' : b.percentage >= 90 ? 'bg-amber-500' : b.percentage >= 70 ? 'bg-yellow-400' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
