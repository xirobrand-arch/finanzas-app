import type { Transaction, Budget, Category } from '../types';

export function getMonthTransactions(transactions: Transaction[], month: number, year: number) {
  return transactions.filter((t) => {
    const d = new Date(t.date + 'T00:00:00');
    return d.getMonth() === month && d.getFullYear() === year;
  });
}

export function getTodayTransactions(transactions: Transaction[]) {
  const today = new Date().toISOString().split('T')[0];
  return transactions.filter((t) => t.date === today);
}

export function getTotalIncome(transactions: Transaction[]) {
  return transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[]) {
  return transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
}

export function getUnnecessaryExpenses(transactions: Transaction[]) {
  return transactions
    .filter((t) => t.type === 'expense' && t.isNecessary === 'no')
    .reduce((s, t) => s + t.amount, 0);
}

export function getExpensesByCategory(transactions: Transaction[], categories: Category[]) {
  const expenses = transactions.filter((t) => t.type === 'expense');
  const map = new Map<string, number>();
  for (const t of expenses) {
    map.set(t.categoryId, (map.get(t.categoryId) || 0) + t.amount);
  }
  return Array.from(map.entries())
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      return { categoryId: catId, name: cat?.name || catId, icon: cat?.icon || '', amount };
    })
    .sort((a, b) => b.amount - a.amount);
}

export function getDailyExpenses(transactions: Transaction[], month: number, year: number) {
  const monthTx = getMonthTransactions(transactions, month, year).filter((t) => t.type === 'expense');
  const map = new Map<number, number>();
  for (const t of monthTx) {
    const day = new Date(t.date + 'T00:00:00').getDate();
    map.set(day, (map.get(day) || 0) + t.amount);
  }
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: daysInMonth }, (_, i) => ({
    day: i + 1,
    amount: map.get(i + 1) || 0,
  }));
}

export function getBudgetUsage(
  budgets: Budget[],
  transactions: Transaction[],
  categories: Category[],
  month: number,
  year: number,
) {
  const monthTx = getMonthTransactions(transactions, month, year).filter((t) => t.type === 'expense');
  return budgets
    .filter((b) => b.month === month && b.year === year)
    .map((b) => {
      const spent = monthTx.filter((t) => t.categoryId === b.categoryId).reduce((s, t) => s + t.amount, 0);
      const cat = categories.find((c) => c.id === b.categoryId);
      const pct = b.limit > 0 ? (spent / b.limit) * 100 : 0;
      return {
        ...b,
        categoryName: cat?.name || b.categoryId,
        categoryIcon: cat?.icon || '',
        spent,
        percentage: Math.round(pct * 10) / 10,
      };
    });
}

interface MoneyLeak {
  type: 'excessive' | 'small_purchases' | 'increase' | 'over_budget';
  title: string;
  message: string;
  amount: number;
}

export function detectMoneyLeaks(
  transactions: Transaction[],
  categories: Category[],
  budgets: Budget[],
  month: number,
  year: number,
): MoneyLeak[] {
  const leaks: MoneyLeak[] = [];
  const current = getMonthTransactions(transactions, month, year).filter((t) => t.type === 'expense');
  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const previous = getMonthTransactions(transactions, prevMonth, prevYear).filter((t) => t.type === 'expense');

  const byCat = getExpensesByCategory(current, categories);
  const prevByCat = getExpensesByCategory(previous, categories);

  for (const cat of byCat) {
    const prev = prevByCat.find((p) => p.categoryId === cat.categoryId);
    if (prev && prev.amount > 0) {
      const increase = ((cat.amount - prev.amount) / prev.amount) * 100;
      if (increase > 25) {
        leaks.push({
          type: 'increase',
          title: `${cat.icon} ${cat.name}: aumento significativo`,
          message: `Has gastado S/ ${cat.amount.toFixed(2)} en ${cat.name}. Esto es ${increase.toFixed(0)}% más que el mes anterior.`,
          amount: cat.amount - prev.amount,
        });
      }
    }
  }

  const smallPurchases = current.filter((t) => t.amount <= 20);
  if (smallPurchases.length >= 10) {
    const total = smallPurchases.reduce((s, t) => s + t.amount, 0);
    leaks.push({
      type: 'small_purchases',
      title: 'Compras pequeñas frecuentes',
      message: `Has realizado ${smallPurchases.length} compras pequeñas por un total de S/ ${total.toFixed(2)}. Estos gastos representan una posible fuga de dinero.`,
      amount: total,
    });
  }

  const unnecessary = current.filter((t) => t.isNecessary === 'no');
  if (unnecessary.length > 0) {
    const total = unnecessary.reduce((s, t) => s + t.amount, 0);
    leaks.push({
      type: 'excessive',
      title: 'Gastos innecesarios',
      message: `Tienes ${unnecessary.length} gastos marcados como innecesarios por un total de S/ ${total.toFixed(2)}.`,
      amount: total,
    });
  }

  const usage = getBudgetUsage(budgets, transactions, categories, month, year);
  for (const u of usage) {
    if (u.percentage >= 100) {
      leaks.push({
        type: 'over_budget',
        title: `${u.categoryIcon} ${u.categoryName}: presupuesto superado`,
        message: `Has gastado S/ ${u.spent.toFixed(2)} de S/ ${u.limit.toFixed(2)} (${u.percentage}%).`,
        amount: u.spent - u.limit,
      });
    }
  }

  return leaks.sort((a, b) => b.amount - a.amount);
}
