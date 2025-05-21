import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';

export const RegisterPage: React.FC = () => {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const userCredential = await signup(email, password);
            // Cria o documento do usuário no Firestore
            await setDoc(doc(db, 'users', userCredential.uid), {
                name,
                email,
                createdAt: new Date(),
                favouriteFamilyId: null,
            });
            navigate('/');
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-20 p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-2xl mb-4 text-center text-gray-900 dark:text-gray-100">Registrar</h2>
            {error && <p className="text-red-500 mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    placeholder="Nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full p-2 rounded dark:bg-gray-700 text-gray-500 dark:text-gray-100"
                    required
                />
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
                <button type="submit" className="w-full p-2 bg-primary text-white rounded">Cadastrar</button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                Já tem conta?{' '}
                <Link to="/login" className="text-primary hover:underline">
                    Faça login
                </Link>
            </p>
        </div>
    );
};