import { Transaction } from '../types/finance';

/**
 * Format number to Uzbek So'm: e.g. 1 500 000 so'm
 */
export function formatUZS(amount: number, options?: { showSign?: boolean }): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0 so'm";
  }

  const absAmount = Math.abs(amount);
  const parts = Math.round(absAmount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  
  let prefix = '';
  if (options?.showSign) {
    prefix = amount > 0 ? '+ ' : amount < 0 ? '- ' : '';
  } else if (amount < 0) {
    prefix = '- ';
  }
  return `${prefix}${parts} so'm`;
}

/**
 * Get today's ISO date string YYYY-MM-DD
 */
export function getTodayStr(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Format YYYY-MM-DD into DD.MM.YYYY format (e.g. 18.10.2026)
 */
export function formatDateDot(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}.${month}.${year}`;
}

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
];

export function getMonthNameUz(monthIndex: number): string {
  return UZ_MONTHS[monthIndex] || '';
}

/**
 * Format date nicely in Uzbek
 */
export function formatDateUz(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  const mIdx = parseInt(month, 10) - 1;
  return `${parseInt(day, 10)}-${UZ_MONTHS[mIdx]?.toLowerCase() || month}, ${year}`;
}

/**
 * Calculate metrics for a specific date (e.g. today)
 */
export function calculateDateMetrics(transactions: Transaction[], dateStr: string) {
  let income = 0;
  let expense = 0;
  const dayTransactions = transactions.filter((t) => t.date === dateStr);

  for (const t of dayTransactions) {
    if (t.type === 'income') {
      income += t.amount;
    } else {
      expense += t.amount;
    }
  }

  return {
    income,
    expense,
    net: income - expense,
    count: dayTransactions.length,
    transactions: dayTransactions,
  };
}

/**
 * Calculate all-time summary
 */
export function calculateAllTimeSummary(transactions: Transaction[], initialBalance: number = 0) {
  let allIncome = 0;
  let allExpense = 0;

  for (const t of transactions) {
    if (t.type === 'income') {
      allIncome += t.amount;
    } else {
      allExpense += t.amount;
    }
  }

  return {
    allIncome,
    allExpense,
    totalBalance: initialBalance + allIncome - allExpense,
    totalCount: transactions.length,
  };
}
