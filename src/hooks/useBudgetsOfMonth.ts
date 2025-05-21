import { useFirestoreCollection } from './useFirestoreCollection';
import { where, orderBy, Timestamp } from 'firebase/firestore';
import { Transaction } from '../types';

export function useBudgetsOfMonth(path: string, year: number, month: number) {
    // Início e fim do mês
    const startDate = Timestamp.fromDate(new Date(year, month, 1));
    const endDate = Timestamp.fromDate(new Date(year, month + 1, 0, 23, 59, 59));

    // Busca apenas transações do tipo 'budget' no mês/ano
    const constraints = [
        where('type', '==', 'budget'),
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc'),
    ];

    const { data: budgets, loading, error } = useFirestoreCollection<Transaction>(path, constraints);

    return { budgets, loading, error };
}