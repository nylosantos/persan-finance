import React from 'react';
import { TransactionFiltersProps } from '../../types';

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
    filterDate,
    setFilterDate,
    filterName,
    setFilterName,
    filterCategory,
    setFilterCategory,
    categories,
    clearFilters,
}) => (
    <div className="flex w-full gap-2 mb-4">
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
            className="flex-1 p-2 rounded"
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
    </div>
);