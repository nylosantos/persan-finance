import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebase';

export interface MonthlyAggregate {
    month: string; // Ex: '2024-05'
    income: number;
    expense: number;
}

export function useAllFamiliesMonthlyAggregates(familyIds: string[]) {
    const [data, setData] = useState<MonthlyAggregate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!familyIds.length) {
            setData([]);
            setLoading(false);
            return;
        }
        setLoading(true);

        Promise.all(
            familyIds.map(familyId => {
                // Supondo que cada família tem uma subcoleção 'monthlyAggregates'
                const path = `families/${familyId}/monthlyAggregates`;
                return getDocs(collection(db, path)).then(snapshot =>
                    snapshot.docs.map(doc => doc.data() as MonthlyAggregate)
                );
            })
        ).then(results => {
            // Junta todos os meses de todas as famílias, somando os valores de meses iguais
            const merged: Record<string, MonthlyAggregate> = {};
            results.flat().forEach(agg => {
                if (!merged[agg.month]) {
                    merged[agg.month] = { ...agg };
                } else {
                    merged[agg.month].income += agg.income;
                    merged[agg.month].expense += agg.expense;
                }
            });
            // Ordena por mês
            const sorted = Object.values(merged).sort((a, b) => a.month.localeCompare(b.month));
            setData(sorted);
            setLoading(false);
        });
    }, [familyIds]);

    return { data, loading };
}