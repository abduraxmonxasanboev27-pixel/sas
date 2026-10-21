import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowDownRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  Wallet,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Transaction, TransactionType } from '../types/finance';
import { formatUZS, getTodayStr, formatDateDot } from '../utils/formatters';

interface DashboardViewProps {
  transactions: Transaction[];
  onAddTransaction: (trx: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onDeleteTransaction: (id: string) => void;
  onEditTransaction: (trx: Transaction) => void;
}

const QUICK_AMOUNTS = [10000, 50000, 100000, 200000, 500000, 1000000];

export const DashboardView: React.FC<DashboardViewProps> = ({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
  onEditTransaction,
}) => {
  const todayStr = getTodayStr();

  // Selected date for the dashboard (default is today)
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  // Form state
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string>('');

  // Date navigation handlers
  const handlePrevDay = () => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    setSelectedDate(`${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`);
  };

  const handleNextDay = () => {
    const curr = new Date(selectedDate);
    curr.setDate(curr.getDate() + 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    setSelectedDate(`${curr.getFullYear()}-${pad(curr.getMonth() + 1)}-${pad(curr.getDate())}`);
  };

  const handleSetToday = () => {
    setSelectedDate(todayStr);
  };

  const handleSetYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    const pad = (n: number) => String(n).padStart(2, '0');
    setSelectedDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
  };

  // Filter transactions for the selected date
  const dayTransactions = transactions.filter((t) => t.date === selectedDate);

  // Day metrics
  let dayIncome = 0;
  let dayExpense = 0;
  for (const t of dayTransactions) {
    if (t.type === 'income') dayIncome += t.amount;
    else dayExpense += t.amount;
  }
  const dayNet = dayIncome - dayExpense;

  // All time total balance
  let allIncome = 0;
  let allExpense = 0;
  for (const t of transactions) {
    if (t.type === 'income') allIncome += t.amount;
    else allExpense += t.amount;
  }
  const currentTotalBalance = allIncome - allExpense;

  const handleQuickAdd = (val: number) => {
    const curr = Number(amount.replace(/\D/g, '')) || 0;
    setAmount(String(curr + val));
    setError('');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(amount.replace(/\D/g, ''));

    if (!cleanAmount || cleanAmount <= 0) {
      setError('Iltimos, pul miqdorini to\'g\'ri kiriting (0 dan katta bo\'lsin).');
      return;
    }

    if (!title.trim()) {
      setError('Iltimos, nima uchun ishlatilgani yoki daromad nomini kiriting.');
      return;
    }

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    onAddTransaction({
      type,
      amount: cleanAmount,
      title: title.trim(),
      date: selectedDate,
      time: timeStr,
    });

    setAmount('');
    setTitle('');
    setError('');
    setSuccessMsg(type === 'income' ? 'Kirim saqlandi!' : 'Chiqim saqlandi!');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const isToday = selectedDate === todayStr;
  const numAmount = Number(amount.replace(/\D/g, '')) || 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Calendar Header Bar for Dashboard */}
      <div className="p-4 sm:p-5 bg-slate-900 rounded-2xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        
        {/* Calendar Picker and Day Controls */}
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

