import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-2xl mb-4 text-center text-gray-900 dark:text-gray-100">Login</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 rounded dark:bg-gray-700 text-gray-500 dark:text-gray-100"
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full p-2 rounded dark:bg-gray-700 text-gray-500 dark:text-gray-100"
                    required
                />
                <button type="submit" className="w-full p-2 bg-primary text-white rounded">Entrar</button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Não tem conta?{' '}
                <Link to="/register" className="text-primary hover:underline">
                    Registre-se
                </Link>
            </p>
        </div>
    );
};