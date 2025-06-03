/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';

import { doc, getDoc } from 'firebase/firestore';

import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { useFamily } from '../contexts/FamilyContext';
import { setFavouriteFamily } from '../services/user';
import { FamilySelectorDrawer } from './Layout/FamilySelectorDrawer';
import { createFamily, joinFamily, listUserFamilies } from '../services/family';

export const FamilySelector: React.FC = () => {
    const { familyId, setFamilyId } = useFamily();
    const { user } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [families, setFamilies] = useState<{ id: string; name: string }[]>([]);
    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [favouriteFamilyId, setFavouriteFamilyId] = useState<string | null>(null);

    // Carrega famílias do usuário
    useEffect(() => {
        if (user) {
            setLoading(true);
            listUserFamilies(user.uid)
                .then(fams => {
                    setFamilies(fams);
                    getDoc(doc(db, 'users', user.uid)).then(snap => {
                        const favId = snap.data()?.favouriteFamilyId;
                        setFavouriteFamilyId(favId ?? null);
                        if (favId) setFamilyId(favId);
                        setLoading(false);
                    });
                })
                .catch(err => {
                    setError(err.message + ' - ' + err.code);
                    setLoading(false);
                });
        }
    }, [user, setFamilyId]);

    const handleSelect = (id: string) => {
        setFamilyId(id);
        setError(null);
        setDrawerOpen(false);
    };

    const handleCreate = async (name: string) => {
        if (!name.trim() || !user) return;
        try {
            setLoading(true);
            const newId = await createFamily(name.trim(), user.uid);
            setFamilyId(newId);
            setFamilies(prev => [...prev, { id: newId, name: name.trim() }]);
            setMode('select');
            if (families.length === 0) {
                await setFavouriteFamily(user.uid, newId);
                setFavouriteFamilyId(newId);
            }
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleJoin = async (id: string) => {
        if (!id.trim() || !user) return;
        try {
            setLoading(true);
            await joinFamily(id.trim(), user.uid, false);
            setFamilyId(id.trim());
            setFamilies(prev => [...prev, { id: id.trim(), name: id.trim() }]);
            setMode('select');
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSetFavourite = async (familyId: string) => {
        if (!user) return;
        await setFavouriteFamily(user.uid, familyId);
        setFavouriteFamilyId(familyId);
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
    };

    // Botão/ícone para abrir o drawer
    return (
        <>
            <button
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setDrawerOpen(true)}
                title="Selecionar família"
            >
                <span role="img" aria-label="Família">👨‍👩‍👧‍👦</span>
                {families.find(f => f.id === familyId)?.name || 'Família'}
            </button>
            <FamilySelectorDrawer
                open={drawerOpen}
                families={families}
                selectedFamilyId={familyId}
                favouriteFamilyId={favouriteFamilyId}
                mode={mode}
                loading={loading}
                error={error}
                onClose={() => setDrawerOpen(false)}
                onSelectFamily={handleSelect}
                onSetFavourite={handleSetFavourite}
                onCopyId={handleCopyId}
                onChangeMode={setMode}
                onCreateFamily={handleCreate}
                onJoinFamily={handleJoin}
            />
        </>
    );
};