            {/* Native Date Input */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                if (e.target.value) {
                  setSelectedDate(e.target.value);
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

          <span className="text-sm font-extrabold font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-900/60 px-2.5 py-1 rounded-lg">
            {formatDateDot(selectedDate)}
          </span>
        </div>

        {/* Quick Presets: Bugun, Kecha */}
        <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
          <button
            onClick={handleSetToday}
            className={`px-3 py-1.5 font-medium rounded-lg transition-colors ${
              isToday
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
          <span className="text-slate-400 font-mono text-[11px] ml-1">
            {dayTransactions.length} ta yozuv
          </span>
        </div>

      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Kirim (Foyda) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>{isToday ? 'Bugungi kirim' : `${formatDateDot(selectedDate)} kirimi`}</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-emerald-400 truncate">
            +{formatUZS(dayIncome)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Topilgan pul
          </div>
        </div>

        {/* Chiqim (Zarar/Sarf) */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>{isToday ? 'Bugungi chiqim' : `${formatDateDot(selectedDate)} chiqimi`}</span>
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-rose-400 truncate">
            -{formatUZS(dayExpense)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Sarflangan pul
          </div>
        </div>

        {/* Sof Qoldiq */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Kunlik qoldiq</span>
            <span className="text-[11px] font-semibold text-slate-400">Sof</span>
          </div>
          <div
            className={`text-lg sm:text-xl font-bold font-mono tabular-nums truncate ${
              dayNet >= 0 ? 'text-white' : 'text-amber-400'
            }`}
          >
            {formatUZS(dayNet, { showSign: true })}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Kirim − Chiqim
          </div>
        </div>

        {/* Joriy Umumiy Balans */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span>Joriy umumiy balans</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono tabular-nums text-white truncate">
            {formatUZS(currentTotalBalance)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Mavjud jami pul
          </div>
        </div>

      </div>

      {/* Direct Add Form */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {isToday ? 'Bugungi operatsiyani kiritish' : `${formatDateDot(selectedDate)} sanasiga kiritish`}
          </h2>
          <span className="text-xs text-slate-400 font-mono">
            Sana: {formatDateDot(selectedDate)}
          </span>
        </div>

        {/* Type Toggle: Kirim or Chiqim */}
        <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Kirim (+ daromad)</span>
          </button>

          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex items-center justify-center gap-1.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all ${
              type === 'expense'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Chiqim (- xarajat)</span>
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-950/50 border border-rose-900/60 rounded-xl">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 p-3 text-xs text-emerald-300 bg-emerald-950/50 border border-emerald-900/60 rounded-xl">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Pul miqdori (so'mda) <span className="text-rose-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={amount}
                  onChange={(e) => {
                    setAmount(e.target.value.replace(/\D/g, ''));
                    setError('');
                  }}
                  placeholder="0"
                  className="w-full px-4 py-2.5 text-base font-bold font-mono tabular-nums rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 pr-14"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                  so'm
                </span>
              </div>

              {numAmount > 0 && (
                <p className="text-[11px] text-slate-400 mt-1 font-mono">
                  {formatUZS(numAmount)}
                </p>
              )}

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleQuickAdd(amt)}
                    className="px-2 py-1 text-[11px] font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg transition-colors font-mono"
                  >
                    +{amt >= 1000000 ? `${amt / 1000000} mln` : `${amt / 1000} ming`}
                  </button>
                ))}
              </div>
            </div>

            {/* Title / Description */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {type === 'income' ? 'Daromad manbasi / nomi' : 'Nima uchun sarflandi?'} <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'income' ? 'Masalan: Maosh, Sovg\'a, Savdo tushumi' : 'Masalan: Tushlik, Bozor, Benzin, Yo\'l kira'}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  className={`flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-semibold text-white rounded-xl shadow-xs transition-all w-full sm:w-auto ${
                    type === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-rose-600 hover:bg-rose-500'
                  }`}
                >
                  <Plus className="w-4 h-4" />
                  <span>{type === 'income' ? 'Kirimni saqlash' : 'Chiqimni saqlash'}</span>
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>

      {/* Transactions List of Selected Date */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            {formatDateDot(selectedDate)} kiritilganlar ro'yxati
          </h2>
          <span className="text-xs text-slate-400">
            {dayTransactions.length} ta operatsiya
          </span>
        </div>

        {dayTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            {formatDateDot(selectedDate)} sanasida hali hech narsa kiritilmagan. Yuqoridagi formadan kiritishingiz mumkin.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/80">
            {dayTransactions.map((trx) => {
              const isInc = trx.type === 'income';
              return (
                <div
                  key={trx.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-800/50 px-2 rounded-xl transition-colors group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isInc
                          ? 'bg-emerald-950/60 text-emerald-400'
                          : 'bg-rose-950/60 text-rose-400'
                      }`}
                    >
                      {isInc ? (
                        <ArrowDownRight className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold text-white truncate">
                        {trx.title}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {trx.time || 'Vaqtsiz'} · {isInc ? 'Kirim' : 'Chiqim'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono tabular-nums ${
                        isInc ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatUZS(trx.amount, { showSign: true })}
                    </span>

                    <button
                      onClick={() => onEditTransaction(trx)}
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteTransaction(trx.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
