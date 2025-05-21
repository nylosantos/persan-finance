import React from 'react';
import { TransactionEditModalProps } from '../../types';
import { TransactionForm } from './TransactionForm';

export const TransactionEditModal: React.FC<TransactionEditModalProps> = ({
    open,
    transaction,
    budgetsOfMonth,
    path,
    onClose,
    onSaved,
}) => {
    if (!open || !transaction) return null;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded p-6 shadow-lg min-w-[320px]">
                <h2 className="mb-4 text-lg font-bold">Editar Transação</h2>
                <TransactionForm
                    path={path}
                    budgetsOfMonth={budgetsOfMonth}
                    initialValues={transaction}
                    onClose={onClose}
                    onSaved={onSaved}
                />
            </div>
        </div>
    );
};