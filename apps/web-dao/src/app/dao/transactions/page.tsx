'use client';

import React, { useState } from 'react';
import { TransactionsHero } from '@/components/dao/transactions/TransactionsHero';
import { TransactionsTable } from '@/components/dao/transactions/TransactionsTable';
import { TransactionsMobileMetrics } from '@/components/dao/transactions/TransactionsMobileMetrics';
import { TransactionsMobileList } from '@/components/dao/transactions/TransactionsMobileList';
import { UnderfundedAlertBanner } from '@/components/dao/UnderfundedAlertBanner';
import { useWallet } from '@/context/WalletContext';
import { useTransactions } from '@/hooks/useApi';

export default function DaoTransactionsPage() {
  const wallet        = useWallet();
  const activeAddress = wallet.base58Address || wallet.hexAddress;

  const [page, setPage]             = useState(1);
  const [limit, setLimit]           = useState(20);
  const [viewScope, setViewScope]   = useState<'all' | 'my'>('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const targetAddress = viewScope === 'my' ? activeAddress : null;

  const { data: txData, loading, refetch } = useTransactions(
    targetAddress,
    page,
    limit,
    typeFilter,
    searchQuery
  );

  const transactions = txData?.transactions ?? [];
  const totalPages   = txData?.pages        ?? 1;
  const totalRecords = txData?.total        ?? transactions.length;
  const trobPrice    = txData?.trobPriceUsd ?? txData?.bttPriceUsd ?? 0.056001;

  const handleScopeChange = (scope: 'all' | 'my') => {
    setViewScope(scope);
    setPage(1);
  };

  const handleTypeChange = (type: string) => {
    setTypeFilter(type);
    setPage(1);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn w-full max-w-full overflow-x-hidden pb-16 sm:pb-24">
      <UnderfundedAlertBanner />
      <TransactionsHero
        totalTransactions={totalRecords}
        bttPriceUsd={trobPrice > 0 ? trobPrice : undefined}
      />

      {/* Desktop */}
      <div className="hidden lg:block space-y-6 sm:space-y-8">
        <TransactionsTable
          transactions={transactions}
          loading={loading}
          onRefresh={refetch}
          page={page}
          totalPages={totalPages}
          total={totalRecords}
          limit={limit}
          onPageChange={setPage}
          onLimitChange={handleLimitChange}
          viewScope={viewScope}
          onViewScopeChange={handleScopeChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          activeAddress={activeAddress}
          bttPriceUsd={trobPrice}
          trobPriceUsd={trobPrice}
        />
      </div>

      {/* Mobile */}
      <div className="lg:hidden space-y-4 sm:space-y-5">
        <TransactionsMobileMetrics
          transactions={transactions}
          totalTransactions={totalRecords}
          bttPriceUsd={trobPrice}
        />
        <TransactionsMobileList
          transactions={transactions}
          loading={loading}
          onRefresh={refetch}
          page={page}
          totalPages={totalPages}
          total={totalRecords}
          limit={limit}
          onPageChange={setPage}
          viewScope={viewScope}
          onViewScopeChange={handleScopeChange}
          typeFilter={typeFilter}
          onTypeFilterChange={handleTypeChange}
          activeAddress={activeAddress}
        />
      </div>
    </div>
  );
}
