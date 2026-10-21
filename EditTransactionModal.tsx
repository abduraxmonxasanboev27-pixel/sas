import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, AlertCircle } from 'lucide-react';
import { Transaction, TransactionType } from '../types/finance';
import { formatUZS } from '../utils/formatters';

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  onUpdate: (updated: Transaction) => void;
  onDelete: (id: string) => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  isOpen,
  onClose,
  transaction,
  onUpdate,
  onDelete,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setAmount(String(transaction.amount));
      setTitle(transaction.title);
      setDate(transaction.date);
      setError('');
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = Number(amount.replace(/\D/g, ''));

    if (!cleanAmount || cleanAmount <= 0) {
      setError('Iltimos, pul miqdorini to\'g\'ri kiriting.');
      return;
    }

    if (!title.trim()) {
      setError('Iltimos, nomini kiriting.');
      return;
    }

    onUpdate({
      ...transaction,
      type,
      amount: cleanAmount,
      title: title.trim(),
      date,
      updatedAt: Date.now(),
    });

    onClose();
  };

  const handleDelete = () => {
    if (window.confirm(`"${transaction.title}" yozuvini o'chirishni xohlaysizmi?`)) {
      onDelete(transaction.id);
      onClose();
    }
  };

  const numAmount = Number(amount.replace(/\D/g, '')) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-slate-900 rounded-2xl shadow-xl border border-slate-800 overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-base font-bold text-white">
            Operatsiyani tahrirlash
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-2.5 text-xs text-rose-300 bg-rose-950/50 border border-rose-900/60 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Type Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-800/80 rounded-xl gap-1">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                type === 'income' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              Kirim (+)
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                type === 'expense' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-400'
              }`}
            >
              Chiqim (-)
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Pul miqdori (so'm)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value.replace(/\D/g, ''));
                setError('');
              }}
              className="w-full px-3.5 py-2 text-base font-bold font-mono tabular-nums rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {numAmount > 0 && (
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                {formatUZS(numAmount)}
              </p>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Nomi / Maqsadi
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Sana
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-700 bg-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>O'chirish</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-medium text-slate-400 hover:bg-slate-800 hover:text-white rounded-xl"
              >
                Bekor qilish
              </button>
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>Saqlash</span>
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
