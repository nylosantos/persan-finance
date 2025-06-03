/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/Documents/DocumentUpload.tsx
import React, { useEffect, useState } from 'react';
import { uploadDocument } from '../../services/documents';
import { Timestamp } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { useParams } from 'react-router-dom';
import { FileOrPhotoInput } from '../Layout/FileOrPhotoInput';


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
    // const fileInputRef = useRef<HTMLInputElement>(null);

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
        <form onSubmit={handleSubmit} className="space-y-4 p-2 bg-white dark:bg-gray-800 rounded">
            <div className="flex flex-col md:flex-row space-x-2">
                <select value={type} onChange={e => setType(e.target.value as any)} className="flex w-full md:w-auto p-2 rounded dark:bg-gray-800">
                    <option value="personal">Documento Pessoal</option>
                    <option value="invoices">Nota Fiscal</option>
                    <option value="receipts">Recibo</option>
                </select>
                <input
                    type="text"
                    placeholder="Identificação do Documento"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="flex-1 md:w-full p-2 mt-4 md:mt-0 rounded"
                    required
                />
            </div>

            <div className="flex flex-col md:flex-row space-x-2">
                <input
                    type="date"
                    value={date}
                    onChange={e => setDate(e.target.value)}
                    className="custom-date-picker w-full md:w-auto bg-transparent placeholder-gray-400 dark:placeholder-white rounded p-2 cursor-pointer focus:outline-none"
                    required
                />
                <input
                    type="text"
                    placeholder="Compartilhar com (IDs de usuarios, separados por vírgula)"
                    value={sharedWith}
                    onChange={e => setSharedWith(e.target.value)}
                    className="flex w-full md:flex-1 p-2 rounded mt-4 md:mt-0"
                />
                <label className="flex items-center space-x-2 mt-4 md:mt-0">
                    <input
                        type="checkbox"
                        checked={isPublic}
                        onChange={e => setIsPublic(e.target.checked)}
                    />
                    <span>Arquivo publico?</span>
                </label>
                {/* <input
                    type="file"
                    accept="image/*,application/pdf"
                    capture="environment"
                    onChange={e => setFile(e.target.files![0])}
                    className="p-2 border rounded mt-4 md:mt-2"
                    required
                /> */}
            </div>

            {/* <div className="flex flex-col md:flex-row space-x-2 md:items-center">
                <div className="flex flex-col w-full">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,application/pdf"
                        capture="environment"
                        onChange={e => setFile(e.target.files![0])}
                        className="hidden"
                        id="custom-file-upload"
                        required
                    />
                    <label
                        htmlFor="custom-file-upload"
                        className="p-2 mt-2 md:mt-2 border rounded bg-gray-100 dark:bg-gray-700 cursor-pointer text-center"
                    >
                        {file ? `Selecionado: ${file.name}` : 'Selecionar arquivo'}
                    </label>
                </div>
            </div> */}

            <FileOrPhotoInput file={file} setFile={setFile} />

            {error && <p className="text-red-500">{error}</p>}
            <button
                type="submit"
                className="w-full p-2 bg-gray-300 dark:bg-gray-700 rounded"
                disabled={loading}
            >
                {loading ? 'Uploading…' : 'Upload Document'}
            </button>
        </form>
    );
};
