// src/services/exchangeRate.ts
// Serviço para obter e armazenar a taxa EUR→BRL em Firestore

import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

/**
 * Obtém a taxa de câmbio para a data (YYYY-MM-DD).
 * Se já existir em Firestore, retorna diretamente.
 * Caso contrário, busca na API exchangerate.host, grava no Firestore e retorna.
 */
export async function getExchangeRate(date: string): Promise<number> {
    const ref = doc(db, 'exchangeRates', date);
    const snap = await getDoc(ref);
    if (snap.exists()) {
        return snap.data().rate as number;
    }

    // Busca na API externa
    const response = await fetch(
        `https://api.frankfurter.app/${date}?from=EUR&to=BRL`
    );
    if (!response.ok) throw new Error('Failed fetching exchange rate');
    const data = await response.json();

    const rate = data.rates.BRL;
    
    // Armazena no Firestore
    await setDoc(ref, { rate, fetchedAt: new Date() });
    return rate;
}
