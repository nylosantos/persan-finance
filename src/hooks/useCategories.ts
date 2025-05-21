// src/hooks/useCategories.ts
import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot, QueryConstraint } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

interface Category {
    id: string;
    name: string;
    scope: 'family' | 'personal';
    ownerId?: string;
}

export function useCategories(scope: 'family' | 'personal', familyId?: string) {
    const { user } = useAuth();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        // Monta a query com constraints
        const colRef = collection(db, 'categories');
        const constraints: QueryConstraint[] = [where('scope', '==', scope)];
        if (scope === 'family' && familyId) {
            constraints.push(where('ownerId', '==', familyId));
        }
        if (scope === 'personal' && user) {
            constraints.push(where('ownerId', '==', user.uid));
        }
        const q = query(colRef, ...constraints);

        // Inscreve em tempo real
        const unsubscribe = onSnapshot(
            q,
            snapshot => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                } as Category));
                setCategories(items);
                setLoading(false);
            },
            err => {
                setError(err);
                setLoading(false);
            }
        );

        // Cleanup
        return () => unsubscribe();
    }, [scope, familyId, user]);

    return { categories, loading, error };
}
