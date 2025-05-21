import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface Budget {
    id: string;
    name: string;
    categoryId: string;
    amount: number;
    currency: 'EUR' | 'BRL';
    date: Timestamp | { seconds: number };
    familyId?: string;
}

export function useAllFamiliesBudgetsOfMonth(familyIds: string[], year: number, month: number) {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!familyIds.length) {
            setBudgets([]);
            setLoading(false);
            return;
        }
        setLoading(true);

        const startDate = Timestamp.fromDate(new Date(year, month, 1));
        const endDate = Timestamp.fromDate(new Date(year, month + 1, 0, 23, 59, 59));

        Promise.all(
            familyIds.map(familyId => {
                const path = `families/${familyId}/financialData`;
                const q = query(
                    collection(db, path),
                    where('type', '==', 'budget'),
                    where('date', '>=', startDate),
                    where('date', '<=', endDate),
                    orderBy('date', 'asc')
                );
                return getDocs(q).then(snapshot =>
                    snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        familyId
                    } as Budget & { familyId: string }))
                );
            })
        ).then(results => {
            setBudgets(results.flat());
            setLoading(false);
        });
    }, [familyIds, year, month]);

    return { budgets, loading };
}