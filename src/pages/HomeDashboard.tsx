import React, { useState, useEffect } from 'react';
import { useUserFamilies } from '../hooks/useUserFamilies';
import { useAllFamiliesMonthlyTransactions } from '../hooks/useAllFamiliesMonthlyTransactions';
import { useAllFamiliesBudgetsOfMonth } from '../hooks/useAllFamiliesBudgetsOfMonth';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MonthYearPicker } from '../components/Layout/MonthYearPicker';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useExchangeRate } from '../hooks/useExchangeRate';
import { TotalsSummary } from '../components/Layout/TotalsSummary';
import { Container } from '../components/Layout/Container';

const COLORS = ['#4ade80', '#f87171', '#60a5fa', '#fbbf24', '#a78bfa', '#f472b6', '#34d399', '#facc15', '#818cf8', '#fb7185'];

export const HomeDashboard: React.FC = () => {
    const { familyIds, loading: loadingFamilies } = useUserFamilies();


    // Data atual
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [viewCurrency, setViewCurrency] = useState<'EUR' | 'BRL'>('EUR');

    // Dados do mês selecionado
    const { transactions, loading: loadingTx } = useAllFamiliesMonthlyTransactions(familyIds, selectedYear, selectedMonth);
    const { budgets, loading: loadingBudgets } = useAllFamiliesBudgetsOfMonth(familyIds, selectedYear, selectedMonth);

    const todayKey = now.toISOString().split('T')[0];
    const { rate } = useExchangeRate(todayKey);
    // console.log('Taxa de câmbio EUR→BRL:', rate);
    const exchangeRate = rate ?? 1;

    // Função para formatar valor conforme moeda
    const fmt = (value: number, curr: 'EUR' | 'BRL') =>
        curr === 'EUR' ? `€${value.toFixed(2)}` : `R$${value.toFixed(2)}`;

    // --- Gráfico de barras: entradas/saídas por mês ---
    function getMonthKey(date: any) {
        const d = date instanceof Date
            ? date
            : date && 'seconds' in date
                ? new Date(date.seconds * 1000)
                : new Date(date);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    }

    // Agrupa por mês/ano
    const monthlyMap: Record<string, { income: number; expense: number }> = {};
    transactions.forEach(tx => {
        const key = getMonthKey(tx.date);
        if (!monthlyMap[key]) monthlyMap[key] = { income: 0, expense: 0 };
        if (tx.type === 'income') {
            monthlyMap[key].income += tx.amount * (tx.currency === 'EUR' ? 1 : 1 / exchangeRate);
        }
        if (tx.type === 'expense') {
            monthlyMap[key].expense += tx.amount * (tx.currency === 'EUR' ? 1 : 1 / exchangeRate);
        }
    });

    // Transforma em array para o gráfico
    const chartData = Object.entries(monthlyMap)
        .map(([month, { income, expense }]) => ({
            month,
            income,
            expense,
        }))
        .sort((a, b) => a.month.localeCompare(b.month));

    // --- Lógica dos totais agregados do mês selecionado ---
    const incomes = transactions.filter(tx => tx.type === 'income');
    const expenses = transactions.filter(tx => tx.type === 'expense');

    function getMonthYear(date: any) {
        const d = date instanceof Date
            ? date
            : date && 'seconds' in date
                ? new Date(date.seconds * 1000)
                : new Date(date);
        return { month: d.getMonth(), year: d.getFullYear() };
    }

    // Para cada budget, encontre as expenses do mesmo mês/categoria
    const budgetsWithExpenses = budgets.map(budget => {
        const { month, year } = getMonthYear(budget.date);
        const relatedExpenses = expenses.filter(exp => {
            const expDate = getMonthYear(exp.date);
            return (
                exp.categoryId === budget.categoryId &&
                expDate.month === month &&
                expDate.year === year
            );
        });
        return { budget, relatedExpenses };
    });

    // Expenses que não pertencem a nenhum budget do mês/ano
    const expenseWithoutBudget = expenses.filter(exp => {
        const expDate = getMonthYear(exp.date);
        return !budgets.some(budget => {
            const bDate = getMonthYear(budget.date);
            return (
                budget.categoryId === exp.categoryId &&
                bDate.month === expDate.month &&
                bDate.year === expDate.year
            );
        });
    });

    // Totais em EUR
    const totalIncomeEUR = incomes.reduce(
        (sum, tx) => sum + tx.amount * (tx.currency === 'EUR' ? 1 : 1 / exchangeRate),
        0
    );

    // Expense: soma o maior valor entre soma das expenses do budget e o valor do budget
    const totalExpenseEUR =
        budgetsWithExpenses.reduce((sum, { budget, relatedExpenses }) => {
            const sumExpenses = relatedExpenses.reduce(
                (s, exp) => s + exp.amount * (exp.currency === 'EUR' ? 1 : 1 / exchangeRate),
                0
            );
            const budgetValue = budget.amount * (budget.currency === 'EUR' ? 1 : 1 / exchangeRate);
            return sum + Math.max(sumExpenses, budgetValue);
        }, 0)
        +
        expenseWithoutBudget.reduce(
            (sum, tx) => sum + tx.amount * (tx.currency === 'EUR' ? 1 : 1 / exchangeRate),
            0
        );

    const balanceEUR = totalIncomeEUR - totalExpenseEUR;

    // Total pago: soma das expenses dos budgets (até o valor realizado, mesmo que passe do budget)
    const totalPaid =
        budgetsWithExpenses.reduce((sum, { relatedExpenses }) => {
            return sum + relatedExpenses.reduce(
                (s, exp) =>
                    s +
                    (exp.paid
                        ? exp.amount *
                        (viewCurrency === exp.currency
                            ? 1
                            : exp.currency === 'EUR'
                                ? exchangeRate
                                : 1 / exchangeRate)
                        : 0),
                0
            );
        }, 0)
        +
        expenseWithoutBudget
            .filter(tx => tx.paid)
            .reduce(
                (sum, tx) =>
                    sum +
                    tx.amount *
                    (viewCurrency === tx.currency
                        ? 1
                        : tx.currency === 'EUR'
                            ? exchangeRate
                            : 1 / exchangeRate),
                0
            );

    // Total a pagar: para cada budget, se soma das expenses < valor do budget, soma a diferença
    const totalToPay =
        budgetsWithExpenses.reduce((sum, { budget, relatedExpenses }) => {
            const sumExpenses = relatedExpenses.reduce(
                (s, exp) =>
                    s +
                    (!exp.paid
                        ? exp.amount *
                        (viewCurrency === exp.currency
                            ? 1
                            : exp.currency === 'EUR'
                                ? exchangeRate
                                : 1 / exchangeRate)
                        : 0),
                0
            );
            const budgetValue =
                budget.amount *
                (viewCurrency === budget.currency
                    ? 1
                    : budget.currency === 'EUR'
                        ? exchangeRate
                        : 1 / exchangeRate);
            return sum + (sumExpenses < budgetValue ? budgetValue - sumExpenses : 0);
        }, 0)
        +
        expenseWithoutBudget
            .filter(tx => !tx.paid)
            .reduce(
                (sum, tx) =>
                    sum +
                    tx.amount *
                    (viewCurrency === tx.currency
                        ? 1
                        : tx.currency === 'EUR'
                            ? exchangeRate
                            : 1 / exchangeRate),
                0
            );

    // Totais em BRL
    const totalIncomeBRL = totalIncomeEUR * exchangeRate;
    const totalExpenseBRL = totalExpenseEUR * exchangeRate;
    const balanceBRL = balanceEUR * exchangeRate;

    // --- Gráfico de pizza: proporção dos gastos por família ---
    const [familyNames, setFamilyNames] = useState<Record<string, string>>({});
    useEffect(() => {
        if (!familyIds.length) {
            setFamilyNames({});
            return;
        }
        // Busca os nomes das famílias
        Promise.all(
            familyIds.map(fid =>
                getDoc(doc(db, 'families', fid)).then(snap => ({
                    id: fid,
                    name: snap.exists() ? (snap.data().name as string) : fid,
                }))
            )
        ).then(arr => {
            const names: Record<string, string> = {};
            arr.forEach(f => (names[f.id] = f.name));
            setFamilyNames(names);
        });
    }, [familyIds]);

    // Soma os gastos por família no mês selecionado
    const expenseByFamily: { id: string; name: string; value: number }[] = familyIds.map(fid => {
        // Filtra expenses dessa família
        const txs = transactions.filter(tx => tx.type === 'expense' && tx.familyId === fid);
        // Filtra budgets dessa família
        const bds = budgets.filter(b => b.familyId === fid);
        // Mesma lógica de budgets
        function getMonthYear(date: any) {
            const d = date instanceof Date
                ? date
                : date && 'seconds' in date
                    ? new Date(date.seconds * 1000)
                    : new Date(date);
            return { month: d.getMonth(), year: d.getFullYear() };
        }
        const budgetsWithExpenses = bds.map(budget => {
            const { month, year } = getMonthYear(budget.date);
            const relatedExpenses = txs.filter(exp => {
                const expDate = getMonthYear(exp.date);
                return (
                    exp.categoryId === budget.categoryId &&
                    expDate.month === month &&
                    expDate.year === year
                );
            });
            return { budget, relatedExpenses };
        });
        const expenseWithoutBudget = txs.filter(exp => {
            const expDate = getMonthYear(exp.date);
            return !bds.some(budget => {
                const bDate = getMonthYear(budget.date);
                return (
                    budget.categoryId === exp.categoryId &&
                    bDate.month === expDate.month &&
                    bDate.year === expDate.year
                );
            });
        });
        // Soma igual ao totalExpenseEUR, mas só dessa família
        const total =
            budgetsWithExpenses.reduce((sum, { budget, relatedExpenses }) => {
                const sumExpenses = relatedExpenses.reduce(
                    (s, exp) => s + exp.amount * (exp.currency === 'EUR' ? 1 : 1 / exchangeRate),
                    0
                );
                const budgetValue = budget.amount * (budget.currency === 'EUR' ? 1 : 1 / exchangeRate);
                return sum + Math.max(sumExpenses, budgetValue);
            }, 0) +
            expenseWithoutBudget.reduce(
                (sum, tx) => sum + tx.amount * (tx.currency === 'EUR' ? 1 : 1 / exchangeRate),
                0
            );
        return {
            id: fid,
            name: familyNames[fid] || fid,
            value: total,
        };
    }).filter(f => f.value > 0);

    if (loadingFamilies || loadingTx || loadingBudgets) {
        return <p>Carregando dados...</p>;
    }

    return (
        <Container>
            <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">Resumo Geral</h1>

            {/* Selecione o mês e ano */}
            <MonthYearPicker
                month={selectedMonth}
                year={selectedYear}
                onChange={(m, y) => {
                    setSelectedMonth(m);
                    setSelectedYear(y);
                }}
                className="w-full justify-between mt-4"
            />

            {/* Totais do mês */}
            <TotalsSummary
                totalIncome={viewCurrency === 'EUR' ? totalIncomeEUR : totalIncomeBRL}
                totalExpense={viewCurrency === 'EUR' ? totalExpenseEUR : totalExpenseBRL}
                balance={viewCurrency === 'EUR' ? balanceEUR : balanceBRL}
                totalPaid={totalPaid}
                totalToPay={totalToPay}
                viewCurrency={viewCurrency}
                onToggleCurrency={() => setViewCurrency(viewCurrency === 'EUR' ? 'BRL' : 'EUR')}
                fmt={fmt}
            />
            {/* <div className="flex justify-between items-center mt-6 p-4 bg-gray-200 dark:bg-gray-800 rounded">
                <p>
                    Entrada:{' '}
                    {fmt(
                        viewCurrency === 'EUR' ? totalIncomeEUR : totalIncomeBRL,
                        viewCurrency
                    )}
                </p>
                <p>
                    Saída:{' '}
                    {fmt(
                        viewCurrency === 'EUR' ? totalExpenseEUR : totalExpenseBRL,
                        viewCurrency
                    )}
                </p>
                <p>
                    Saldo:{' '}
                    {fmt(
                        viewCurrency === 'EUR' ? balanceEUR : balanceBRL,
                        viewCurrency
                    )}
                </p>
                <p className="text-green-700 dark:text-green-400">
                    Total pago: {fmt(totalPaid, viewCurrency)}
                </p>
                <p className="text-red-700 dark:text-red-400">
                    Total a pagar: {fmt(totalToPay, viewCurrency)}
                </p>
                <button
                    onClick={() => setViewCurrency(viewCurrency === 'EUR' ? 'BRL' : 'EUR')}
                    className="px-3 py-1 bg-primary text-white rounded"
                >
                    Ver em {viewCurrency === 'EUR' ? 'R$' : '€'}
                </button>
            </div> */}

            {/* Gráfico de entradas/saídas */}
            <div className="w-full h-72 bg-white dark:bg-gray-800 p-4 rounded shadow mt-8">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" fill="#4ade80" name="Receitas" />
                        <Bar dataKey="expense" fill="#f87171" name="Despesas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Gráfico de pizza: proporção dos gastos por família */}
            {expenseByFamily.length > 0 && (
                <div className="w-full h-72 bg-white dark:bg-gray-800 p-4 rounded shadow mt-8 flex flex-col items-center">
                    <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">Proporção de gastos por família</h3>
                    <ResponsiveContainer width="100%" height="90%">
                        <PieChart>
                            <Pie
                                data={expenseByFamily}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                label
                            >
                                {expenseByFamily.map((entry, idx) => (
                                    <Cell key={`cell-${entry.id}`} fill={COLORS[idx % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {expenseByFamily.map((entry, idx) => (
                            <span key={entry.id} className="flex items-center gap-1 text-sm">
                                <span style={{ background: COLORS[idx % COLORS.length], width: 12, height: 12, borderRadius: 6, display: 'inline-block' }} />
                                {entry.name}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </Container>
    );
};