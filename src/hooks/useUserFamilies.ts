import { useEffect, useState } from 'react';

import { collection, getDocs } from 'firebase/firestore';

import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';

export function useUserFamilies() {
    const { user } = useAuth();
    const [familyIds, setFamilyIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setFamilyIds([]);
            setLoading(false);
            return;
        }
        setLoading(true);

        // Busca todas as famílias e verifica se o usuário está na subcoleção members
        getDocs(collection(db, 'families')).then(async (snapshot) => {
            const checks = await Promise.all(
                snapshot.docs.map(async (familyDoc) => {
                    const memberDoc = await getDocs(collection(db, `families/${familyDoc.id}/members`));
                    // Verifica se existe um documento com o id igual ao uid do usuário
                    const isMember = memberDoc.docs.some(doc => doc.id === user.uid);
                    return isMember ? familyDoc.id : null;
                })
            );
            setFamilyIds(checks.filter(Boolean) as string[]);
            setLoading(false);
        });
    }, [user]);

    return { familyIds, loading };
}