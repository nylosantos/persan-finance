import { useEffect, useState } from "react";

export default function ThemeSelector() {
    const [darkMode, setDarkMode] = useState(false);

    // Detecta o tema padrão do dispositivo
    useEffect(() => {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(prefersDark);
        document.documentElement.classList.toggle('dark', prefersDark);
    }, []);

    // Alterna entre os temas
    const toggleTheme = () => {
        setDarkMode(!darkMode);
        document.documentElement.classList.toggle('dark', !darkMode);
    };
    return (
        <div
            onClick={toggleTheme}
            className="absolute right-4 top-1/2 -translate-y-1/2 md:top-4 md:translate-y-0 flex items-center gap-2 px-4 py-2 bg-gray-300 dark:bg-gray-800 hover:bg-gray-300/60 dark:hover:bg-gray-800/60 text-gray-800 dark:text-gray-200 rounded-lg shadow-md cursor-pointer transition duration-200"
        >
            {darkMode ? '🌙' : '☀️'}
            <span className="hidden md:inline">
                {darkMode ? 'Dark' : 'Light'}
            </span>
        </div>
    );
}