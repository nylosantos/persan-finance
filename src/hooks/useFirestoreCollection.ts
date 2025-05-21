import { useEffect, useState } from 'react';
import { collection, query, onSnapshot, QueryConstraint, DocumentData } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Hook para ouvir uma coleção Firestore em tempo real.
 * @param path Caminho da coleção, ex: `families/${familyId}/financialData`
 * @param constraints Array de constraints (where, orderBy, etc.)
 */
export function useFirestoreCollection<T = DocumentData>(
    path: string,
    constraints: QueryConstraint[] = []
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const colRef = collection(db, path);
        const q = constraints.length ? query(colRef, ...constraints) : colRef;
        const unsub = onSnapshot(
            q,
            (snapshot) => {
                const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                setData(items);
                setLoading(false);
            },
            (err) => {
                setError(err);
                setLoading(false);
            }
        );
        return () => unsub();
    }, [path, JSON.stringify(constraints)]);

    return { data, loading, error };
}