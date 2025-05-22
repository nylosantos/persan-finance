// src/services/family.ts
// Serviços para criação, listagem e associação de famílias no Firestore

import { db } from './firebase';
import {
    collection,
    doc,
    setDoc,
    addDoc,
    getDocs,
    query,
    collectionGroup,
    where,
    getDoc, DocumentData
} from 'firebase/firestore';

/**
 * Cria uma nova família e associa o usuário como owner e membro.
 * Retorna o ID da família criada.
 */
export async function createFamily(name: string, userId: string): Promise<string> {
    const famRef = await addDoc(collection(db, 'families'), {
        name,
        ownerId: userId,
        createdAt: new Date(),
    });
    const familyId = famRef.id;

    // adiciona subcoleção members
    await setDoc(doc(db, `families/${familyId}/members/${userId}`), {
        userId,
        canView: true,
        canEdit: true,
    });

    return familyId;
}

/**
 * Busca famílias nas quais o usuário é membro.
 */
export async function listUserFamilies(userId: string): Promise<{ id: string; name: string }[]> {
    // Consulta todos os docs 'members' cujo documentId == userId e canView == true
    const memsQuery = query(
        collectionGroup(db, 'members'),
        // where(documentId(), '==', userId),
        where('userId', '==', userId),
        where('canView', '==', true)
    );
    const memsSnap = await getDocs(memsQuery);

    const results: { id: string; name: string }[] = [];
    await Promise.all(
        memsSnap.docs.map(async memDoc => {
            const famRef = memDoc.ref.parent.parent;  // sobe para families/{familyId}
            if (famRef) {
                const famSnap = await getDoc(famRef);
                if (famSnap.exists()) {
                    const data = famSnap.data() as DocumentData;
                    results.push({ id: famRef.id, name: data.name });
                }
            }
        })
    );
    return results;
}

/**
 * Associa um usuário a uma família existente por código.
 */
export async function joinFamily(familyId: string, userId: string, canEdit = false): Promise<void> {
    await setDoc(doc(db, `families/${familyId}/members/${userId}`), {
        userId,
        canView: true,
        canEdit,
    });
}
