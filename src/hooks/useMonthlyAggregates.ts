import { useEffect, useState } from 'react';
import { collection, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Transaction } from '../types';

interface MonthlyTotals {
    month: string;
    income: number;
    expense: number;
}

export function useMonthlyAggregates(familyId: string) {
    const [data, setData] = useState<MonthlyTotals[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const ref = collection(db, `families/${familyId}/financialData`);
        return onSnapshot(ref, snapshot => {
            const monthlyMap = new Map<string, MonthlyTotals>();

            snapshot.forEach(doc => {
                const tx = doc.data() as Transaction;
                const date = (tx.date as Timestamp).toDate();
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

                if (!monthlyMap.has(key)) {
                    monthlyMap.set(key, { month: key, income: 0, expense: 0 });
                }

                const entry = monthlyMap.get(key)!;
                if (tx.type === 'income') entry.income += tx.amount;
                else if (tx.type === 'expense') entry.expense += tx.amount;
            });

            const sorted = Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
            setData(sorted);
            setLoading(false);
        });
    }, [familyId]);

    return { data, loading };
}
