import { useEffect, useState } from 'react';
import { collection, getDocs, query, where, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Transaction } from '../types';

export function useAllFamiliesMonthlyTransactions(familyIds: string[], year: number, month: number) {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!familyIds.length) {
            setTransactions([]);
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
                    where('date', '>=', startDate),
                    where('date', '<=', endDate),
                    orderBy('date', 'asc')
                );
                return getDocs(q).then(snapshot =>
                    snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data(),
                        familyId // <-- adiciona o familyId aqui
                    } as Transaction & { familyId: string }))
                );
            })
        ).then(results => {
            setTransactions(results.flat());
            setLoading(false);
        });
    }, [familyIds, year, month]);

    return { transactions, loading };
}