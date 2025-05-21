import React, { useState, useRef, useEffect } from 'react';
import { FiMoreVertical, FiEdit, FiCheckCircle, FiTrash2, FiDownload } from 'react-icons/fi';
import { Transaction } from '../../types';

export interface TransactionOptionsProps {
    transaction: Transaction;
    onEdit: () => void;
    onPay?: () => void;
    onDelete: () => void;
    hidePay?: boolean;
}

export const TransactionOptions: React.FC<TransactionOptionsProps> = ({
    transaction,
    onEdit,
    onPay,
    onDelete,
    hidePay = false,
}) => {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [open]);

    return (
        <div className="relative" ref={ref}>
            <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setOpen((v) => !v)}
                title="Opções"
                type="button"
            >
                <FiMoreVertical />
            </button>
            {open && (
                <div className="absolute right-0 z-30 mt-2 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg">
                    {transaction.downloadUrl && (
                        <button
                            className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => {
                                setOpen(false);
                                const link = document.createElement('a');
                                link.href = transaction.downloadUrl!;
                                link.download = transaction.name || 'anexo';
                                link.target = '_blank';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                            type="button"
                        >
                            <FiDownload className="mr-2" /> Baixar
                        </button>
                    )}
                    <button
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => { setOpen(false); onEdit(); }}
                        type="button"
                    >
                        <FiEdit className="mr-2" /> Editar
                    </button>
                    {!hidePay && onPay && <button
                        className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => { setOpen(false); onPay(); }}
                        type="button"
                    >
                        <FiCheckCircle className="mr-2" /> Pagar
                    </button>}
                    <button
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => { setOpen(false); onDelete(); }}
                        type="button"
                    >
                        <FiTrash2 className="mr-2" /> Deletar
                    </button>
                </div>
            )}
        </div>
    );
};