// Header.tsx
import { Navbar } from './Navbar';
import { FamilySelector } from '../FamilySelector';
import ThemeSelector from './ThemeSelector';

export const Header: React.FC = () => (
    <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow rounded-lg">
        <ThemeSelector />
        <Navbar />
        <FamilySelector />
    </header>
);
