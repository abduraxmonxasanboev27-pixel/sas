/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Transaction } from './types/finance';
import { loadTransactions, saveTransactions } from './utils/storage';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { TransactionsView } from './components/TransactionsView';
import { StatisticsView } from './components/StatisticsView';
import { EditTransactionModal } from './components/EditTransactionModal';

export default function App() {
  // Main transactions state - initialized completely clean with NO demo/fake money
  const [transactions, setTransactions] = useState<Transaction[]>(() => loadTransactions());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  const handleUpdateTransactions = (newTransactions: Transaction[]) => {
    setTransactions(newTransactions);
    saveTransactions(newTransactions);
  };

  // Add new transaction
  const handleAddTransaction = (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTrx: Transaction = {
      ...data,
      id: `trx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const updated = [newTrx, ...transactions];
    handleUpdateTransactions(updated);
  };

  // Update existing transaction
  const handleEditTransaction = (updatedTrx: Transaction) => {
    const updated = transactions.map((t) => (t.id === updatedTrx.id ? updatedTrx : t));
    handleUpdateTransactions(updated);
  };

  // Delete transaction
  const handleDeleteTransaction = (id: string) => {
    const updated = transactions.filter((t) => t.id !== id);
    handleUpdateTransactions(updated);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Clean Navbar */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main View Port */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onEditTransaction={(trx) => setEditingTransaction(trx)}
          />
        )}

        {activeTab === 'history' && (
          <TransactionsView
            transactions={transactions}
            onEdit={(trx) => setEditingTransaction(trx)}
            onDelete={handleDeleteTransaction}
          />
        )}

        {activeTab === 'analytics' && (
          <StatisticsView transactions={transactions} />
        )}
      </main>

      {/* Edit Modal */}
      <EditTransactionModal
        isOpen={editingTransaction !== null}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        onUpdate={handleEditTransaction}
        onDelete={handleDeleteTransaction}
      />

      {/* Simple Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-900 py-4 text-center text-xs text-slate-400">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <span>Smart Hisob — Shaxsiy moliya boshqaruvi</span>
          <span className="font-mono">Valyuta: UZS (so'm)</span>
        </div>
      </footer>

    </div>
  );
}
