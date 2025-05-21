import React from 'react';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import { FiCopy } from 'react-icons/fi';
import { FamilyCardProps } from '../../types';

export const FamilyCard: React.FC<FamilyCardProps> = ({
    id,
    name,
    isFavourite,
    isSelected,
    onSelect,
    onSetFavourite,
    onCopyId,
}) => (
    <div
        className={`flex items-center justify-between p-4 mb-2 rounded shadow cursor-pointer transition border
            ${isSelected ? 'border-primary bg-primary/10' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}
        `}
        onClick={() => onSelect(id)}
        tabIndex={0}
        role="button"
        aria-pressed={isSelected}
        onKeyPress={e => { if (e.key === 'Enter') onSelect(id); }}
    >
        <div className="flex-1">
            <div className="font-semibold text-gray-900 dark:text-gray-100">{name}</div>
            {isFavourite && (
                <span className="text-xs text-yellow-600 flex items-center gap-1">
                    <AiFillStar className="text-yellow-400" /> Favorita
                </span>
            )}
        </div>
        <div className="flex items-center gap-2 ml-4">
            <button
                type="button"
                className="p-1 rounded hover:bg-yellow-100 dark:hover:bg-yellow-900"
                onClick={e => { e.stopPropagation(); onSetFavourite(id); }}
                title={isFavourite ? 'Família favorita' : 'Definir como favorita'}
                disabled={isFavourite}
            >
                {isFavourite
                    ? <AiFillStar className="text-yellow-400" />
                    : <AiOutlineStar className="text-yellow-400" />}
            </button>
            <button
                type="button"
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={e => { e.stopPropagation(); onCopyId(id); }}
                title="Copiar código da família"
            >
                <FiCopy />
            </button>
        </div>
    </div>
);