// // src/components/FamilySelector.tsx
// // Componente para listar, criar e entrar em famílias familiares

// import React, { useEffect, useState } from 'react';
// import { useFamily } from '../contexts/FamilyContext';
// import { useAuth } from '../contexts/AuthContext';
// import { createFamily, listUserFamilies, joinFamily } from '../services/family';
// import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
// import { setFavouriteFamily } from '../services/user';
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '../services/firebase';

// export const FamilySelector: React.FC = () => {
//     const { familyId, setFamilyId } = useFamily();
//     const { user } = useAuth();
//     const [input, setInput] = useState('');
//     const [families, setFamilies] = useState<{ id: string; name: string }[]>([]);
//     const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
//     const [error, setError] = useState<string | null>(null);

//     // Carrega famílias do usuário
//     useEffect(() => {
//         if (user) {
//             listUserFamilies(user.uid)
//                 .then(fams => {
//                     setFamilies(fams);
//                     // Busca a favorita e seta automaticamente
//                     getDoc(doc(db, 'users', user.uid)).then(snap => {
//                         const favId = snap.data()?.favouriteFamilyId;
//                         if (favId) setFamilyId(favId);
//                     });
//                 })
//                 .catch(err => setError(err.message + ' - ' + err.code));
//         }
//     }, [user, setFamilyId]);

//     const handleSelect = (id: string) => {
//         setFamilyId(id);
//         setError(null);
//     };

//     const handleCreate = async () => {
//         if (!input.trim() || !user) return;
//         try {
//             const newId = await createFamily(input.trim(), user.uid);
//             setFamilyId(newId);
//             setInput('');
//             setMode('select');
//             setFamilies(prev => [...prev, { id: newId, name: input.trim() }]);
//             if (families.length === 0) {
//                 await setFavouriteFamily(user.uid, newId);
//             }
//         } catch (err: any) {
//             setError(err.message);
//         }
//     };

//     const handleJoin = async () => {
//         if (!input.trim() || !user) return;
//         try {
//             await joinFamily(input.trim(), user.uid, false);
//             setFamilyId(input.trim());
//             setMode('select');
//             setFamilies(prev => [...prev, { id: input.trim(), name: input.trim() }]);
//             setInput('');
//         } catch (err: any) {
//             setError(err.message);
//         }
//     };

//     const [favouriteFamilyId, setFavouriteFamilyId] = useState<string | null>(null);

//     // Carrega a família favorita do usuário
//     useEffect(() => {
//         if (user) {
//             getDoc(doc(db, 'users', user.uid)).then(snap => {
//                 setFavouriteFamilyId(snap.data()?.favouriteFamilyId ?? null);
//             });
//         }
//     }, [user]);

//     // Função para definir favorita
//     const handleSetFavourite = async (familyId: string) => {
//         if (!user) return;
//         await setFavouriteFamily(user.uid, familyId);
//         setFavouriteFamilyId(familyId);
//     };

//     return (
//         <div className="p-2 bg-white dark:bg-gray-800 rounded mb-4">
//             <div className="flex space-x-2 mb-2">
//                 <button onClick={() => setMode('select')} className="px-2 py-1 text-white rounded">My Families</button>
//                 <button onClick={() => setMode('create')} className="px-2 py-1 text-white rounded">Create</button>
//                 <button onClick={() => setMode('join')} className="px-2 py-1 text-white rounded">Join</button>
//             </div>

//             {mode === 'select' && (
//                 <div className="flex items-center space-x-2">
//                     <label className="text-gray-700 dark:text-gray-200">Select Family:</label>
//                     <select
//                         value={familyId}
//                         onChange={e => handleSelect(e.target.value)}
//                         className="p-1 rounded dark:bg-gray-700"
//                     >
//                         <option value="">-- choose --</option>
//                         {families.map(f => (
//                             <option key={f.id} value={f.id}>
//                                 {f.name} ({f.id})
//                             </option>
//                         ))}
//                     </select>
//                     {/* Botão de favorita ao lado do select */}
//                     {familyId && (
//                         favouriteFamilyId === familyId ? (
//                             <button
//                                 type="button"
//                                 className="flex items-center ml-2 cursor-default"
//                                 disabled
//                                 title="Família favorita"
//                             >
//                                 <AiFillStar className="text-yellow-400 mr-1" />
//                                 <span className="text-xs text-yellow-600">Favorita</span>
//                             </button>
//                         ) : (
//                             <button
//                                 type="button"
//                                 className="flex items-center ml-2"
//                                 onClick={() => handleSetFavourite(familyId)}
//                                 title="Definir como favorita"
//                             >
//                                 <AiOutlineStar className="text-yellow-400 mr-1" />
//                                 <span className="text-xs">Definir favorita</span>
//                             </button>
//                         )
//                     )}
//                 </div>
//             )}

