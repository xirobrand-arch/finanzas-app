export function formatCurrency(amount: number, symbol = 'S/'): string {
  const formatted = Math.abs(amount).toLocaleString('es-PE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-${symbol} ${formatted}` : `${symbol} ${formatted}`;
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' });
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

export function getCurrentTime(): string {
  return new Date().toTimeString().slice(0, 5);
}

export function getMonthName(month: number): string {
  const names = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  return names[month];
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Efectivo',
    yape: 'Yape',
    plin: 'Plin',
    debit_card: 'Tarjeta de débito',
    credit_card: 'Tarjeta de crédito',
    bank_transfer: 'Transferencia',
    other: 'Otro',
  };
  return labels[method] || method;
}

export function getTransactionTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    income: 'Ingreso',
    expense: 'Gasto',
    transfer: 'Transferencia',
    saving: 'Ahorro',
    investment: 'Inversión',
  };
  return labels[type] || type;
}

export function getNecessityLabel(level: string): string {
  const labels: Record<string, string> = {
    yes: 'Necesario',
    no: 'Innecesario',
    unsure: 'No estoy seguro',
  };
  return labels[level] || level;
}

export function percentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 1000) / 10;
}
