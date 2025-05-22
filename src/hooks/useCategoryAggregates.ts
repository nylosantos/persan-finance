// src/hooks/useCategoryAggregates.ts
// Hook para agregar valores por categoria em um mês específico

import { useEffect, useState } from 'react';
import { where, Timestamp, query, collection } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Transaction } from '../types';
import { useCategories } from './useCategories';
import { getDocs } from 'firebase/firestore';


interface CategoryAggregate {
    categoryId: string;
    categoryName: string;
    total: number;
}

/**
 * useCategoryAggregates: retorna soma de despesas (ou receitas) por categoria no mês.
 * @param familyId ID da familia
 * @param monthKey 'YYYY-MM'
 * @param type 'income' | 'expense'
 */
export function useCategoryAggregates(
    familyId: string,
    monthKey: string,
    type: 'income' | 'expense' = 'expense'
) {
    const [data, setData] = useState<CategoryAggregate[]>([]);
    const [loading, setLoading] = useState(true);

    // carregamos categorias family para mapear nomes
    const { categories } = useCategories('family', familyId);

    useEffect(() => {
        async function fetch() {
            setLoading(true);
            // Datas inicio/fim mês
            const [year, month] = monthKey.split('-').map(Number);
            const start = Timestamp.fromDate(new Date(year, month - 1, 1));
            const end = Timestamp.fromDate(new Date(year, month, 0, 23, 59, 59));

            const colRef = collection(db, `families/${familyId}/financialData`);
            const q = query(
                colRef,
                where('type', '==', type),
                where('date', '>=', start),
                where('date', '<=', end)
            );
            const snap = await getDocs(q); // change to getDocs? needs import
            const map = new Map<string, number>();
            snap.docs.forEach(doc => {
                const tx = doc.data() as Transaction;
                const prev = map.get(tx.categoryId) ?? 0;
                map.set(tx.categoryId, prev + tx.amount);
            });
            // map to array
            const arr: CategoryAggregate[] = Array.from(map.entries()).map(([categoryId, total]) => {
                const cat = categories.find(c => c.id === categoryId);
                return { categoryId, categoryName: cat?.name ?? 'Unknown', total };
            });
            setData(arr);
            setLoading(false);
        }
        fetch();
    }, [familyId, monthKey, type, categories]);

    return { data, loading };
}