//             {mode === 'create' && (
//                 <div className="flex items-center space-x-2">
//                     <input
//                         type="text"
//                         value={input}
//                         onChange={e => setInput(e.target.value)}
//                         placeholder="New family name"
//                         className="p-1 rounded dark:bg-gray-700 flex-1"
//                     />
//                     <button onClick={handleCreate} className="px-3 py-1 bg-primary text-white rounded">Create</button>
//                 </div>
//             )}

//             {mode === 'join' && (
//                 <div className="flex items-center space-x-2">
//                     <input
//                         type="text"
//                         value={input}
//                         onChange={e => setInput(e.target.value)}
//                         placeholder="Family code"
//                         className="p-1 rounded dark:bg-gray-700 flex-1"
//                     />
//                     <button onClick={handleJoin} className="px-3 py-1 bg-primary text-white rounded">Join</button>
//                 </div>
//             )}

//             {error && <p className="text-red-500 mt-2">{error}</p>}
//         </div>
//     );
// };
import React, { useEffect, useState } from 'react';
import { useFamily } from '../contexts/FamilyContext';
import { useAuth } from '../contexts/AuthContext';
import { createFamily, listUserFamilies, joinFamily } from '../services/family';
import { setFavouriteFamily } from '../services/user';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FamilySelectorDrawer } from './Layout/FamilySelectorDrawer';

export const FamilySelector: React.FC = () => {
    const { familyId, setFamilyId } = useFamily();
    const { user } = useAuth();
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [families, setFamilies] = useState<{ id: string; name: string }[]>([]);
    const [mode, setMode] = useState<'select' | 'create' | 'join'>('select');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [favouriteFamilyId, setFavouriteFamilyId] = useState<string | null>(null);

    // Carrega famílias do usuário
    useEffect(() => {
        if (user) {
            setLoading(true);
            listUserFamilies(user.uid)
                .then(fams => {
                    setFamilies(fams);
                    getDoc(doc(db, 'users', user.uid)).then(snap => {
                        const favId = snap.data()?.favouriteFamilyId;
                        setFavouriteFamilyId(favId ?? null);
                        if (favId) setFamilyId(favId);
                        setLoading(false);
                    });
                })
                .catch(err => {
                    setError(err.message + ' - ' + err.code);
                    setLoading(false);
                });
        }
    }, [user, setFamilyId]);

    const handleSelect = (id: string) => {
        setFamilyId(id);
        setError(null);
        setDrawerOpen(false);
    };

    const handleCreate = async (name: string) => {
        if (!name.trim() || !user) return;
        try {
            setLoading(true);
            const newId = await createFamily(name.trim(), user.uid);
            setFamilyId(newId);
            setFamilies(prev => [...prev, { id: newId, name: name.trim() }]);
            setMode('select');
            if (families.length === 0) {
                await setFavouriteFamily(user.uid, newId);
                setFavouriteFamilyId(newId);
            }
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleJoin = async (id: string) => {
        if (!id.trim() || !user) return;
        try {
            setLoading(true);
            await joinFamily(id.trim(), user.uid, false);
            setFamilyId(id.trim());
            setFamilies(prev => [...prev, { id: id.trim(), name: id.trim() }]);
            setMode('select');
            setLoading(false);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleSetFavourite = async (familyId: string) => {
        if (!user) return;
        await setFavouriteFamily(user.uid, familyId);
        setFavouriteFamilyId(familyId);
    };

    const handleCopyId = (id: string) => {
        navigator.clipboard.writeText(id);
    };

    // Botão/ícone para abrir o drawer
    return (
        <>
            <button
                className="flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => setDrawerOpen(true)}
                title="Selecionar família"
            >
                <span role="img" aria-label="Família">👨‍👩‍👧‍👦</span>
                {families.find(f => f.id === familyId)?.name || 'Família'}
            </button>
            <FamilySelectorDrawer
                open={drawerOpen}
                families={families}
                selectedFamilyId={familyId}
                favouriteFamilyId={favouriteFamilyId}
                mode={mode}
                loading={loading}
                error={error}
                onClose={() => setDrawerOpen(false)}
                onSelectFamily={handleSelect}
                onSetFavourite={handleSetFavourite}
                onCopyId={handleCopyId}
                onChangeMode={setMode}
                onCreateFamily={handleCreate}
                onJoinFamily={handleJoin}
            />
        </>
    );
};