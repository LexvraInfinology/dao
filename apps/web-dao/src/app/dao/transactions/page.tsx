'use client';

import React, { useState } from 'react';
import { TransactionsHero } from '@/components/dao/transactions/TransactionsHero';
import { TransactionsTable } from '@/components/dao/transactions/TransactionsTable';
import { TransactionsMobileMetrics } from '@/components/dao/transactions/TransactionsMobileMetrics';
import { TransactionsMobileList } from '@/components/dao/transactions/TransactionsMobileList';
import { useWallet } from '@/context/WalletContext';
import { useTransactions } from '@/hooks/useApi';

export default function DaoTransactionsPage() {
  const wallet         = useWallet();
  const [page, setPage] = useState(1);

  const { data: txData, loading, refetch } = useTransactions(wallet.hexAddress, page, 20);

  const transactions = txData?.transactions ?? [];
  const totalPages   = txData?.pages        ?? 1;
  const bttPrice     = txData?.bttPriceUsd  ?? 1;

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden">
      <TransactionsHero
        totalTransactions={txData?.total}
        bttPriceUsd={bttPrice}
      />

      {/* Desktop */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          onRefresh={refetch}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          bttPriceUsd={bttPrice}
        />
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        <TransactionsMobileMetrics
          transactions={transactions}
          bttPriceUsd={bttPrice}
        />
        <TransactionsMobileList
          transactions={transactions}
          loading={loading}
          onRefresh={refetch}
        />
      </div>
    </div>
  );
}
