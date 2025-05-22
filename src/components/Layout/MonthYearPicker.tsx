import React, { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const MONTHS = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

interface MonthYearPickerProps {
    month: number; // 0-11
    year: number;
    onChange: (month: number, year: number) => void;
    minYear?: number;
    maxYear?: number;
    className?: string;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
    month,
    year,
    onChange,
    minYear,
    maxYear,
    className = '',
}) => {
    const [showMonthPicker, setShowMonthPicker] = useState(false);
    const [showYearPicker, setShowYearPicker] = useState(false);
    const monthRef = useRef<HTMLDivElement>(null);
    const yearRef = useRef<HTMLDivElement>(null);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (
                monthRef.current && !monthRef.current.contains(event.target as Node)
            ) setShowMonthPicker(false);
            if (
                yearRef.current && !yearRef.current.contains(event.target as Node)
            ) setShowYearPicker(false);
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handlePrev = () => {
        if (month === 0) {
            onChange(11, year - 1);
        } else {
            onChange(month - 1, year);
        }
    };

    const handleNext = () => {
        if (month === 11) {
            onChange(0, year + 1);
        } else {
            onChange(month + 1, year);
        }
    };

    const years = [];
    const thisYear = new Date().getFullYear();
    const min = minYear ?? thisYear - 10;
    const max = maxYear ?? thisYear + 10;
    for (let y = min; y <= max; y++) years.push(y);

    return (
        <div className='flex w-full justify-center items-center'>
            <div className={`flex w-full max-w-xl items-center gap-2 relative ${className}`}>
                <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={handlePrev}
                    aria-label="Mês anterior"
                    type="button"
                >
                    <FiChevronLeft />
                </button>
                <div className="flex items-center gap-1">
                    <div ref={monthRef} className="relative">
                        <div
                            className="font-bold text-lg px-6 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center cursor-pointer"
                            onClick={() => setShowMonthPicker(v => !v)}
                            aria-label="Selecionar mês"
                        // type="div"
                        >
                            {MONTHS[month]}
                            {/* <FiChevronDown className="ml-1" /> */}
                        </div>
                        {showMonthPicker && (
                            <div className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow mt-1 left-0">
                                {MONTHS.map((name, idx) => (
                                    <div
                                        key={name}
                                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${idx === month ? 'font-bold bg-gray-100 dark:bg-gray-700' : ''}`}
                                        onClick={() => {
                                            onChange(idx, year);
                                            setShowMonthPicker(false);
                                        }}
                                    // type="div"
                                    >
                                        {name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div ref={yearRef} className="relative">
                        <div
                            className="font-bold text-lg px-6 py-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center cursor-pointer"
                            onClick={() => setShowYearPicker(v => !v)}
                            aria-label="Selecionar ano"
                        // type="div"0
                        >
                            {year}
                            {/* <FiChevronDown className="ml-1" /> */}
                        </div>
                        {showYearPicker && (
                            <div className="absolute z-20 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded shadow mt-1 left-0">
                                {years.map(y => (
                                    <div
                                        key={y}
                                        className={`block w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer ${y === year ? 'font-bold bg-gray-100 dark:bg-gray-700' : ''}`}
                                        onClick={() => {
                                            onChange(month, y);
                                            setShowYearPicker(false);
                                        }}
                                    // type="div"
                                    >
                                        {y}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
                <button
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    onClick={handleNext}
                    aria-label="Próximo mês"
                    type="button"
                >
                    <FiChevronRight />
                </button>
            </div>
        </div>
    );
};