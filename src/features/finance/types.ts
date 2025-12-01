import type { BaseEntity } from '../../types/common';

export type FinanceTransactionType = 'INCOME' | 'EXPENSE';
export type FinanceTransactionStatus = 'DRAFT' | 'POSTED' | 'VOID';

export interface FinanceTransaction extends BaseEntity {
  date: string;
  type: FinanceTransactionType;
  account: string;
  amount: number;
  currency: string;
  status: FinanceTransactionStatus;
  notes?: string;
}


