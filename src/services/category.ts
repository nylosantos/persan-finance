import { addDoc, collection } from "firebase/firestore";
import { db } from "./firebase";

export async function createCategory(name: string, scope: 'family' | 'personal', ownerId?: string) {
    const ref = await addDoc(collection(db, 'categories'), { name, scope, ownerId, createdAt: new Date() });
    return { id: ref.id, name };
}
