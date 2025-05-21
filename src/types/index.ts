// src/types/index.ts
// Tipagens compartilhadas da aplicação

import { Timestamp } from 'firebase/firestore';

/**
 * Representa uma transação financeira (entrada ou saída).
 */
export interface Transaction {
    id: string;
    name: string;
    categoryId: string;
    amount: number;
    currency: 'EUR' | 'BRL';
    date: Timestamp;
    type: 'income' | 'expense' | 'budget';
    userId: string;
    createdAt: Timestamp;
    paidAt?: Timestamp;
    paid?: boolean;
    downloadUrl?: string;
    familyId?: string;
}
