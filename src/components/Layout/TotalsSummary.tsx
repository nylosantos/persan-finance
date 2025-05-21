import React from 'react';
import { TotalsSummaryProps } from '../../types';

export const TotalsSummary: React.FC<TotalsSummaryProps> = ({
    totalIncome,
    totalExpense,
    balance,
    totalPaid,
    totalToPay,
    viewCurrency,
    onToggleCurrency,
    fmt,
}) => (
    <div className="mt-6 py-4 px-2 bg-gray-200 dark:bg-gray-800 rounded">
        {/* Desktop (md+) */}
        <div className="hidden md:flex justify-between items-center">
            <p>Entrada: {fmt(totalIncome, viewCurrency)}</p>
            <p>Saída: {fmt(totalExpense, viewCurrency)}</p>
            <p>Saldo: {fmt(balance, viewCurrency)}</p>
            <p className="text-green-700 dark:text-green-400 font-bold">
                Total pago: {fmt(totalPaid, viewCurrency)}
            </p>
            <p className="text-red-700 dark:text-red-500 font-bold">
                Total a pagar: {fmt(totalToPay, viewCurrency)}
            </p>
            <button
                onClick={onToggleCurrency}
                className="px-3 py-1 bg-primary text-white rounded"
            >
                Ver em {viewCurrency === 'EUR' ? 'R$' : '€'}
            </button>
        </div>
        {/* Mobile (abaixo de md) */}
        <div className="flex flex-col md:hidden gap-2">
            <div className="flex justify-between">
                <p>Entrada: {fmt(totalIncome, viewCurrency)}</p>
                <p>Saída: {fmt(totalExpense, viewCurrency)}</p>
                <p>Saldo: {fmt(balance, viewCurrency)}</p>
            </div>
            <div className="flex flex-col gap-2 mt-2">
                <div className="flex justify-between">
                    <p className="text-green-700 dark:text-green-400 font-bold">
                        Total pago: {fmt(totalPaid, viewCurrency)}
                    </p>
                    <p className="text-red-700 dark:text-red-500 font-bold">
                        Total a pagar: {fmt(totalToPay, viewCurrency)}
                    </p>
                </div>
                <button
                    onClick={onToggleCurrency}
                    className="w-full px-3 py-1 bg-primary text-white rounded"
                >
                    Ver em {viewCurrency === 'EUR' ? 'R$' : '€'}
                </button>
            </div>
        </div>
    </div>
);