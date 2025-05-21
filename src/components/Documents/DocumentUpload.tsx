// src/components/Documents/DocumentUpload.tsx
import React, { useEffect, useState } from 'react';
import { uploadDocument, DocumentMeta } from '../../services/documents';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';


export const DocumentUpload: React.FC = () => {
    const { user } = useAuth();
    const { type: routeType } = useParams<{ type: string }>();
    // Valida o parâmetro de rota ou usa 'personal' como fallback
    // const initialType = ['personal', 'invoices', 'receipts'].includes(routeType!)
    //     ? (routeType! as 'personal' | 'invoices' | 'receipts')
    //     : 'personal';

    // Função de validação do tipo
    const isValid = (v: string): v is 'personal' | 'invoices' | 'receipts' =>
        ['personal', 'invoices', 'receipts'].includes(v);

    // Estado para o select
    const [type, setType] = useState<'personal' | 'invoices' | 'receipts'>(
        isValid(routeType ?? '') ? (routeType as 'personal' | 'invoices' | 'receipts') : 'personal'
    );

    // Quando `routeType` mudar, atualiza o estado
    useEffect(() => {
        if (routeType && isValid(routeType)) {
            setType(routeType);
        }
    }, [routeType]);
    const [name, setName] = useState('');
    const [date, setDate] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isPublic, setIsPublic] = useState(false);
    const [sharedWith, setSharedWith] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name || !date || !user) return;
        setLoading(true);
        setError(null);
        try {
            await uploadDocument(file, {
                type,
                name,
                date: Timestamp.fromDate(new Date(date)),
                ownerEmail: user.email!,
                isPublic,
                sharedWith: sharedWith.split(',').map(s => s.trim()).filter(Boolean),
            });
            // limpa form
            setName(''); setDate(''); setFile(null); setSharedWith('');
            alert('Document uploaded!');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-white dark:bg-gray-800 rounded">
            <div className="flex space-x-2">
                <select value={type} onChange={e => setType(e.target.value as any)} className="p-2 border rounded">
                    <option value="personal">Personal Doc</option>
                    <option value="invoices">Invoice</option>
                    <option value="receipts">Receipt</option>
                </select>
                <input
                    type="text"
                    placeholder="Document Name"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 p-2 border rounded"
                    required
                />
            </div>

            <div className="flex space-x-2">
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="p-2 border rounded"
                    required
                />
                <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={e => setFile(e.target.files![0])}
                    className="p-2 border rounded"
                    required
                />

            </div>

            <div className="flex space-x-2 items-center">
                <label className="flex items-center space-x-1">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                    />
                    <span>Public</span>
                </label>
                <input
                    type="text"
                    placeholder="Shared with (user UIDs, comma-separated)"
                    value={sharedWith}
                    onChange={e => setSharedWith(e.target.value)}
                    className="flex-1 p-2 border rounded"
                />
            </div>

            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded disabled:opacity-50"
                disabled={loading}
            >
                {loading ? 'Uploading…' : 'Upload Document'}
            </button>
        </form>
    );
};
