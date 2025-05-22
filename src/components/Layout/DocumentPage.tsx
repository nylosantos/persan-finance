import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { DocumentUpload } from '../Documents/DocumentUpload';
import { DocumentList } from '../Documents/DocumentList';

const VALID_TYPES = ['personal', 'invoices', 'receipts'] as const;
type DocType = typeof VALID_TYPES[number];

export const DocumentPage: React.FC = () => {
    const { type } = useParams<{ type: string }>();
    if (!type || !VALID_TYPES.includes(type as DocType)) {
        // se o tipo for inválido, redireciona
        return <Navigate to="/" />;
    }
    const docType = type as DocType;

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {docType === 'personal' ? 'Documentos Pessoais' :
                    docType === 'invoices' ? 'Notas Fiscais' :
                        'Receipts'}
            </h1>

            {/* Formulário de upload */}
            <DocumentUpload />

            {/* Listagem filtrada pelo tipo */}
            <DocumentList type={docType} />
        </div>
    );
};
