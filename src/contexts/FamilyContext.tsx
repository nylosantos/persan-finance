// src/contexts/FamilyContext.tsx
// Contexto para gerenciar o familyId (projeto familiar) globalmente

import { createContext, useContext, useState, ReactNode } from 'react';

interface FamilyContextType {
    familyId: string;
    setFamilyId: (id: string) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

export const FamilyProvider = ({ children }: { children: ReactNode }) => {
    // Inicialmente pode vir de localStorage ou ser vazio
    const [familyId, setFamilyId] = useState<string>('');

    return (
        <FamilyContext.Provider value={{ familyId, setFamilyId }}>
            {children}
        </FamilyContext.Provider>
    );
};

export function useFamily() {
    const context = useContext(FamilyContext);
    if (!context) throw new Error('useFamily must be used within FamilyProvider');
    return context;
}
