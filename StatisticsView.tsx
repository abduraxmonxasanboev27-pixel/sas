import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatUZS, getTodayStr, getMonthNameUz } from '../utils/formatters';

interface StatisticsViewProps {
  transactions: Transaction[];
}

type StatTab = 'monthly' | 'yearly' | 'allTime';

export const StatisticsView: React.FC<StatisticsViewProps> = ({ transactions }) => {
  const [activeStatTab, setActiveStatTab] = useState<StatTab>('monthly');

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Selected year and month for specific filtering
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentMonth);

  // Available years from transactions
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    transactions.forEach((t) => {
      const y = parseInt(t.date.slice(0, 4), 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions, currentYear]);

  // 1. Oylik Hisob (Monthly)
  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(monthKey));
  }, [transactions, monthKey]);

  let monthIncome = 0;
  let monthExpense = 0;
  for (const t of monthTransactions) {
    if (t.type === 'income') monthIncome += t.amount;
    else monthExpense += t.amount;
  }
  const monthNet = monthIncome - monthExpense;

  // 2. Yillik Hisob (Yearly)
  const yearStr = String(selectedYear);
  const yearTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(yearStr));
  }, [transactions, yearStr]);

  let yearIncome = 0;
  let yearExpense = 0;
  for (const t of yearTransactions) {
    if (t.type === 'income') yearIncome += t.amount;
    else yearExpense += t.amount;
  }
  const yearNet = yearIncome - yearExpense;

  // Year month-by-month breakdown
  const yearMonthsData = useMemo(() => {
    const list = [];
    for (let m = 1; m <= 12; m++) {
      const ym = `${selectedYear}-${String(m).padStart(2, '0')}`;
      let inc = 0;
      let exp = 0;
      transactions.forEach((t) => {
        if (t.date.startsWith(ym)) {
          if (t.type === 'income') inc += t.amount;
          else exp += t.amount;
        }
      });
      list.push({
        monthNumber: m,
        monthName: getMonthNameUz(m - 1),
        income: inc,
        expense: exp,
        net: inc - exp,
      });
    }
    return list;
  }, [transactions, selectedYear]);

  // 3. Shu paytgacha (All-Time)
  let allTimeIncome = 0;
  let allTimeExpense = 0;
  for (const t of transactions) {
    if (t.type === 'income') allTimeIncome += t.amount;
    else allTimeExpense += t.amount;
  }
  const allTimeNet = allTimeIncome - allTimeExpense;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Tab Switcher: Oylik, Yillik, Shu paytgacha */}
      <div className="flex items-center justify-between p-1.5 bg-slate-900 rounded-2xl border border-slate-800 gap-1">
        <button
          onClick={() => setActiveStatTab('monthly')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeStatTab === 'monthly'
              ? 'bg-slate-800 text-white shadow-xs border border-slate-700/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Oylik statistika
        </button>

        <button
          onClick={() => setActiveStatTab('yearly')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeStatTab === 'yearly'
              ? 'bg-slate-800 text-white shadow-xs border border-slate-700/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Yillik statistika
        </button>

        <button
          onClick={() => setActiveStatTab('allTime')}
          className={`flex-1 py-2.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
            activeStatTab === 'allTime'
              ? 'bg-slate-800 text-white shadow-xs border border-slate-700/60'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Shu paytgacha (Barchasi)
        </button>
      </div>

      {/* --- 1. OYLIK STATISTIKA --- */}
      {activeStatTab === 'monthly' && (
        <div className="space-y-5">
          {/* Month & Year Selectors */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm">
                Oyni tanlang:
              </span>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthNameUz(m - 1)}
                  </option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y}-yil
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Monthly KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Oylik Kirim */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Oylik kirim</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
                +{formatUZS(monthIncome)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {getMonthNameUz(selectedMonth - 1)} oyida topilgan
              </div>
            </div>

            {/* Oylik Chiqim */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Oylik chiqim</span>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400">
                -{formatUZS(monthExpense)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {getMonthNameUz(selectedMonth - 1)} oyida sarflangan
              </div>
            </div>

            {/* Oylik Sof Qoldiq */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>Oylik sof qoldiq</span>
                <Wallet className="w-4 h-4 text-slate-400" />
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                  monthNet >= 0 ? 'text-white' : 'text-amber-400'
                }`}
              >
                {formatUZS(monthNet, { showSign: true })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                {monthNet >= 0 ? 'Foyda' : 'Zarar'}
              </div>
            </div>
          </div>

          {/* Month records list */}
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-white mb-3">
              {getMonthNameUz(selectedMonth - 1)} {selectedYear} amallari ({monthTransactions.length} ta)
            </h3>
            {monthTransactions.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                Bu oyda operatsiyalar mavjud emas.
              </p>
            ) : (
              <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto">
                {monthTransactions.map((trx) => (
                  <div key={trx.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-white">{trx.title}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{trx.date}</div>
                    </div>
                    <div
                      className={`font-bold font-mono tabular-nums ${
                        trx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatUZS(trx.amount, { showSign: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- 2. YILLIK STATISTIKA --- */}
      {activeStatTab === 'yearly' && (
        <div className="space-y-5">
          {/* Year Selector */}
          <div className="flex items-center justify-between p-4 bg-slate-900 rounded-2xl border border-slate-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-white text-sm">
                Yilni tanlang:
              </span>
            </div>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y}-yil
                </option>
              ))}
            </select>
          </div>

          {/* Yearly KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Yillik Kirim */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{selectedYear}-yil jami kirim</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400">
                +{formatUZS(yearIncome)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Yillik daromad
              </div>
            </div>

            {/* Yillik Chiqim */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{selectedYear}-yil jami chiqim</span>
                <TrendingDown className="w-4 h-4 text-rose-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400">
                -{formatUZS(yearExpense)}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Yillik xarajat
              </div>
            </div>

            {/* Yillik Sof Qoldiq */}
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                <span>{selectedYear}-yil sof qoldiq</span>
                <Wallet className="w-4 h-4 text-slate-400" />
              </div>
              <div
                className={`text-xl sm:text-2xl font-bold font-mono tabular-nums ${
                  yearNet >= 0 ? 'text-white' : 'text-amber-400'
                }`}
              >
                {formatUZS(yearNet, { showSign: true })}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Yil yakunidagi saldo
              </div>
            </div>
          </div>

          {/* Month by month table of the year */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-800 font-bold text-sm text-white">
              {selectedYear}-yil oylari bo'yicha taqsimot
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                  <tr>
                    <th className="py-2.5 px-4">Oy</th>
                    <th className="py-2.5 px-4 text-right">Kirim</th>
                    <th className="py-2.5 px-4 text-right">Chiqim</th>
                    <th className="py-2.5 px-4 text-right">Sof qoldiq</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-medium">
                  {yearMonthsData.map((m) => (
                    <tr key={m.monthNumber} className="hover:bg-slate-800/50">
                      <td className="py-2.5 px-4 font-semibold text-white">
                        {m.monthName}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-400 tabular-nums">
                        {m.income > 0 ? `+${formatUZS(m.income)}` : '0'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-rose-400 tabular-nums">
                        {m.expense > 0 ? `-${formatUZS(m.expense)}` : '0'}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-right font-mono font-bold tabular-nums ${
                          m.net > 0 ? 'text-white' : m.net < 0 ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        {formatUZS(m.net, { showSign: true })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- 3. SHU PAYTGACHA (BARCHASI) --- */}
      {activeStatTab === 'allTime' && (
        <div className="space-y-5">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm">
            <h2 className="text-base font-bold text-white mb-1">
              Shu paytgacha bo'lgan umumiy moliyaviy holat
            </h2>
            <p className="text-xs text-slate-400 mb-5">
              Tizimga kiritilgan barcha operatsiyalar bo'yicha to'liq hisob-kitob
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Barcha Kirim */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs text-slate-400">Shu paytgacha jami kirim</span>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-emerald-400 mt-1">
                  +{formatUZS(allTimeIncome)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Barcha davrlardagi tushum
                </div>
              </div>

              {/* Barcha Chiqim */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs text-slate-400">Shu paytgacha jami chiqim</span>
                <div className="text-xl sm:text-2xl font-bold font-mono tabular-nums text-rose-400 mt-1">
                  -{formatUZS(allTimeExpense)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Barcha davrlardagi xarajat
                </div>
              </div>

              {/* Barcha Qoldiq */}
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80">
                <span className="text-xs text-slate-400">Umumiy joriy balans</span>
                <div
                  className={`text-xl sm:text-2xl font-bold font-mono tabular-nums mt-1 ${
                    allTimeNet >= 0 ? 'text-white' : 'text-rose-400'
                  }`}
                >
                  {formatUZS(allTimeNet)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Kirim − Chiqim
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Jami kiritilgan yozuvlar: <strong>{transactions.length} ta</strong></span>
              <span>Valyuta: <strong>UZS (so'm)</strong></span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
