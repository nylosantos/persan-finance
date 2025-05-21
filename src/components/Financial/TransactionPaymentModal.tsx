import React, { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { TransactionPaymentModalProps } from '../../types';

export const TransactionPaymentModal: React.FC<TransactionPaymentModalProps> = ({
    open,
    transaction,
    onClose,
    onConfirm,
}) => {
    if (!open || !transaction) return null;

    // Estado local para data e valor
    const [paidAt, setPaidAt] = useState<Timestamp>(
        transaction.paid && transaction.paidAt
            ? transaction.paidAt
            : Timestamp.fromDate(new Date())
    );
    const [amount, setAmount] = useState<number>(transaction.amount);
    const [currency, setCurrency] = useState<'EUR' | 'BRL'>(transaction.currency);

    const isPaid = !!transaction.paid;

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded p-6 shadow-lg min-w-[320px]">
                <h2 className="mb-4 text-lg font-bold">
                    {isPaid ? 'Cancelar Pagamento' : 'Confirmar Pagamento'}
                </h2>
                <p>
                    {isPaid
                        ? <>Deseja <b>cancelar</b> o pagamento de <b>{transaction.name}</b>?</>
                        : <>Deseja marcar <b>{transaction.name}</b> como pago?</>
                    }
                </p>
                <label className="block mt-4 mb-2">
                    {isPaid ? 'Data original da transação:' : 'Data do pagamento:'}
                </label>
                <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={
                        (isPaid
                            ? (transaction.createdAt
                                ? new Date(transaction.createdAt.toDate()).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0])
                            : (paidAt
                                ? new Date(paidAt.toDate()).toISOString().split('T')[0]
                                : new Date().toISOString().split('T')[0])
                        )
                    }
                    onChange={e => {
                        const ts = Timestamp.fromDate(new Date(e.target.value));
                        if (isPaid) {
                            // Ao cancelar, muda a data original
                            // (opcional: pode deixar desabilitado se não quiser permitir edição)
                        } else {
                            setPaidAt(ts);
                        }
                    }}
                    className="border rounded px-2 py-1"
                    disabled={isPaid} // Só permite editar data ao pagar, não ao cancelar
                />
                <label className="block mt-4 mb-2">Valor do pagamento:</label>
                <div className='flex items-center gap-2'>
                    <select
                        value={currency}
                        onChange={e => setCurrency(e.target.value as 'EUR' | 'BRL')}
                        className="p-2 rounded dark:bg-gray-800"
                        disabled={isPaid}
                    >
                        <option value="EUR">€</option>
                        <option value="BRL">R$</option>
                    </select>
                    <input
                        type="number"
                        step="0.01"
                        placeholder="Amount"
                        value={amount}
                        onChange={e => setAmount(parseFloat(e.target.value))}
                        className="p-2 rounded"
                        required
                        disabled={isPaid}
                    />
                </div>
                <div className="flex gap-2 mt-6">
                    <button
                        className="bg-primary text-white px-4 py-2 rounded"
                        onClick={async () => {
                            if (isPaid) {
                                // Cancelar pagamento: volta data para createdAt, paid: false
                                await onConfirm({
                                    paid: false,
                                    date: transaction.createdAt || transaction.date,
                                    amount: transaction.amount,
                                    currency: transaction.currency,
                                });
                            } else {
                                // Confirmar pagamento: paid: true, date = paidAt, createdAt = date original
                                await onConfirm({
                                    paid: true,
                                    date: paidAt,
                                    createdAt: transaction.date,
                                    amount,
                                    currency,
                                });
                            }
                            onClose();
                        }}
                    >
                        {isPaid ? 'Cancelar Pagamento' : 'Confirmar'}
                    </button>
                    <button className="px-4 py-2 rounded" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};