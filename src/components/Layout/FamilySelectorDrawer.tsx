import React, { useEffect, useState } from 'react';
import { FamilySelectorDrawerProps, FamilySelectorMode } from '../../types';
import { FamilyCard } from './FamilyCard';
import { AiOutlineClose } from 'react-icons/ai';
import Loading from './Loading';

export const FamilySelectorDrawer: React.FC<FamilySelectorDrawerProps> = ({
    open,
    families,
    selectedFamilyId,
    favouriteFamilyId,
    mode,
    loading,
    error,
    onClose,
    onSelectFamily,
    onSetFavourite,
    onCopyId,
    onChangeMode,
    onCreateFamily,
    onJoinFamily,
}) => {
    const [input, setInput] = useState('');
    const [copiedId, setCopiedId] = useState<string | null>(null);

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

    // Feedback visual ao copiar
    const handleCopyId = (id: string) => {
        onCopyId(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1200);
    };

    // Responsivo: largura 100vw mobile, 400px desktop
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
                    relative ml-auto h-full pt-safe bg-gray-100 dark:bg-gray-900 shadow-lg transition-transform duration-300
                    flex flex-col w-full md:max-w-[400px]
                    ${open ? 'translate-x-0' : 'translate-x-full'}
                `}
                // style={{ minWidth: 'min(100vw,400px)' }}
            >
                {/* Topo */}
                <div className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100 px-4">Famílias</h2>
                    <button onClick={onClose} className="py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <AiOutlineClose size={20} />
                    </button>
                </div>
                {/* Tabs */}
                <div className="flex justify-around border-b border-gray-200 dark:border-gray-700 py-3 text-center">
                    {(['select', 'create', 'join'] as FamilySelectorMode[]).map(tab => (
                        <div
                            key={tab}
                            className={`flex-1 py-2 text-sm font-medium transition
                                ${mode === tab
                                    ? 'border-b-2 border-primary text-primary'
                                    : 'text-gray-600 dark:text-gray-300 hover:text-primary'}
                            `}
                            onClick={() => onChangeMode(tab)}
                        >
                            {tab === 'select' && 'Selecionar'}
                            {tab === 'create' && 'Criar'}
                            {tab === 'join' && 'Entrar'}
                        </div>
                    ))}
                </div>
                {/* Conteúdo */}
                <div className="flex-1 overflow-y-auto p-4">
                    {mode === 'select' && (
                        loading ? (
                            <Loading />
                        ) : families.length === 0 ? (
                            <div className="text-center text-gray-500">Nenhuma família encontrada.</div>
                        ) : (
                            <div>
                                {families.map(fam => (
                                    <FamilyCard
                                        key={fam.id}
                                        id={fam.id}
                                        name={fam.name}
                                        isFavourite={favouriteFamilyId === fam.id}
                                        isSelected={selectedFamilyId === fam.id}
                                        onSelect={onSelectFamily}
                                        onSetFavourite={onSetFavourite}
                                        onCopyId={handleCopyId}
                                    />
                                ))}
                                {copiedId && (
                                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-2 rounded shadow-lg z-50">
                                        Código copiado!
                                    </div>
                                )}
                            </div>
                        )
                    )}
                    {mode === 'create' && (
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={e => {
                                e.preventDefault();
                                if (input.trim()) {
                                    onCreateFamily(input.trim());
                                    setInput('');
                                }
                            }}
                        >
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Nome da nova família
                            </label>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Nome da família"
                                className="p-2 rounded border dark:bg-gray-800"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded"
                            >
                                Criar
                            </button>
                            {error && <p className="text-red-500">{error}</p>}
                        </form>
                    )}
                    {mode === 'join' && (
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={e => {
                                e.preventDefault();
                                if (input.trim()) {
                                    onJoinFamily(input.trim());
                                    setInput('');
                                }
                            }}
                        >
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                Código da família
                            </label>
                            <input
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Cole o código aqui"
                                className="p-2 rounded border dark:bg-gray-800"
                                autoFocus
                            />
                            <button
                                type="submit"
                                className="bg-primary text-white px-4 py-2 rounded"
                            >
                                Entrar
                            </button>
                            {error && <p className="text-red-500">{error}</p>}
                        </form>
                    )}
                </div>
            </aside>
        </div>
    );
};