import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatUZS, formatDateDot, getTodayStr } from '../utils/formatters';

interface TransactionsViewProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  onEdit,
  onDelete,
}) => {
  const todayStr = getTodayStr();

  // Selected date state. Defaults to today's date (e.g. 2026-10-18)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [isAllDates, setIsAllDates] = useState<boolean>(false);

  // Type filter: 'all' | 'income' | 'expense' (barchasi, kirimlar, chiqimlar)
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');

  // Navigate to previous day
  const handlePrevDay = () => {
    setIsAllDates(false);
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    setSelectedDate(`${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`);
  };

  // Navigate to next day
  const handleNextDay = () => {
    setIsAllDates(false);
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    setSelectedDate(`${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`);
  };

  // Quick set to Today
  const handleSetToday = () => {
    setIsAllDates(false);
    setSelectedDate(todayStr);
  };

  // Quick set to Yesterday
  const handleSetYesterday = () => {
    setIsAllDates(false);
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    setSelectedDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  // Filtered transactions for the selected day and type
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Date filter
      if (!isAllDates && t.date !== selectedDate) {
        return false;
      }
      // Type filter
      if (typeFilter !== 'all' && t.type !== typeFilter) {
        return false;
      }
      return true;
    }).sort((a, b) => b.createdAt - a.createdAt);
  }, [transactions, selectedDate, isAllDates, typeFilter]);

  // Day calculations
  const daySummary = useMemo(() => {
    let inc = 0;
    let exp = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'income') inc += t.amount;
      else exp += t.amount;
    });
    return {
      income: inc,
      expense: exp,
      net: inc - exp,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      
      {/* Calendar & Date Selection Bar */}
      <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm space-y-4">
        
        {/* Calendar Picker and Day Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Main Date Display & Full Year Picker */}
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-950/60 text-emerald-400 shrink-0">
              <CalendarIcon className="w-5 h-5" />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrevDay}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Oldingi kun"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Native Date Picker covering entire years (past, present, future) */}
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => {
                  if (e.target.value) {
                    setSelectedDate(e.target.value);
                    setIsAllDates(false);
                  }
                }}
                className="px-3 py-1.5 text-sm font-bold font-mono tabular-nums rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              />

              <button
                type="button"
                onClick={handleNextDay}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="Keyingi kun"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Formatted Date Label: e.g. '18.10.2026' */}
            <span className="text-sm font-extrabold font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-900/60 px-2.5 py-1 rounded-lg">
              {isAllDates ? 'Barcha kunlar' : formatDateDot(selectedDate)}
            </span>
          </div>

          {/* Quick presets: Bugun, Kecha, Barcha kunlar */}
          <div className="flex items-center gap-1.5 self-end sm:self-auto text-xs">
            <button
              onClick={handleSetToday}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
                !isAllDates && selectedDate === todayStr
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Bugun
            </button>
            <button
              onClick={handleSetYesterday}
              className="px-3 py-1.5 font-medium rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 transition-colors"
            >
              Kecha
            </button>
            <button
              onClick={() => setIsAllDates(!isAllDates)}
              className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
                isAllDates
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Barcha kunlar
            </button>
          </div>

        </div>

        {/* Filter Buttons: Barchasi, Kirimlar, Chiqimlar */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <div className="flex items-center gap-1 p-1 bg-slate-800/80 rounded-xl">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-xs border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'income'
                  ? 'bg-slate-900 text-emerald-400 shadow-xs border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Kirimlar
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                typeFilter === 'expense'
                  ? 'bg-slate-900 text-rose-400 shadow-xs border border-slate-700/60'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Chiqimlar
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {daySummary.count} ta yozuv
          </span>
        </div>

      </div>

      {/* Day's Financial Summary Card */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-300 font-semibold">
          {isAllDates ? 'Barcha kunlar bo\'yicha:' : `${formatDateDot(selectedDate)} kunlik natija:`}
        </span>
        <div className="flex items-center gap-4 font-mono tabular-nums">
          <span className="text-emerald-400 font-bold">
            Kirim: +{formatUZS(daySummary.income)}
          </span>
          <span className="text-rose-400 font-bold">
            Chiqim: -{formatUZS(daySummary.expense)}
          </span>
          <span className="text-white font-bold">
            Sof: {formatUZS(daySummary.net, { showSign: true })}
          </span>
        </div>
      </div>

      {/* Transactions List / Table */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            {isAllDates
              ? 'Hozircha hech qanday operatsiya mavjud emas.'
              : `${formatDateDot(selectedDate)} sanasida hech qanday operatsiya topilmadi.`}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-800/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-semibold">Sana</th>
                  <th className="py-3 px-4 font-semibold">Turi</th>
                  <th className="py-3 px-4 font-semibold">Nomi / Izoh</th>
                  <th className="py-3 px-4 font-semibold text-right">Miqdor (so'm)</th>
                  <th className="py-3 px-4 font-semibold text-right">Amallar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium">
                {filteredTransactions.map((trx) => {
                  const isInc = trx.type === 'income';

                  return (
                    <tr key={trx.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-slate-300">
                        <div>{formatDateDot(trx.date)}</div>
                        {trx.time && (
                          <div className="text-[11px] text-slate-400">{trx.time}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isInc ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isInc ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          )}
                          <span>{isInc ? 'Kirim' : 'Chiqim'}</span>
                        </span>
                      </td>

                      <td className="py-3 px-4 text-white font-semibold">
                        {trx.title}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right font-mono tabular-nums font-bold">
                        <span className={isInc ? 'text-emerald-400' : 'text-rose-400'}>
                          {formatUZS(trx.amount, { showSign: true })}
                        </span>
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onEdit(trx)}
                            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                            title="Tahrirlash"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDelete(trx.id)}
                            className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                            title="O'chirish"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
