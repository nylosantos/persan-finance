// src/pages/DashboardPage.tsx
// Página Dashboard: reúne gráficos de visão financeira

import React from 'react';
import { FinancialDashboard } from '../components/Financial/FinancialDashboard';
import { CategoryPieChart } from '../components/Financial/CategoryPieChart';
import { useFamily } from '../contexts/FamilyContext';
import { Container } from '../components/Layout/Container';

export const DashboardPage: React.FC = () => {
    // TODO: obter familyId dinamicamente via contexto de família
    const { familyId } = useFamily();
    // monthKey no formato 'YYYY-MM'
    const monthKey = new Date().toISOString().slice(0, 7);
    const familyIdValidate = familyId === '' ? 'idFicticio' : familyId;
    return (
        <Container>
            <div className="flex flex-col w-full h-full space-y-8 p-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Gráficos</h1>
                <FinancialDashboard familyId={familyIdValidate} />
                <CategoryPieChart familyId={familyIdValidate} monthKey={monthKey} />
            </div>
        </Container>
    );
};
