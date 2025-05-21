import { doc, setDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

export async function setFavouriteFamily(userId: string, familyId: string) {
    await setDoc(doc(db, 'users', userId), { favouriteFamilyId: familyId }, { merge: true });
}