// src/hooks/useExchangeRate.ts
import { useState, useEffect } from 'react';
import { getExchangeRate } from '../services/exchangeRate';

export function useExchangeRate(date: string) {
    const [rate, setRate] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        setLoading(true);
        getExchangeRate(date)
            .then(r => setRate(r))
            .catch(err => setError(err))
            .finally(() => setLoading(false));
    }, [date]);

    // console.log('useExchangeRate', { date, rate, loading, error });

    return { rate, loading, error };
}
