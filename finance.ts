export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  description?: string;
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  userName: string;
  initialBalance: number;
  currency: string;
}

export interface DaySummary {
  date: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}
