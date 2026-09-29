import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useFinance } from '../store/FinanceContext';
import { formatCurrency, getMonthName } from '../utils/format';

export default function CalendarPage() {
  const { state } = useFinance();
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const dayData = useMemo(() => {
    const map = new Map<number, { income: number; expense: number; transactions: typeof state.transactions }>();
    for (const t of state.transactions) {
      const d = new Date(t.date + 'T00:00:00');
      if (d.getMonth() === month && d.getFullYear() === year) {
        const day = d.getDate();
        const existing = map.get(day) || { income: 0, expense: 0, transactions: [] };
        if (t.type === 'income') existing.income += t.amount;
        else if (t.type === 'expense') existing.expense += t.amount;
        existing.transactions = [...existing.transactions, t];
        map.set(day, existing);
      }
    }
    return map;
  }, [state.transactions, month, year]);

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(year - 1); }
    else setMonth(month - 1);
    setSelectedDay(null);
  }

  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(year + 1); }
    else setMonth(month + 1);
    setSelectedDay(null);
  }

  const selectedData = selectedDay ? dayData.get(selectedDay) : null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-800">Calendario Financiero</h2>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <button onClick={prevMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronLeft size={18} /></button>
          <h3 className="text-sm font-semibold text-slate-700">{getMonthName(month)} {year}</h3>
          <button onClick={nextMonth} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><ChevronRight size={18} /></button>
        </div>

        <div className="grid grid-cols-7 text-center text-xs font-medium text-slate-400 py-2 border-b border-slate-50">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((d) => <div key={d}>{d}</div>)}
        </div>

        <div className="grid grid-cols-7">
          {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`e${i}`} className="p-2 min-h-[70px]" />)}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const data = dayData.get(day);
            const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            const isSelected = day === selectedDay;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-1.5 min-h-[70px] text-left border-b border-r border-slate-50 hover:bg-slate-50 transition-colors ${
                  isSelected ? 'bg-indigo-50 ring-2 ring-indigo-400 ring-inset' : ''
                }`}
              >
                <span className={`text-xs font-medium ${isToday ? 'bg-indigo-600 text-white px-1.5 py-0.5 rounded-full' : 'text-slate-600'}`}>
                  {day}
                </span>
                {data && (
                  <div className="mt-1 space-y-0.5">
                    {data.income > 0 && <div className="text-[9px] text-emerald-600 font-medium truncate">+{formatCurrency(data.income)}</div>}
                    {data.expense > 0 && <div className="text-[9px] text-red-500 font-medium truncate">-{formatCurrency(data.expense)}</div>}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day detail */}
      {selectedDay && (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">
            {selectedDay} {getMonthName(month)} {year}
          </h3>
          {selectedData ? (
            <>
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-emerald-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-emerald-600 font-medium">Ingresos</p>
                  <p className="text-sm font-bold text-emerald-700">{formatCurrency(selectedData.income)}</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-red-600 font-medium">Gastos</p>
                  <p className="text-sm font-bold text-red-700">{formatCurrency(selectedData.expense)}</p>
                </div>
                <div className="bg-indigo-50 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-indigo-600 font-medium">Balance</p>
                  <p className="text-sm font-bold text-indigo-700">{formatCurrency(selectedData.income - selectedData.expense)}</p>
                </div>
              </div>
              <div className="space-y-2">
                {selectedData.transactions.map((t) => {
                  const cat = state.categories.find((c) => c.id === t.categoryId);
                  return (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cat?.icon}</span>
                        <div>
                          <p className="text-sm font-medium text-slate-700">{t.description || cat?.name}</p>
                          <p className="text-[10px] text-slate-400">{t.time}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Sin movimientos este día.</p>
          )}
        </div>
      )}
    </div>
  );
}
