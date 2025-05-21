// src/services/documents.ts
import { db, storage } from './firebase';
import {
    collection,
    addDoc,
    query,
    where,
    getDocs,
    DocumentData,
    Timestamp,
    updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, updateMetadata } from 'firebase/storage';

export interface DocumentMeta {
    id: string;
    name: string;
    date: Timestamp;
    ownerEmail: string;
    isPublic: boolean;
    sharedWith: string[];  // UIDs
    downloadURL: string;
    type: 'personal' | 'invoices' | 'receipts';
}

/**
 * Faz upload do arquivo e cria o metadado no Firestore.
 */
export async function uploadDocument(
    file: File,
    meta: Omit<DocumentMeta, 'id' | 'downloadURL'>
): Promise<void> {
    // 1) cria documento na coleção correspondente
    const colName = `documents_${meta.type}`;             // e.g. documents_personal

    const docRef = await addDoc(collection(db, colName), {
        name: meta.name,
        date: meta.date,
        ownerEmail: meta.ownerEmail,
        isPublic: meta.isPublic,
        sharedWith: meta.sharedWith || [],
        type: meta.type,
        createdAt: Timestamp.now(),
    });

    // 2) faz upload do arquivo na Storage
    const storagePath = `documents/${meta.type}/${docRef.id}/${file.name}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    await updateMetadata(storageRef, {
        contentDisposition: 'attachment',
    });
    // 3) obtém URL e atualiza o documento de metadados
    const downloadURL = await getDownloadURL(storageRef);
    await addDoc(collection(db, colName, docRef.id, 'versions'), {
        downloadURL,
        fileName: file.name,
        uploadedAt: Timestamp.now(),
    });

    // opcional: gravar diretamente no documento principal também
    await updateDoc(docRef, { downloadURL, storagePath });
}

/**
 * Lista documentos de um tipo, com filtros.
 */
export async function listDocuments(
    type: DocumentMeta['type'],
    filters: { name?: string; date?: Timestamp; ownerEmail?: string } = {}
): Promise<DocumentMeta[]> {
    const colName = `documents_${type}`;                  // e.g. documents_invoices
    let q = query(collection(db, colName) as any);

    if (filters.name) {
        q = query(q, where('name', '==', filters.name));
    }
    if (filters.ownerEmail) {
        q = query(q, where('ownerEmail', '==', filters.ownerEmail));
    }
    if (filters.date) {
        q = query(q, where('date', '==', filters.date));
    }

    const snap = await getDocs(q);
    return snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as any)
    } as DocumentMeta));
}
