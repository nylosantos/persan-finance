// import React, { useEffect, useState } from 'react';
// import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
// import { db } from '../../services/firebase';
// import { useConfirm } from '../../hooks/useConfirm';
// import { FaTrash } from 'react-icons/fa';
// import { MonthYearPicker } from '../Layout/MonthYearPicker';
// import { Category, Transaction } from '../../types';

// interface Props {
//     category: Category;
//     onClose: () => void;
// }

// export const TransactionListModal: React.FC<Props> = ({ category, onClose }) => {
//     const confirm = useConfirm();
//     const [transactions, setTransactions] = useState<Transaction[]>([]);
//     const [month, setMonth] = useState<number>(new Date().getMonth());
//     const [year, setYear] = useState<number>(new Date().getFullYear());
//     const [loading, setLoading] = useState(true);

//     // useEffect(() => {
//     //     setLoading(true);
//     //     (async () => {
//     //         const q = query(collection(db, 'transactions'), where('categoryId', '==', category.id));
//     //         const snap = await getDocs(q);
//     //         const txs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
//     //         // Filtro por mês/ano
//     //         const filtered = txs.filter(tx => {
//     //             const d = tx.date instanceof Date
//     //                 ? tx.date
//     //                 : tx.date && 'seconds' in tx.date
//     //                     ? new Date(tx.date.seconds * 1000)
//     //                     : new Date(tx.date);
//     //             return d.getMonth() === month && d.getFullYear() === year;
//     //         });
//     //         setTransactions(filtered);
//     //         setLoading(false);
//     //     })();
//     // }, [category, month, year]);

//     useEffect(() => {
//         setLoading(true);
//         (async () => {
//             // Busca as transações na subcoleção financialData da família dona da categoria
//             const q = query(
//                 collection(db, `families/${category.ownerId}/financialData`),
//                 where('categoryId', '==', category.id)
//             );
//             const snap = await getDocs(q);
//             const txs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
//             // Filtro por mês/ano
//             const filtered = txs.filter(tx => {
//                 const d = tx.date instanceof Date
//                     ? tx.date
//                     : tx.date && 'seconds' in tx.date
//                         ? new Date(tx.date.seconds * 1000)
//                         : new Date(tx.date);
//                 return d.getMonth() === month && d.getFullYear() === year;
//             });
//             setTransactions(filtered);
//             setLoading(false);
//         })();
//     }, [category, month, year]);

//     const handleDelete = async (tx: Transaction) => {
//         await confirm({
//             title: 'Excluir transação?',
//             text: `Deseja excluir "${tx.name}"?`,
//             confirmButtonText: 'Excluir',
//             cancelButtonText: 'Cancelar',
//             onConfirm: async () => {
//                 await deleteDoc(doc(db, 'transactions', tx.id));
//                 setTransactions(transactions.filter(t => t.id !== tx.id));
//             }
//         });
//     };

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
//             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
//                 <button className="absolute top-2 right-2 text-lg" onClick={onClose}>×</button>
//                 <h3 className="text-lg font-bold mb-2">Transações da categoria: {category.name}</h3>
//                 <div className="mb-4">
//                     <MonthYearPicker
//                         month={month}
//                         year={year}
//                         onChange={(m, y) => {
//                             setMonth(m);
//                             setYear(y);
//                         }}
//                         className="justify-start"
//                     />
//                 </div>
//                 {loading ? (
//                     <div>Carregando...</div>
//                 ) : transactions.length === 0 ? (
//                     <div className="text-gray-500">Nenhuma transação neste mês.</div>
//                 ) : (
//                     <ul className="divide-y divide-gray-200 dark:divide-gray-700">
//                         {transactions.map(tx => (
//                             <li key={tx.id} className="flex items-center justify-between py-2">
//                                 <div className='flex items-center justify-between w-full mr-3'>
//                                     <div>
//                                         <span className={`font-semibold ${tx.paid ? 'text-green-600' : ''}`}>
//                                             {tx.name}
//                                         </span>
//                                         <span className="ml-2 text-xs text-gray-500">
//                                             {tx.date && (tx.date instanceof Date
//                                                 ? tx.date.toLocaleDateString()
//                                                 : tx.date && 'seconds' in tx.date
//                                                     ? new Date(tx.date.seconds * 1000).toLocaleDateString()
//                                                     : '')}
//                                         </span>
//                                         {tx.paid && (
//                                             <span className="ml-2 text-xs text-green-600 font-bold">(Pago)</span>
//                                         )}
//                                     </div>
//                                     <span className="font-semibold">{`€${tx.amount.toFixed(2)}`}</span>
//                                 </div>
//                                 <button
//                                     className={`p-1 ${tx.paid ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
//                                     onClick={() => handleDelete(tx)}
//                                     title={tx.paid ? "Não é possível excluir transação já paga" : "Excluir"}
//                                     disabled={tx.paid}
//                                 >
//                                     <FaTrash />
//                                 </button>
//                             </li>
//                         ))}
//                     </ul>
//                 )}
//             </div>
//         </div>
//     );
// };
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useConfirm } from '../../hooks/useConfirm';
import { MonthYearPicker } from '../Layout/MonthYearPicker';
import { Category, Transaction } from '../../types';
import { TransactionOptions } from '../Financial/TransactionOptions';
import { TransactionEditModal } from '../Financial/TransactionEditModal';
import { useBudgetsOfMonth } from '../../hooks/useBudgetsOfMonth';
import Loading from '../Layout/Loading';

