import { useMemo } from 'react';
import { useFinance } from '../store/FinanceContext';
import {
  getMonthTransactions, getTotalIncome, getTotalExpenses, getExpensesByCategory,
  getUnnecessaryExpenses, getBudgetUsage,
} from '../utils/analysis';
import { formatCurrency, getMonthName } from '../utils/format';

export default function ReportsPage() {
  const { state } = useFinance();
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();
  const monthTx = useMemo(() => getMonthTransactions(state.transactions, month, year), [state.transactions, month, year]);

  const income = useMemo(() => getTotalIncome(monthTx), [monthTx]);
  const expenses = useMemo(() => getTotalExpenses(monthTx), [monthTx]);
  const savings = income - expenses;
  const savingsRate = income > 0 ? (savings / income) * 100 : 0;
  const unnecessary = useMemo(() => getUnnecessaryExpenses(monthTx), [monthTx]);
  const budgetUsage = useMemo(() => getBudgetUsage(state.budgets, state.transactions, state.categories, month, year), [state.budgets, state.transactions, state.categories, month, year]);
  const topExpenses = useMemo(() => getExpensesByCategory(monthTx, state.categories).slice(0, 5), [monthTx, state.categories]);
  const overBudget = budgetUsage.filter((b) => b.percentage >= 100);

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevTx = useMemo(() => getMonthTransactions(state.transactions, prevMonth, prevYear), [state.transactions, prevMonth, prevYear]);
  const prevIncome = getTotalIncome(prevTx);
  const prevExpenses = getTotalExpenses(prevTx);
  const incomeChange = prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0;
  const expenseChange = prevExpenses > 0 ? ((expenses - prevExpenses) / prevExpenses) * 100 : 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Reporte Mensual</h2>
      <p className="text-sm text-slate-500">{getMonthName(month)} {year}</p>

      {/* Main report card */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 space-y-4">
        <h3 className="text-sm font-semibold text-slate-700">Resumen general</h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-emerald-600 font-medium">Ingresos</p>
            <p className="text-lg font-bold text-emerald-700">{formatCurrency(income)}</p>
            {incomeChange !== 0 && (
              <p className={`text-[10px] mt-0.5 ${incomeChange > 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {incomeChange > 0 ? '+' : ''}{incomeChange.toFixed(1)}% vs mes anterior
              </p>
            )}
          </div>
          <div className="bg-red-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-red-600 font-medium">Gastos</p>
            <p className="text-lg font-bold text-red-700">{formatCurrency(expenses)}</p>
            {expenseChange !== 0 && (
              <p className={`text-[10px] mt-0.5 ${expenseChange < 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {expenseChange > 0 ? '+' : ''}{expenseChange.toFixed(1)}% vs mes anterior
              </p>
            )}
          </div>
          <div className="bg-indigo-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-indigo-600 font-medium">Ahorro</p>
            <p className={`text-lg font-bold ${savings >= 0 ? 'text-indigo-700' : 'text-red-700'}`}>{formatCurrency(savings)}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Tasa: {savingsRate.toFixed(1)}%</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-[10px] text-blue-600 font-medium">Movimientos</p>
            <p className="text-lg font-bold text-blue-700">{monthTx.length}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{monthTx.filter((t) => t.type === 'income').length} ing · {monthTx.filter((t) => t.type === 'expense').length} gas</p>
          </div>
        </div>

        {/* Top categories */}
        <div>
          <h4 className="text-xs font-semibold text-slate-600 mb-2">Top categorías de gasto</h4>
          <div className="space-y-2">
            {topExpenses.map((cat) => {
              const pct = expenses > 0 ? (cat.amount / expenses) * 100 : 0;
              return (
                <div key={cat.name} className="flex items-center gap-3">
                  <span className="text-sm">{cat.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-xs mb-0.5">
                      <span className="text-slate-600">{cat.name}</span>
                      <span className="text-slate-500">{formatCurrency(cat.amount)} ({pct.toFixed(0)}%)</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full">
                      <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Warnings */}
        {(overBudget.length > 0 || unnecessary > 0) && (
          <div className="bg-amber-50 rounded-xl p-3 border border-amber-200">
            <h4 className="text-xs font-semibold text-amber-700 mb-1">Alertas</h4>
            {overBudget.length > 0 && (
              <p className="text-xs text-amber-600">
                {overBudget.length} presupuesto{overBudget.length > 1 ? 's' : ''} superado{overBudget.length > 1 ? 's' : ''}: {overBudget.map((b) => b.categoryName).join(', ')}
              </p>
            )}
            {unnecessary > 0 && (
              <p className="text-xs text-amber-600">
                Gastos innecesarios: {formatCurrency(unnecessary)} ({expenses > 0 ? ((unnecessary / expenses) * 100).toFixed(1) : 0}% del total)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">Diagnóstico</h3>
        <div className="text-sm text-slate-600 space-y-1">
          {savingsRate >= 20 && <p>Excelente tasa de ahorro ({savingsRate.toFixed(1)}%). Sigue así.</p>}
          {savingsRate >= 10 && savingsRate < 20 && <p>Buena tasa de ahorro ({savingsRate.toFixed(1)}%). Intenta llegar al 20%.</p>}
          {savingsRate >= 0 && savingsRate < 10 && <p>Tasa de ahorro baja ({savingsRate.toFixed(1)}%). Revisa tus gastos innecesarios.</p>}
          {savingsRate < 0 && <p>Estás gastando más de lo que ganas. Revisa urgentemente tu presupuesto.</p>}
          {unnecessary > 0 && <p>Podrías ahorrar hasta {formatCurrency(unnecessary)} eliminando gastos innecesarios.</p>}
        </div>
      </div>
    </div>
  );
}
