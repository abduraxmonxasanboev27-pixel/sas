import { Transaction, UserSettings } from '../types/finance';
import { getTodayStr } from './formatters';

const TRANSACTIONS_KEY = 'smart_hisob_clean_transactions_v3';
const SETTINGS_KEY = 'smart_hisob_clean_settings_v3';

export const DEFAULT_SETTINGS: UserSettings = {
  userName: 'Foydalanuvchi',
  initialBalance: 0,
  currency: 'UZS',
};

/**
 * Load transactions from local storage. Starts empty with NO fake/demo transactions.
 */
export function loadTransactions(): Transaction[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Error loading transactions:', e);
    return [];
  }
}

/**
 * Save transactions to localStorage
 */
export function saveTransactions(transactions: Transaction[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (e) {
    console.error('Error saving transactions:', e);
  }
}

/**
 * Load user settings
 */
export function loadSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Save user settings
 */
export function saveSettings(settings: UserSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Error saving settings:', e);
  }
}
