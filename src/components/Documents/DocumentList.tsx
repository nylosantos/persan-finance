// // src/components/Documents/DocumentList.tsx
// import React, { useEffect, useState } from 'react';
// import { listDocuments, DocumentMeta } from '../../services/documents';
// import { useAuth } from '../../contexts/AuthContext';

// interface Props {
//     type: 'personal' | 'invoices' | 'receipts';
// }

// export const DocumentList: React.FC<Props> = ({ type }) => {
//     const { user } = useAuth();
//     const [docs, setDocs] = useState<DocumentMeta[]>([]);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         (async () => {
//             setLoading(true);
//             const list = await listDocuments(type, {});
//             // filtrar permissions: 
//             const filtered = list.filter(d =>
//                 d.isPublic ||
//                 d.ownerEmail === user!.email ||
//                 d.sharedWith.includes(user!.uid)
//             );
//             setDocs(filtered);
//             setLoading(false);
//         })();
//     }, [type, user]);

//     if (loading) return <p>Loading documents…</p>;
//     if (docs.length === 0) return <p>No documents found.</p>;

//     return (
//         <table className="w-full table-auto border-collapse">
//             <thead>
//                 <tr>
//                     <th className="border p-2">Name</th>
//                     <th className="border p-2">Date</th>
//                     <th className="border p-2">Owner</th>
//                     <th className="border p-2">Download</th>
//                 </tr>
//             </thead>
//             <tbody>
//                 {docs.map(d => (
//                     <tr key={d.id}>
//                         <td className="border p-2">{d.name}</td>
//                         <td className="border p-2">{d.date.toDate().toLocaleDateString()}</td>
//                         <td className="border p-2">{d.ownerEmail}</td>
//                         <td className="border p-2 text-center">
//                             <a
//                                 href={d.downloadURL}
//                                 target="_blank"
//                                 rel="noreferrer"
//                                 className="text-blue-500 hover:underline cursor-pointer"
//                             >
//                                 Download
//                             </a>
//                         </td>
//                     </tr>
//                 ))}
//             </tbody>
//         </table>
//     );
// };
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
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const list = await listDocuments(type, {});
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
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {docs.map(d => (
                <li key={d.id} className="flex flex-col w-full justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded gap-2">
                    <div className="flex w-full items-center justify-between cursor-pointer" onClick={() => setExpanded(expanded === d.id ? null : d.id)}>
                        <span className="font-medium text-gray-900 dark:text-gray-100">{d.name}</span>
                        <a
                            href={d.downloadURL}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-xl hover:text-primary"
                            onClick={e => e.stopPropagation()}
                            title="Download"
                        >
                            ⬇️
                        </a>
                    </div>
                    {expanded === d.id && (
                        <div className="w-full mt-2 ml-2 text-sm text-gray-700 dark:text-gray-300">
                            <div>Data: {d.date.toDate().toLocaleDateString()}</div>
                            <div>Enviado por: {d.ownerEmail}</div>
                        </div>
                    )}
                </li>
            ))}
        </ul>
    );
};