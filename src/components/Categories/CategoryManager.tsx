import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useConfirm } from '../../hooks/useConfirm';
import { TransactionListModal } from './TransactionListModal';
import { FaTrash, FaEdit, FaList } from 'react-icons/fa';
import type { Category } from '../../types';
import { Container } from '../Layout/Container';
import { PageTitle } from '../Layout/PageTitle';
import Loading from '../Layout/Loading';

export const CategoryManager: React.FC = () => {
    const { user } = useAuth();
    const confirm = useConfirm();
    const [categories, setCategories] = useState<Category[]>([]);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    // Carrega categorias do usuário logado
    useEffect(() => {
        if (!user) return;
        setLoading(true);

        // 1. Buscar famílias onde o usuário pode editar
        (async () => {
            const familiesSnap = await getDocs(collection(db, 'families'));
            const editableFamilyIds: string[] = [];

            for (const famDoc of familiesSnap.docs) {
                const memberDoc = await getDocs(
                    query(
                        collection(db, `families/${famDoc.id}/members`),
                        where('__name__', '==', user.uid)
                    )
                );
                if (!memberDoc.empty) {
                    const memberData = memberDoc.docs[0].data();
                    if (memberData.canEdit) {
                        editableFamilyIds.push(famDoc.id);
                    }
                }
            }

            if (editableFamilyIds.length === 0) {
                setCategories([]);
                setLoading(false);
                return;
            }

            // 2. Buscar categorias dessas famílias
            const cats: Category[] = [];
            const chunkSize = 10; // Firestore limita 'in' a 10 itens
            for (let i = 0; i < editableFamilyIds.length; i += chunkSize) {
                const chunk = editableFamilyIds.slice(i, i + chunkSize);
                const catSnap = await getDocs(
                    query(collection(db, 'categories'), where('ownerId', 'in', chunk))
                );
                for (const docSnap of catSnap.docs) {
                    const cat = { id: docSnap.id, ...docSnap.data() } as Category;
                    // Busca transações na subcoleção financialData da família dona da categoria
                    const familyId = cat.ownerId;
                    const txSnap = await getDocs(
                        query(
                            collection(db, `families/${familyId}/financialData`),
                            where('categoryId', '==', cat.id)
                        )
                    );
                    cat.txCount = txSnap.size;
                    cats.push(cat);
                }
            }
            setCategories(cats);
            setLoading(false);
        })();
    }, [user]);

    // Editar nome
    const handleEdit = (cat: Category) => {
        setEditingId(cat.id);
        setEditingName(cat.name);
    };

    const handleEditSave = async (cat: Category) => {
        await updateDoc(doc(db, 'categories', cat.id), { name: editingName });
        setCategories(categories.map(c => c.id === cat.id ? { ...c, name: editingName } : c));
        setEditingId(null);
        setEditingName('');
    };

    // Excluir categoria
    const handleDelete = async (cat: Category) => {
        if (cat.txCount && cat.txCount > 0) {
            await confirm({
                title: 'Não é possível excluir',
                text: 'Existem transações atreladas a esta categoria.',
                confirmButtonText: 'Ok',
                showCancelButton: false,
                onConfirm: async () => Promise.resolve(),
            });
            return;
        }
        await confirm({
            title: 'Excluir categoria?',
            text: `Deseja excluir a categoria "${cat.name}"?`,
            confirmButtonText: 'Excluir',
            cancelButtonText: 'Cancelar',
            onConfirm: async () => {
                await deleteDoc(doc(db, 'categories', cat.id));
                setCategories(categories.filter(c => c.id !== cat.id));
            }
        });
    };

    return (
        <Container>
            {/* <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 max-w-2xl mx-auto"> */}
            <PageTitle>Minhas Categorias</PageTitle>
            {/* <h2 className="text-xl font-bold mb-4">Minhas Categorias</h2> */}
            {loading ? (
                <Loading />
            ) : (
                <ul className="divide-y divide-gray-200 dark:divide-gray-700 mt-10">
                    {categories.map(cat => (
                        <li key={cat.id} className="flex items-center justify-between py-2">
                            <div className="flex w-full items-center">
                                {editingId === cat.id ? (
                                    <input
                                        value={editingName}
                                        onChange={e => setEditingName(e.target.value)}
                                        className="p-1 rounded border"
                                    />
                                ) : (
                                    <span className="font-semibold">{cat.name}</span>
                                )}
                                <span className="ml-2 text-xs text-gray-500">({cat.txCount ?? 0} transações)</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    className="p-1 text-blue-600 hover:text-blue-800"
                                    onClick={() => setSelectedCategory(cat)}
                                    title="Ver transações"
                                >
                                    <FaList />
                                </button>
                                {editingId === cat.id ? (
                                    <button
                                        className="p-1 text-green-600 hover:text-green-800"
                                        onClick={() => handleEditSave(cat)}
                                        title="Salvar"
                                    >
                                        <FaEdit />
                                    </button>
                                ) : (
                                    <button
                                        className="p-1 text-yellow-600 hover:text-yellow-800"
                                        onClick={() => handleEdit(cat)}
                                        title="Editar"
                                    >
                                        <FaEdit />
                                    </button>
                                )}
                                <button
                                    className={`p-1 ${cat.txCount && cat.txCount > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-red-600 hover:text-red-800'}`}
                                    onClick={() => handleDelete(cat)}
                                    disabled={!!cat.txCount && cat.txCount > 0}
                                    title={cat.txCount && cat.txCount > 0 ? 'Não pode excluir com transações' : 'Excluir'}
                                >
                                    <FaTrash />
                                </button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
            {/* Modal de transações */}
            {selectedCategory && (
                <TransactionListModal
                    category={selectedCategory}
                    onClose={() => setSelectedCategory(null)}
                />
            )}
            {/* </div> */}
        </Container>
    );
};