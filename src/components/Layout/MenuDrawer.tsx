import React, { useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { AiOutlineClose } from 'react-icons/ai';

import ThemeSelector from './ThemeSelector';
import { useAuth } from '../../contexts/AuthContext';

interface MenuDrawerProps {
    open: boolean;
    onClose: () => void;
    pages: { to: string; label: string; icon: React.ReactNode, isLogout?: boolean }[];
    userName?: string;
    euroRate?: number | null;
}

export const MenuDrawer: React.FC<MenuDrawerProps> = ({
    open,
    onClose,
    pages,
    userName,
    euroRate,
}) => {
    // Bloqueia o scroll do body quando o drawer está aberto
    useEffect(() => {
        if (open) {
            document.body.classList.add('drawer-open');
        } else {
            document.body.classList.remove('drawer-open');
        }
        return () => {
            document.body.classList.remove('drawer-open');
        };
    }, [open]);

    const { logout } = useAuth();

    // Adicione este item à sua lista de pages:
    const logoutItem = {
        to: '#logout',
        label: 'Logout',
        icon: <span role="img" aria-label="Logout">⏻</span>,
        isLogout: true,
    };

    // Inclua logoutItem no array pages (no final, por exemplo)
    const allPages = [...pages, logoutItem];

    return (
        <div
            className={`
                fixed inset-0 h-screen z-50 overflow-hidden
                ${open ? '' : 'pointer-events-none'}
            `}
            aria-modal="true"
            role="dialog"
        >
            {/* Overlay */}
            <div
                className={`fixed inset-0 bg-black/40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
                onClick={onClose}
            />
            {/* Drawer */}
            <aside
                className={`
                relative ml-0 h-full bg-gray-100 dark:bg-gray-900 shadow-lg
                transition-transform duration-300
                flex flex-col w-full md:max-w-[320px]
                ${open ? 'translate-x-0' : '-translate-x-full'}
                pt-safe pb-safe
                `}
                // style={{ minWidth: 'min(100vw, 320px)' }}
            >
                {/* Topo */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <span className="font-bold text-lg text-gray-900 dark:text-gray-100">Menu</span>
                    </div>
                    <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <AiOutlineClose size={20} />
                    </button>
                </div>
                {/* Saudação e cotação */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    {userName && (
                        <div className="mb-2 text-gray-800 dark:text-gray-100 font-medium">
                            Oi, {userName}!
                        </div>
                    )}
                    {euroRate && (
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                            Cotação do Euro hoje: € 1 = R$ {euroRate.toFixed(2)}
                        </div>
                    )}
                </div>
                {/* Navegação */}
                <nav className="flex-1 flex flex-col gap-1 p-4">
                    {allPages.map(page =>
                        page.isLogout ? (
                            <div
                                key="logout"
                                onClick={() => {
                                    logout();
                                    onClose();
                                }}
                                className="flex items-center gap-2 px-4 py-2 rounded transition text-red-600 hover:bg-red-100 dark:hover:bg-gray-800 font-bold"
                            >
                                {page.icon}
                                {page.label}
                            </div>
                        ) : (
                            <NavLink
                                key={page.to}
                                to={page.to}
                                className={({ isActive }) =>
                                    `flex items-center gap-2 px-3 py-2 rounded transition
                                ${isActive
                                        ? 'bg-gray-300 dark:bg-gray-800 font-bold text-gray-900 dark:text-gray-100'
                                        : 'text-gray-800 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-800'}`
                                }
                                onClick={onClose}
                            >
                                {page.icon}
                                {page.label}
                            </NavLink>
                        )
                    )}
                </nav>
                {/* ThemeSelector no rodapé */}
                <div className="flex z-[9999] p-4 border-t border-gray-200 dark:border-gray-700 pb-10">
                    <ThemeSelector />
                </div>
            </aside>
        </div>
    );
};