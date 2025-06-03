// src/types/index.ts
// Tipagens compartilhadas da aplicação

import { Timestamp } from 'firebase/firestore';
import { Budget } from '../hooks/useAllFamiliesBudgetsOfMonth';

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

export type TransactionWithoutId = Omit<Transaction, 'id'>;

export interface TransactionPaymentModalProps {
    open: boolean;
    transaction: {
        id: string;
        name: string;
        amount: number;
        currency: 'EUR' | 'BRL';
        date: Timestamp;
        paid?: boolean;
        paidAt?: Timestamp;
        createdAt?: Timestamp;
    } | null;
    onClose: () => void;
    onConfirm: (data: {
        paid: boolean;
        date: Timestamp;
        createdAt?: Timestamp;
        amount: number;
        currency: 'EUR' | 'BRL';
    }) => Promise<void>;
}

export interface TransactionEditModalProps {
    open: boolean;
    transaction: Transaction | null;
    budgetsOfMonth: Budget[]; // ou o tipo correto de budgets
    path: string;
    onClose: () => void;
    onSaved: () => void;
}

export interface TotalsSummaryProps {
    totalIncome: number;
    totalExpense: number;
    balance: number;
    totalPaid: number;
    totalToPay: number;
    viewCurrency: 'EUR' | 'BRL';
    onToggleCurrency: () => void;
    fmt: (value: number, curr: 'EUR' | 'BRL') => string;
}

export interface FamilyCardProps {
    id: string;
    name: string;
    isFavourite: boolean;
    isSelected: boolean;
    onSelect: (id: string) => void;
    onSetFavourite: (id: string) => void;
    onCopyId: (id: string) => void;
}

export type FamilySelectorMode = 'select' | 'create' | 'join';

export interface FamilySelectorDrawerProps {
    open: boolean;
    families: { id: string; name: string }[];
    selectedFamilyId: string | null;
    favouriteFamilyId: string | null;
    mode: FamilySelectorMode;
    loading: boolean;
    error?: string | null;
    onClose: () => void;
    onSelectFamily: (id: string) => void;
    onSetFavourite: (id: string) => void;
    onCopyId: (id: string) => void;
    onChangeMode: (mode: FamilySelectorMode) => void;
    onCreateFamily: (name: string) => void;
    onJoinFamily: (id: string) => void;
}

export interface TransactionFiltersProps {
    filterDate: string;
    setFilterDate: (date: string) => void;
    filterName: string;
    setFilterName: (name: string) => void;
    filterCategory: string;
    setFilterCategory: (category: string) => void;
    categories: { id: string; name: string }[];
    clearFilters: () => void;
}

export interface TransactionFiltersDrawerProps extends TransactionFiltersProps {
    open: boolean;
    onClose: () => void;
    onApply: () => void;
}

export interface TransactionFormProps {
    path: string;
    budgetsOfMonth: Array<{
        id: string;
        categoryId: string;
        date: Date | { seconds: number };
    }>;
    initialValues?: {
        id?: string;
        name?: string;
        categoryId?: string;
        categoryName?: string;
        amount?: number | string;
        date?: Date | string | { seconds: number };
        type?: 'income' | 'expense' | 'budget';
        currency?: 'EUR' | 'BRL';
        createdAt?: Timestamp;
        paid?: boolean;
        paidAt?: Timestamp;
        downloadUrl?: string;
    };
    onClose?: () => void;
    onSaved?: () => void;
}

export interface Category {
  id: string;
  name: string;
  ownerId: string;
  scope: string;
  createdAt: Timestamp; // Pode ser Timestamp do Firebase ou Date, ajuste conforme seu uso
  txCount?: number; // Quantidade de transações atreladas (campo auxiliar)
}