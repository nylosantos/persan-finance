// Header.tsx
import { FamilySelector } from '../FamilySelector';
import { MenuButtonWithDrawer } from './MenuButtonWithDrawer';

export const Header: React.FC = () => (
    <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between p-4 pt-safe g-white dark:bg-gray-800 shadow">
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
