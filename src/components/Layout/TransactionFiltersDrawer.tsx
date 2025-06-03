import React, { useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import { TransactionFiltersDrawerProps } from '../../types';

export const TransactionFiltersDrawer: React.FC<TransactionFiltersDrawerProps> = ({
    open,
    onClose,
    onApply,
    filterDate,
    setFilterDate,
    filterName,
    setFilterName,
    filterCategory,
    setFilterCategory,
    categories,
    clearFilters,
}) => {
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

    return (
        <div
            className={`
                fixed inset-0 h-screen z-50 overflow-hidden md:hidden
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
                    relative ml-auto h-full pt-safe bg-white dark:bg-gray-900 shadow-lg transition-transform duration-300
                    flex flex-col w-full max-w-[320px]
                    ${open ? 'translate-x-0' : 'translate-x-full'}
                `}
                style={{ minWidth: 'min(100vw,320px)' }}
            >
                {/* Topo */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Filtros</h2>
                    <button onClick={onClose} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
                        <AiOutlineClose size={20} />
                    </button>
                </div>
                {/* Filtros */}
                <form
                    className="flex flex-col gap-4 p-4 flex-1"
                    onSubmit={e => {
                        e.preventDefault();
                        onApply();
                    }}
                >
                    <input
                        type="date"
                        value={filterDate}
                        onChange={e => setFilterDate(e.target.value)}
                        onKeyDown={e => e.preventDefault()}
                        onFocus={e => e.currentTarget.showPicker?.()}
                        className="custom-date-picker bg-transparent placeholder-gray-400 dark:placeholder-white rounded p-2 cursor-pointer focus:outline-none"
                        placeholder="dd/mm/yyyy"
                    />
                    <input
                        type="text"
                        placeholder="Nome"
                        value={filterName}
                        onChange={e => setFilterName(e.target.value)}
                        className="p-2 rounded"
                    />
                    <select
                        value={filterCategory}
                        onChange={e => setFilterCategory(e.target.value)}
                        className="p-2 rounded dark:bg-gray-800"
                    >
                        <option value="">Todas as categorias</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="p-2 rounded bg-gray-200 dark:bg-gray-700"
                    >
                        Limpar
                    </button>
                    <button
                        type="submit"
                        className="p-2 rounded bg-primary text-white mt-2"
                    >
                        Aplicar filtros
                    </button>
                </form>
            </aside>
        </div>
    );
};