// src/components/Documents/DocumentList.tsx
import React, { useEffect, useState } from 'react';
import { listDocuments, DocumentMeta } from '../../services/documents';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
    type: 'personal' | 'invoices' | 'receipts';
}

export const DocumentList: React.FC<Props> = ({ type }) => {
    const { user } = useAuth();
    const [docs, setDocs] = useState<DocumentMeta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const list = await listDocuments(type, {});
            // filtrar permissions: 
            const filtered = list.filter(d =>
                d.isPublic ||
                d.ownerEmail === user!.email ||
                d.sharedWith.includes(user!.uid)
            );
            setDocs(filtered);
            setLoading(false);
        })();
    }, [type, user]);

    if (loading) return <p>Loading documents…</p>;
    if (docs.length === 0) return <p>No documents found.</p>;

    return (
        <table className="w-full table-auto border-collapse">
            <thead>
                <tr>
                    <th className="border p-2">Name</th>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">Owner</th>
                    <th className="border p-2">Download</th>
                </tr>
            </thead>
            <tbody>
                {docs.map(d => (
                    <tr key={d.id}>
                        <td className="border p-2">{d.name}</td>
                        <td className="border p-2">{d.date.toDate().toLocaleDateString()}</td>
                        <td className="border p-2">{d.ownerEmail}</td>
                        <td className="border p-2 text-center">
                            <a
                                href={d.downloadURL}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-500 hover:underline cursor-pointer"
                            >
                                Download
                            </a>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};
