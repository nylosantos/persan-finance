import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useMonthlyAggregates } from '../../hooks/useMonthlyAggregates';

type Props = {
    familyId: string;
};

export const FinancialDashboard: React.FC<Props> = ({ familyId }) => {
    const { data, loading } = useMonthlyAggregates(familyId);

    if (loading) return <p>Loading charts...</p>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Finance Overview</h2>

            <div className="w-full h-72 bg-white dark:bg-gray-800 p-4 rounded shadow">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data}>
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="income" fill="#4ade80" name="Receitas" />
                        <Bar dataKey="expense" fill="#f87171" name="Despesas" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
