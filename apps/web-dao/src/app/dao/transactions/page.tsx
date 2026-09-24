'use client';

import React from 'react';
import { TransactionsHero } from '@/components/dao/transactions/TransactionsHero';
import { TransactionsTable } from '@/components/dao/transactions/TransactionsTable';
import { TransactionsMobileMetrics } from '@/components/dao/transactions/TransactionsMobileMetrics';
import { TransactionsMobileList } from '@/components/dao/transactions/TransactionsMobileList';

export default function DaoTransactionsPage() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      {/* 1. Hero Section (Responsive: Desktop with orbital rings & micro-tags vs Mobile compact) */}
      <TransactionsHero />

      {/* =========================================================================
          2. DESKTOP VIEW (Visible on lg and above - exactly matching Desktop - 18)
         ========================================================================= */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        <TransactionsTable />
      </div>

      {/* =========================================================================
          3. MOBILE VIEW (Visible below lg - exactly matching Transactions Mobile)
         ========================================================================= */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        {/* Mobile Metrics & Filter Bar */}
        <TransactionsMobileMetrics />

        {/* Mobile Card Feed */}
        <TransactionsMobileList />
      </div>
    </div>
  );
}
