// src/components/Layout/Navbar.tsx

import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogoutButton } from '../LogoutButton';

export const Navbar: React.FC = () => {
    const baseClasses = 'flex items-center justify-center px-3 py-2 rounded text-inherit';
    const activeClasses = 'bg-gray-300 dark:bg-gray-900 font-bold text-gray-900 dark:text-gray-100';
    const inactiveClasses = 'text-gray-800 dark:text-gray-100 hover:bg-gray-300/50 dark:hover:bg-gray-900/50 transition duration-200';

    return (
        <nav className="flex space-x-4">
            <NavLink
                to="/"
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <p className="flex items-center gap-2">
                    <span>🏠</span>
                    Home
                </p>
            </NavLink>

            <NavLink
                to="/monthlyView"
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <p className="flex items-center gap-2">
                    <span>💰</span>
                    Monthly
                </p>
            </NavLink>

            <NavLink
                to="/dashboard"
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <p className="flex items-center gap-2">
                    <span>📊</span>
                    Dashboard
                </p>
            </NavLink>

            <NavLink
                to="/documents/personal"
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <p className="flex items-center gap-2">
                    <span>📁</span>
                    Documentos
                </p>
            </NavLink>

            <NavLink
                to="/documents/invoices"
                className={({ isActive }) => `${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}
            >
                <p className="flex items-center gap-2">
                    <span>🧾</span>
                    Notas Fiscais
                </p>
            </NavLink>

            <LogoutButton />
        </nav>
    );
};
