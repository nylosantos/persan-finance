// src/components/Financial/MonthlyView.tsx
import React, { useMemo, useState } from 'react';
import { where, orderBy, Timestamp, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { useFirestoreCollection } from '../../hooks/useFirestoreCollection';
import { useExchangeRate } from '../../hooks/useExchangeRate';
// import { useCategories } from '../../hooks/useCategories';
// import { useAuth } from '../../contexts/AuthContext';
import { Transaction } from '../../types';
import { useFamily } from '../../contexts/FamilyContext';
import { db } from '../../services/firebase';
import { useConfirm } from '../../hooks/useConfirm';
import { MonthYearPicker } from '../Layout/MonthYearPicker';
import { TransactionOptions } from './TransactionOptions';
import { useBudgetsOfMonth } from '../../hooks/useBudgetsOfMonth';
import { useCategories } from '../../hooks/useCategories';
import { TransactionPaymentModal } from './TransactionPaymentModal';
import { TransactionEditModal } from './TransactionEditModal';
import { TotalsSummary } from '../Layout/TotalsSummary';
import { TransactionFilters } from '../Layout/TransactionFilters';
import { TransactionFiltersDrawer } from '../Layout/TransactionFiltersDrawer';
import { FiFilter } from 'react-icons/fi';
import { FaFilter } from 'react-icons/fa';
import { TransactionFormDrawerCard } from './TransactionFormDrawerCard';
import { Container } from '../Layout/Container';

export const MonthlyView: React.FC = () => {
    // const { user } = useAuth();
    const confirm = useConfirm();
    const { familyId } = useFamily();
    const path = `families/${familyId === '' ? 'idFicticio' : familyId}/financialData`;


    const [editingTx, setEditingTx] = useState<Transaction | null>(null);
    const [payingTx, setPayingTx] = useState<Transaction | null>(null);

    // Estado para toggle de moeda nos totais: 'EUR' ou 'BRL'
    const [viewCurrency, setViewCurrency] = useState<'EUR' | 'BRL'>('EUR');
    // Estado para item de transação em hover (para conversão individual)
    const [hoveredTx, setHoveredTx] = useState<string | null>(null);

    const { categories } = useCategories('family', familyId);

    const [filterDate, setFilterDate] = useState('');
    const [filterName, setFilterName] = useState('');
    const [filterCategory, setFilterCategory] = useState('');

    // Função para limpar filtros
    const clearFilters = () => {
        setFilterDate('');
        setFilterName('');
        setFilterCategory('');
    };

    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const { budgets, loading: budgetsLoading } = useBudgetsOfMonth(path, selectedYear, selectedMonth);

    const startDate = Timestamp.fromDate(new Date(selectedYear, selectedMonth, 1));
    const endDate = Timestamp.fromDate(new Date(selectedYear, selectedMonth + 1, 0, 23, 59, 59));

    // Constraints para filtrar transações do mês
    const constraints = [
        where('date', '>=', startDate),
        where('date', '<=', endDate),
        orderBy('date', 'asc')
    ];

    // Busca transações e taxa de câmbio de hoje
    const { data: transactions, loading } = useFirestoreCollection<Transaction>(path, constraints);
    const todayKey = now.toISOString().split('T')[0];
    const { rate } = useExchangeRate(todayKey);
    // console.log('Taxa de câmbio EUR→BRL:', rate);
    const exchangeRate = rate ?? 1;

    // Função auxiliar para extrair mês/ano de uma data
    function getMonthYear(date: any) {
        const d = date instanceof Date
            ? date
            : date && 'seconds' in date
                ? new Date(date.seconds * 1000)
                : new Date(date);
        return { month: d.getMonth(), year: d.getFullYear() };
    }

    // Agrupa budgets e gastos reais
    const incomes = transactions.filter(tx => tx.type === 'income');
    const expenses = transactions.filter(tx => tx.type === 'expense');

    const [listType, setListType] = useState<'expenses' | 'incomes'>('expenses');

    const [hoveredBudget, setHoveredBudget] = useState<string | null>(null);
    const [hoveredBudgetTx, setHoveredBudgetTx] = useState<string | null>(null);
    // const [payCurrency, setPayCurrency] = useState<'EUR' | 'BRL'>('EUR');
    // const [payAmount, setPayAmount] = useState<number | string>(() => payingTx?.amount ?? '');

    // Função para filtrar transações (expenses ou incomes)
    const filteredTransactions = (listType === 'expenses' ? expenses : incomes).filter(tx => {
        const matchesDate = !filterDate || (
            tx.date &&
            (
                (typeof tx.date.toDate === 'function'
                    ? tx.date.toDate().toISOString().split('T')[0]
                    : new Date(tx.date.toDate()).toISOString().split('T')[0]
                ) === filterDate
            )
        );
        const matchesName = !filterName || tx.name.toLowerCase().includes(filterName.toLowerCase());
        const matchesCategory = !filterCategory || tx.categoryId === filterCategory;
        return matchesDate && matchesName && matchesCategory;
    });

    // Agrupa budgets e gastos reais
    const budgetsList = budgets ?? [];
    const expensesList = filteredTransactions.filter(tx => tx.type === 'expense');

    // Para cada budget, encontre as expenses do mesmo mês/categoria
    const budgetsWithExpenses = budgetsList.map(budget => {
        const { month, year } = getMonthYear(budget.date);
        const relatedExpenses = expensesList.filter(exp => {
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
    const expenseWithoutBudget = expensesList.filter(exp => {
        const expDate = getMonthYear(exp.date);
        return !budgetsList.some(budget => {
            const bDate = getMonthYear(budget.date);
            return (
                budget.categoryId === exp.categoryId &&
                bDate.month === expDate.month &&
                bDate.year === expDate.year
            );
        });
    });

    // Cálculo de totais em EUR
    const totalIncomeEUR = transactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount * (tx.currency === 'EUR' ? 1 : 1 / exchangeRate), 0);

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
                    exp.amount *
                    (viewCurrency === exp.currency
                        ? 1
                        : exp.currency === 'EUR'
                            ? exchangeRate
                            : 1 / exchangeRate),
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
                    exp.amount *
                    (viewCurrency === exp.currency
                        ? 1
                        : exp.currency === 'EUR'
                            ? exchangeRate
                            : 1 / exchangeRate),
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

    // Função para formatar valor conforme moeda
    const fmt = (value: number, curr: 'EUR' | 'BRL') =>
        curr === 'EUR' ? `€${value.toFixed(2)}` : `R$${value.toFixed(2)}`;

    const [expandedBudget, setExpandedBudget] = useState<string | null>(null);

    const [drawerOpen, setDrawerOpen] = useState(false);

    // Verifica se algum filtro está ativo
    const filtrosAtivos = useMemo(
        () => !!(filterDate || filterName || filterCategory),
        [filterDate, filterName, filterCategory]
    );

    return (
        <Container>
            {/* {
                editingTx && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
                        <div className="bg-white dark:bg-gray-800 rounded p-6 shadow-lg min-w-[320px]">
                            <h2 className="mb-4 text-lg font-bold">Editar Transação</h2>
                            <TransactionForm
                                path={path}
                                budgetsOfMonth={budgets}
                                initialValues={editingTx}
                                onClose={() => setEditingTx(null)}
                                onSaved={() => setEditingTx(null)}
                            />
                        </div>
                    </div>
                )
            } */}

            <TransactionEditModal
                open={!!editingTx}
                transaction={editingTx}
                budgetsOfMonth={budgets}
                path={path}
                onClose={() => setEditingTx(null)}
                onSaved={() => setEditingTx(null)}
            />

            <TransactionPaymentModal
                open={!!payingTx}
                transaction={payingTx}
                onClose={() => setPayingTx(null)}
                onConfirm={async (data) => {
                    await updateDoc(doc(db, path, payingTx!.id), data);
                    setPayingTx(null);
                }}
            />

            {familyId !== '' &&
                <>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-6">Registro Mensal</h1>

                    {/* Formulário para nova transação */}
                    <TransactionFormDrawerCard path={path} budgetsOfMonth={budgets} />
                    {/* Selecione o mês e ano */}
                    <MonthYearPicker
                        month={selectedMonth}
                        year={selectedYear}
                        onChange={(m, y) => {
                            setSelectedMonth(m);
                            setSelectedYear(y);
                        }}
                        className='justify-between mt-4'
                    />

                    {/* Totais do mês com toggle de moeda */}
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
                    {/* {!loading && (
                        <div className="flex justify-between items-center mt-6 p-4 bg-gray-200 dark:bg-gray-800 rounded">
                            <p>Entrada: {fmt(viewCurrency === 'EUR' ? totalIncomeEUR : totalIncomeBRL, viewCurrency)}</p>
                            <p>Saída: {fmt(viewCurrency === 'EUR' ? totalExpenseEUR : totalExpenseBRL, viewCurrency)}</p>
                            <p>Saldo: {fmt(viewCurrency === 'EUR' ? balanceEUR : balanceBRL, viewCurrency)}</p>
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
                        </div>
                    )} */}
                    <div className='flex w-full md:flex-col items-center justify-between mt-2 md:mt-0'>
                        <div className="flex w-full items-center justify-center gap-2 my-4">
                            <div
                                className={`px-3 py-1 rounded ${listType === 'expenses' ? 'bg-primary text-white cursor-default' : 'bg-gray-200 dark:bg-gray-700 cursor-pointer'}`}
                                onClick={() => setListType('expenses')}
                            >
                                Despesas
                            </div>
                            <div
                                className={`px-3 py-1 rounded ${listType === 'incomes' ? 'bg-primary text-white cursor-default' : 'bg-gray-200 dark:bg-gray-700 cursor-pointer'}`}
                                onClick={() => setListType('incomes')}
                            >
                                Receitas
                            </div>
                        </div>

                        {/* <div className="flex flex-wrap gap-2 mb-4">
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
                            className="p-2 rounded"
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
                    </div> */}

                        {/* <TransactionFilters
                        filterDate={filterDate}
                        setFilterDate={setFilterDate}
                        filterName={filterName}
                        setFilterName={setFilterName}
                        filterCategory={filterCategory}
                        setFilterCategory={setFilterCategory}
                        categories={categories}
                        clearFilters={clearFilters}
                    /> */}
                        <div className="flex flex-col w-full">
                            {/* Desktop */}
                            <div className="hidden md:block flex flex-col w-full ">
                                <TransactionFilters
                                    filterDate={filterDate}
                                    setFilterDate={setFilterDate}
                                    filterName={filterName}
                                    setFilterName={setFilterName}
                                    filterCategory={filterCategory}
                                    setFilterCategory={setFilterCategory}
                                    categories={categories}
                                    clearFilters={clearFilters}
                                />
                            </div>
                            {/* Mobile */}
                            <div className="flex md:hidden justify-end">
                                <button
                                    className="flex items-center gap-2 px-3 py-2 rounded bg-primary text-white"
                                    onClick={() => {
                                        if (filtrosAtivos) {
                                            clearFilters();
                                        } else {
                                            setDrawerOpen(true);
                                        }
                                    }}
                                >
                                    {filtrosAtivos ? (
                                        <>
                                            <FaFilter /> Limpar filtros
                                        </>
                                    ) : (
                                        <>
                                            <FiFilter /> Filtrar
                                        </>
                                    )}
                                </button>
                            </div>
                            <TransactionFiltersDrawer
                                open={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                                onApply={() => setDrawerOpen(false)}
                                filterDate={filterDate}
                                setFilterDate={setFilterDate}
                                filterName={filterName}
                                setFilterName={setFilterName}
                                filterCategory={filterCategory}
                                setFilterCategory={setFilterCategory}
                                categories={categories}
                                clearFilters={clearFilters}
                            />
                        </div>
                    </div>

                    {/* Lista de transações com hover para conversão */}
                    {loading ? (
                        <p>Loading...</p>
                    ) : (
                        listType === 'expenses' ? (
                            <ul className="mt-2 space-y-2">
                                {/* Budgets do mês/ano selecionado */}
                                {budgets.map(budget => {
                                    // Extrai mês/ano do budget
                                    const budgetDate = budget.date instanceof Date
                                        ? budget.date
                                        : budget.date && 'seconds' in budget.date
                                            ? new Date(budget.date.seconds * 1000)
                                            : new Date(budget.date);

                                    const budgetMonth = budgetDate.getMonth();
                                    const budgetYear = budgetDate.getFullYear();

                                    // Soma dos gastos reais da mesma categoria e mesmo mês/ano
                                    const realized = expenses
                                        .filter(exp => {
                                            const expDate = exp.date instanceof Date
                                                ? exp.date
                                                : exp.date && 'seconds' in exp.date
                                                    ? new Date(exp.date.seconds * 1000)
                                                    : new Date(exp.date);
                                            return (
                                                exp.categoryId === budget.categoryId &&
                                                expDate.getMonth() === budgetMonth &&
                                                expDate.getFullYear() === budgetYear
                                            );
                                        })
                                        .reduce(
                                            (sum, exp) =>
                                                sum +
                                                exp.amount *
                                                (budget.currency === exp.currency
                                                    ? 1
                                                    : exp.currency === 'EUR'
                                                        ? exchangeRate
                                                        : 1 / exchangeRate),
                                            0
                                        );
                                    return (
                                        <li
                                            key={budget.id}
                                            className="flex flex-col bg-yellow-100 dark:bg-yellow-900 rounded p-2"
                                        >
                                            <div className="flex justify-between items-center cursor-pointer">
                                                <div
                                                    className="flex w-full justify-between items-center cursor-pointer pr-2"
                                                    onClick={() => setExpandedBudget(expandedBudget === budget.id ? null : budget.id)}
                                                >
                                                    <span className="font-semibold text-yellow-900 dark:text-yellow-200">
                                                        {budget.name}
                                                    </span>
                                                    <span
                                                        className={
                                                            "ml-2" +
                                                            (realized <= budget.amount
                                                                ? "text-green-700 dark:text-green-400"
                                                                : "text-red-700 dark:text-red-400")
                                                        }
                                                        onMouseEnter={() => setHoveredBudget(budget.id)}
                                                        onMouseLeave={() => setHoveredBudget(null)}
                                                    >
                                                        {fmt(realized, budget.currency)} / {fmt(budget.amount, budget.currency)}
                                                        {hoveredBudget === budget.id && (
                                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">
                                                                ({budget.currency === 'EUR'
                                                                    ? `R$${(realized * exchangeRate).toFixed(2)} / R$${(budget.amount * exchangeRate).toFixed(2)}`
                                                                    : `€${(realized / exchangeRate).toFixed(2)} / €${(budget.amount / exchangeRate).toFixed(2)}`})
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                                <TransactionOptions
                                                    transaction={budget}
                                                    hidePay={true}
                                                    onEdit={() => setEditingTx(budget)}
                                                    onDelete={async () => {
                                                        const related = expenses.filter(exp => {
                                                            const expDate = exp.date instanceof Date
                                                                ? exp.date
                                                                : exp.date && 'seconds' in exp.date
                                                                    ? new Date(exp.date.seconds * 1000)
                                                                    : new Date(exp.date);
                                                            return (
                                                                exp.categoryId === budget.categoryId &&
                                                                expDate.getMonth() === budgetMonth &&
                                                                expDate.getFullYear() === budgetYear
                                                            );
                                                        });
                                                        const ok = await confirm({
                                                            title: 'Deletar orçamento',
                                                            text: `Deseja deletar o orçamento "${budget.name}" e todas as transações relacionadas?`,
                                                            confirmButtonText: 'Deletar tudo',
                                                            cancelButtonText: 'Cancelar',
                                                            onConfirm: async () => {
                                                                await deleteDoc(doc(db, path, budget.id));
                                                                for (const exp of related) {
                                                                    await deleteDoc(doc(db, path, exp.id));
                                                                }
                                                            }
                                                        });
                                                        if (ok === !true) {
                                                            console.log('ok', ok, budgetsLoading);
                                                        }
                                                        // Não precisa de if (ok), pois a deleção já ocorre no onConfirm
                                                    }}
                                                />
                                            </div>
                                            {/* Detalhes dos gastos reais */}
                                            {expandedBudget === budget.id && (
                                                <ul className="mt-2 space-y-1 pl-4 border-l-2 border-yellow-400">
                                                    {filteredTransactions
                                                        .filter(exp => {
                                                            const expDate = exp.date instanceof Date
                                                                ? exp.date
                                                                : exp.date && 'seconds' in exp.date
                                                                    ? new Date(exp.date.seconds * 1000)
                                                                    : new Date(exp.date);
                                                            return (
                                                                exp.categoryId === budget.categoryId &&
                                                                expDate.getMonth() === budgetMonth &&
                                                                expDate.getFullYear() === budgetYear
                                                            );
                                                        })
                                                        .map(exp => (
                                                            <li key={exp.id} className="flex justify-between items-center text-sm">
                                                                <div
                                                                    className="flex w-full justify-between items-center pr-2"
                                                                >
                                                                    <div className='flex w-fit items-center gap-2'>
                                                                        <span className="font-semibold">
                                                                            {exp.date.toDate().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}
                                                                        </span>
                                                                        <span className="font-semibold">{exp.name}</span>
                                                                    </div>
                                                                    {/* <span>{exp.name}</span> */}
                                                                    <span
                                                                        onMouseEnter={() => setHoveredBudgetTx(exp.id)}
                                                                        onMouseLeave={() => setHoveredBudgetTx(null)}
                                                                    >
                                                                        {fmt(exp.amount, exp.currency)}
                                                                        {hoveredBudgetTx === exp.id && (
                                                                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-300">
                                                                                {exp.currency === 'EUR'
                                                                                    ? `(R$${(exp.amount * exchangeRate).toFixed(2)})`
                                                                                    : `(€${(exp.amount / exchangeRate).toFixed(2)})`}
                                                                            </span>
                                                                        )}
                                                                    </span>
                                                                </div>
                                                                <TransactionOptions
                                                                    transaction={exp}
                                                                    hidePay={true}
                                                                    onEdit={() => setEditingTx(exp)}
                                                                    onDelete={async () => {
                                                                        await confirm({
                                                                            title: 'Deletar transação',
                                                                            text: `Deseja deletar "${exp.name}"?`,
                                                                            confirmButtonText: 'Deletar',
                                                                            cancelButtonText: 'Cancelar',
                                                                            onConfirm: async () => {
                                                                                await deleteDoc(doc(db, path, exp.id));
                                                                            }
                                                                        });
                                                                    }}
                                                                />
                                                            </li>
                                                        ))}
                                                    {filteredTransactions.filter(exp => {
                                                        const expDate = exp.date instanceof Date
                                                            ? exp.date
                                                            : exp.date && 'seconds' in exp.date
                                                                ? new Date(exp.date.seconds * 1000)
                                                                : new Date(exp.date);
                                                        return (
                                                            exp.categoryId === budget.categoryId &&
                                                            expDate.getMonth() === budgetMonth &&
                                                            expDate.getFullYear() === budgetYear
                                                        );
                                                    }).length === 0 && (
                                                            <li className="text-xs text-gray-500">Nenhum lançamento real</li>
                                                        )}
                                                </ul>
                                            )}
                                        </li>
                                    );
                                })}

                                {/* Expenses que não pertencem a budgets do mês/ano */}
                                {expenseWithoutBudget.map(tx => {
                                    const id = tx.id;
                                    const converted = tx.currency === 'EUR'
                                        ? fmt(tx.amount * exchangeRate, 'BRL')
                                        : fmt(tx.amount / exchangeRate, 'EUR');
                                    return (
                                        <li
                                            key={id}
                                            className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded gap-2"
                                            onMouseEnter={() => setHoveredTx(id)}
                                            onMouseLeave={() => setHoveredTx(null)}
                                        >
                                            <div className='flex w-fit items-center gap-2'>
                                                <span className={`${tx.paid && 'text-green-700 dark:text-green-400'}`}>{tx.date.toDate().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}</span>
                                                <span className={`${tx.paid && 'text-green-700 dark:text-green-400'}`}>{tx.name}</span>
                                            </div>
                                            {/* <span className={`${tx.paid && 'text-green-700 dark:text-green-400'}`}>{tx.name}</span> */}
                                            <div className="flex items-center space-x-2">
                                                <span className={`${tx.paid && 'text-green-700 dark:text-green-400'}`}>
                                                    {fmt(tx.amount, tx.currency)}
                                                    {hoveredTx === id && (
                                                        <span className={`ml-2 text-sm ${tx.paid ? 'text-green-700 dark:text-green-400' : 'text-gray-500 dark:text-gray-300'}`}>({converted})</span>
                                                    )}
                                                </span>
                                                <TransactionOptions
                                                    transaction={tx}
                                                    onEdit={() => setEditingTx(tx)}
                                                    onPay={() => {
                                                        setPayingTx({ ...tx, paidAt: Timestamp.fromDate(new Date(new Date().toISOString().split('T')[0])) })
                                                    }}
                                                    onDelete={async () => {
                                                        const ok = await confirm({
                                                            title: 'Delete transaction',
                                                            text: `Delete "${tx.name}"?`,
                                                            confirmButtonText: 'Delete',
                                                            cancelButtonText: 'Cancel',
                                                            onConfirm: () => deleteDoc(doc(db, path, tx.id)),
                                                            successMessage: `"${tx.name}" deleted!`,
                                                            errorMessage: `Error deleting transaction.`,
                                                        });
                                                        if (ok) {
                                                            try {
                                                                await deleteDoc(doc(db, path, tx.id));
                                                            } catch (err) {
                                                                console.error('Error deleting transaction:', err);
                                                            }
                                                        }
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            // Lista de incomes
                            <ul className="mt-4 space-y-2">
                                {filteredTransactions.map(tx => {
                                    const id = tx.id;
                                    const converted = tx.currency === 'EUR'
                                        ? fmt(tx.amount * exchangeRate, 'BRL')
                                        : fmt(tx.amount / exchangeRate, 'EUR');
                                    return (
                                        <li
                                            key={id}
                                            className="flex justify-between items-center p-2 bg-green-100 dark:bg-green-900 rounded"
                                            onMouseEnter={() => setHoveredTx(id)}
                                            onMouseLeave={() => setHoveredTx(null)}
                                        >
                                            <div className='flex w-fit items-center gap-4'>
                                                <span className="font-semibold">{tx.date.toDate().toLocaleDateString(undefined, { day: '2-digit', month: '2-digit' })}</span>
                                                <span className="font-semibold">{tx.name}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span>
                                                    {fmt(tx.amount, tx.currency)}
                                                    {hoveredTx === id && (
                                                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-300">({converted})</span>
                                                    )}
                                                </span>
                                                <TransactionOptions
                                                    transaction={tx}
                                                    onEdit={() => setEditingTx(tx)}
                                                    onDelete={async () => {
                                                        await confirm({
                                                            title: 'Delete income',
                                                            text: `Delete "${tx.name}"?`,
                                                            confirmButtonText: 'Delete',
                                                            cancelButtonText: 'Cancel',
                                                            onConfirm: async () => {
                                                                await deleteDoc(doc(db, path, tx.id));
                                                            }
                                                        });
                                                    }}
                                                />
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        )
                    )}
                </>}
        </Container>
    );
};
