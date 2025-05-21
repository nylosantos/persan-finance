// src/components/Financial/CategoryPieChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useCategoryAggregates } from '../../hooks/useCategoryAggregates';

// paleta de cores (até 10 categorias)
const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#2dd4bf', '#f472b6', '#34d399', '#fcd34d', '#93c5fd'];

interface Props {
    familyId: string;
    monthKey: string; // 'YYYY-MM'
}

export const CategoryPieChart: React.FC<Props> = ({ familyId, monthKey }) => {
    const { data, loading } = useCategoryAggregates(familyId, monthKey, 'expense');

    if (loading) return <p>Loading chart...</p>;
    if (data.length === 0) return <p>No data for this month.</p>;

    return (
        <div className="w-full h-[40vh] bg-white dark:bg-gray-800 p-4 rounded shadow">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie dataKey="total" data={data} nameKey="categoryName" cx="50%" cy="50%" outerRadius={80} label={({ value }) => `€${value.toFixed(2)}`}>
                        {data.map((entry, index) => (
                            <Cell key={entry.categoryId} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => `€${value.toFixed(2)}`} />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};
