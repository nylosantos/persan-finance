import React, { useState, useEffect } from 'react';
import { AiOutlineMenu } from 'react-icons/ai';
import { useAuth } from '../../contexts/AuthContext';
import { useExchangeRate } from '../../hooks/useExchangeRate';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { MenuDrawer } from './MenuDrawer';

const pages = [
    { to: '/', label: 'Home', icon: <span>🏠</span> },
    { to: '/monthlyView', label: 'Registro Mensal', icon: <span>💰</span> },
    { to: '/dashboard', label: 'Gráficos', icon: <span>📊</span> },
    { to: '/documents/personal', label: 'Documentos', icon: <span>📁</span> },
    { to: '/documents/invoices', label: 'Notas Fiscais', icon: <span>🧾</span> },
];

export const MenuButtonWithDrawer: React.FC = () => {
    const [open, setOpen] = useState(false);
    const { user } = useAuth();
    const [userName, setUserName] = useState<string | undefined>();
    const now = new Date();
    const todayKey = now.toISOString().split('T')[0];
    const { rate } = useExchangeRate(todayKey);

    // Busca nome do usuário no Firestore
    useEffect(() => {
        if (user?.uid) {
            getDoc(doc(db, 'users', user.uid)).then(snap => {
                setUserName(snap.data()?.name ?? undefined);
            });
        }
    }, [user]);

    return (
        <>
            <button
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setOpen(true)}
                title="Abrir menu"
            >
                <AiOutlineMenu size={22} />
            </button>
            <MenuDrawer
                open={open}
                onClose={() => setOpen(false)}
                pages={pages}
                userName={userName}
                euroRate={rate}
            />
        </>
    );
};