interface Props {
    category: Category;
    onClose: () => void;
}

export const TransactionListModal: React.FC<Props> = ({ category, onClose }) => {
    const confirm = useConfirm();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [month, setMonth] = useState<number>(new Date().getMonth());
    const [year, setYear] = useState<number>(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const { budgets } = useBudgetsOfMonth(`families/${category.ownerId}/financialData`, year, month);

    useEffect(() => {
        setLoading(true);
        (async () => {
            const q = query(
                collection(db, `families/${category.ownerId}/financialData`),
                where('categoryId', '==', category.id)
            );
            const snap = await getDocs(q);
            let txs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
            // Filtro por mês/ano
            txs = txs.filter(tx => {
                const d = tx.date instanceof Date
                    ? tx.date
                    : tx.date && 'seconds' in tx.date
                        ? new Date(tx.date.seconds * 1000)
                        : new Date(tx.date);
                return d.getMonth() === month && d.getFullYear() === year;
            });
            // Ordena por data decrescente
            txs.sort((a, b) => {
                const da = a.date instanceof Date
                    ? a.date
                    : a.date && 'seconds' in a.date
                        ? new Date(a.date.seconds * 1000)
                        : new Date(a.date);
                const db_ = b.date instanceof Date
                    ? b.date
                    : b.date && 'seconds' in b.date
                        ? new Date(b.date.seconds * 1000)
                        : new Date(b.date);
                return db_.getTime() - da.getTime();
            });
            setTransactions(txs);
            setLoading(false);
        })();
    }, [category, month, year]);

    const handleDelete = async (tx: Transaction) => {
        await confirm({
            title: 'Excluir transação?',
            text: `Deseja excluir "${tx.name}"?`,
            confirmButtonText: 'Excluir',
            cancelButtonText: 'Cancelar',
            onConfirm: async () => {
                await deleteDoc(doc(db, `families/${category.ownerId}/financialData`, tx.id));
                setTransactions(transactions.filter(t => t.id !== tx.id));
            }
        });
    };

    const handleEdit = (tx: Transaction) => {
        setEditingTx(tx);
    };

    const handleEditModalClose = (updated?: boolean) => {
        setEditingTx(null);
        if (updated) {
            // Recarrega as transações após edição
            setLoading(true);
            (async () => {
                const q = query(
                    collection(db, `families/${category.ownerId}/financialData`),
                    where('categoryId', '==', category.id)
                );
                const snap = await getDocs(q);
                let txs = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Transaction[];
                txs = txs.filter(tx => {
                    const d = tx.date instanceof Date
                        ? tx.date
                        : tx.date && 'seconds' in tx.date
                            ? new Date(tx.date.seconds * 1000)
                            : new Date(tx.date);
                    return d.getMonth() === month && d.getFullYear() === year;
                });
                txs.sort((a, b) => {
                    const da = a.date instanceof Date
                        ? a.date
                        : a.date && 'seconds' in a.date
                            ? new Date(a.date.seconds * 1000)
                            : new Date(a.date);
                    const db_ = b.date instanceof Date
                        ? b.date
                        : b.date && 'seconds' in b.date
                            ? new Date(b.date.seconds * 1000)
                            : new Date(b.date);
                    return db_.getTime() - da.getTime();
                });
                setTransactions(txs);
                setLoading(false);
            })();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-lg relative">
                <button className="absolute top-2 right-2 text-lg" onClick={onClose}>×</button>
                <h3 className="text-lg font-bold mb-2">Transações da categoria: {category.name}</h3>
                <div className="mb-4">
                    <MonthYearPicker
                        month={month}
                        year={year}
                        onChange={(m, y) => {
                            setMonth(m);
                            setYear(y);
                        }}
                        className="justify-start"
                    />
                </div>
                {loading ? (
                    <Loading />
                ) : transactions.length === 0 ? (
                    <div className="text-gray-500">Nenhuma transação neste mês.</div>
                ) : (
                    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                        {transactions.map(tx => (
                            <li key={tx.id} className="flex items-center justify-between py-2">
                                <div className='flex items-center justify-between w-full mr-3'>
                                    <div>
                                        <span className={`font-semibold ${tx.paid ? 'text-green-600' : ''}`}>
                                            {tx.name}
                                        </span>
                                        <span className="ml-2 text-xs text-gray-500">
                                            {tx.date && (tx.date instanceof Date
                                                ? tx.date.toLocaleDateString()
                                                : tx.date && 'seconds' in tx.date
                                                    ? new Date(tx.date.seconds * 1000).toLocaleDateString()
                                                    : '')}
                                        </span>
                                        {tx.paid && (
                                            <span className="ml-2 text-xs text-green-600 font-bold">(Pago)</span>
                                        )}
                                    </div>
                                    <span className="font-semibold">{`€${tx.amount.toFixed(2)}`}</span>
                                </div>
                                <TransactionOptions
                                    transaction={tx}
                                    onEdit={() => handleEdit(tx)}
                                    onDelete={() => handleDelete(tx)}
                                    disableDelete={tx.paid}
                                />
                            </li>
                        ))}
                    </ul>
                )}
                {editingTx && (
                    <TransactionEditModal
                        transaction={editingTx}
                        onClose={handleEditModalClose}
                        budgetsOfMonth={budgets}
                        path={`families/${category.ownerId}/financialData`}
                        open={!!editingTx}
                        onSaved={() => setEditingTx(null)}
                    />
                )}
            </div>
        </div>
    );
};