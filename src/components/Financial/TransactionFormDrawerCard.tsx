import React, { useState } from 'react';
import { TransactionForm } from './TransactionForm';
import { TransactionFormDrawerCardProps } from '../../types';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export const TransactionFormDrawerCard: React.FC<TransactionFormDrawerCardProps> = (props) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="mb-6 bg-white dark:bg-gray-800 rounded-lg">
            <div
                className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer font-semibold text-lg transition"
                onClick={() => setOpen(o => !o)}
                aria-expanded={open}
            >
                <span>{open ? 'Fechar' : 'Adicionar Transação'}</span>
                {open ? <FiChevronUp size={22} /> : <FiChevronDown size={22} />}
            </div>
            {open && (
                <div className="mt-2">
                    <TransactionForm {...props} />
                </div>
            )}
        </div>
    );
};