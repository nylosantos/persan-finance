import { useEffect, useState } from "react";
import { FamilySelector } from '../FamilySelector';
import { MenuButtonWithDrawer } from './MenuButtonWithDrawer';

export const Header: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header
            className="fixed left-0 right-0 top-0 h-safe-header pt-safe z-40 flex items-center justify-between p-4 bg-transparent"
        >
            {/* Fundo animado */}
            <div
                className={`
                    absolute inset-0 z-[-1] pointer-events-none
                    bg-gradient-to-b from-black/50 via-black/30 to-black/0
                    backdrop-blur-xs
                    transition-opacity duration-500
                    ${scrolled ? "opacity-100" : "opacity-0"}
                `}
            />
            {/* Esquerda: Menu */}
            <MenuButtonWithDrawer />

            {/* Centro: Logo (adicione depois) */}
            <div className="flex-1 flex justify-center">
                {/* <Logo /> */}
            </div>

            {/* Direita: FamilySelector ou outro botão */}
            <FamilySelector />
        </header>
    );
};